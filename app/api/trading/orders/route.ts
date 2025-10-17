import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { orderSchema } from "@/lib/utils/validation";
import {
  withAuth,
  getUserAccount,
  createAuditLog,
  AuthErrors,
} from "@/lib/auth/server-utils";

export const GET = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const status = searchParams.get("status");
    const symbol = searchParams.get("symbol");

    // Build query
    const query: any = { userId: new ObjectId(user.id) };
    if (status) query.status = status;
    if (symbol) query.symbol = symbol.toUpperCase();

    // Get total count for pagination
    const totalCount = await db.collection("orders").countDocuments(query);

    // Fetch orders with pagination
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();

    // Validate request body
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const validated = validation.data;

    // Get user's active trading account
    const account = await getUserAccount(user.id);
    if (!account) {
      return NextResponse.json(AuthErrors.ACCOUNT_NOT_FOUND, { status: 400 });
    }

    // Check account status
    if (account.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Trading account is not active" },
        { status: 400 },
      );
    }

    // Calculate order value
    const orderValue = validated.quantity * (validated.price || 0);

    // Get current market price for market orders
    let estimatedValue = orderValue;
    if (validated.orderType === "MARKET") {
      const marketData = await db
        .collection("market_data")
        .findOne(
          { symbol: validated.symbol.toUpperCase() },
          { sort: { timestamp: -1 } },
        );

      const currentPrice = marketData?.price || validated.price || 100;
      estimatedValue = validated.quantity * currentPrice;
    }

    // Check buying power for buy orders
    if (validated.side === "BUY" && estimatedValue > account.buyingPower) {
      return NextResponse.json(
        { error: "Insufficient buying power" },
        { status: 400 },
      );
    }

    // Check position for sell orders
    if (validated.side === "SELL") {
      const existingPosition = await db.collection("positions").findOne({
        userId: new ObjectId(user.id),
        accountId: account._id,
        symbol: validated.symbol.toUpperCase(),
        status: "OPEN",
      });

      if (!existingPosition || existingPosition.quantity < validated.quantity) {
        return NextResponse.json(
          { error: "Insufficient shares to sell" },
          { status: 400 },
        );
      }
    }

    // Calculate commission (0.1% with $1 minimum)
    const commission = Math.max(estimatedValue * 0.001, 1.0);

    // Create order
    const order = {
      userId: new ObjectId(user.id),
      accountId: account._id,
      symbol: validated.symbol.toUpperCase(),
      assetClass: "STOCK",
      orderType: validated.orderType,
      side: validated.side,
      quantity: validated.quantity,
      filledQuantity: 0,
      remainingQuantity: validated.quantity,
      price: validated.price,
      stopPrice: validated.stopPrice,
      limitPrice: validated.limitPrice,
      timeInForce: validated.timeInForce || "GTC",
      status: "PENDING",
      commission,
      estimatedValue,
      placedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        userAgent: request.headers.get("user-agent"),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
    };

    // Insert order
    const result = await db.collection("orders").insertOne(order);
    const insertedOrder = { ...order, _id: result.insertedId };

    // Create audit log
    await createAuditLog(
      user.id,
      "ORDER_PLACED",
      "order",
      result.insertedId.toString(),
      {
        symbol: validated.symbol,
        side: validated.side,
        quantity: validated.quantity,
        orderType: validated.orderType,
        estimatedValue,
      },
      {
        accountId: account._id.toString(),
        commission,
      },
    );

    // For buy orders, reserve buying power
    if (validated.side === "BUY") {
      await db.collection("accounts").updateOne(
        { _id: account._id },
        {
          $inc: {
            buyingPower: -(estimatedValue + commission),
            pendingBuyValue: estimatedValue + commission,
          },
          $set: { updatedAt: new Date() },
        },
      );
    }

    // Send order to trading system for processing
    await processOrderForExecution(insertedOrder, db);

    return NextResponse.json(
      {
        order: insertedOrder,
        message: "Order placed successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
});

async function processOrderForExecution(order: any, db: any) {
  try {
    // Simulate order processing - in production this would connect to actual trading system
    if (order.orderType === "MARKET") {
      // Market orders execute immediately
      const marketData = await db
        .collection("market_data")
        .findOne({ symbol: order.symbol }, { sort: { timestamp: -1 } });

      const executionPrice = marketData?.price || order.price || 100;

      // Update order to filled status
      await db.collection("orders").updateOne(
        { _id: order._id },
        {
          $set: {
            status: "FILLED",
            filledQuantity: order.quantity,
            averageFillPrice: executionPrice,
            filledAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      // Create trade record
      await db.collection("trades").insertOne({
        orderId: order._id,
        userId: order.userId,
        accountId: order.accountId,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice,
        value: order.quantity * executionPrice,
        commission: order.commission,
        status: "FILLED",
        executedAt: new Date(),
        createdAt: new Date(),
      });
    } else {
      // Limit orders remain pending until price conditions are met
      console.log(`Limit order ${order._id} placed and pending execution`);
    }
  } catch (error) {
    console.error("Error processing order:", error);
    // Update order to failed status
    await db.collection("orders").updateOne(
      { _id: order._id },
      {
        $set: {
          status: "REJECTED",
          rejectionReason: "System error during processing",
          updatedAt: new Date(),
        },
      },
    );
  }
}

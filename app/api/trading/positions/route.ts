import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  withAuth,
  getUserAccount,
  createAuditLog,
  AuthErrors,
  verifyResourceOwnership,
} from "@/lib/auth/server-utils";

export const GET = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const status = searchParams.get("status") || "OPEN";
    const symbol = searchParams.get("symbol");
    const assetClass = searchParams.get("assetClass");
    const sortBy = searchParams.get("sortBy") || "openedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Get user's trading account
    const account = await getUserAccount(user.id);
    if (!account) {
      return NextResponse.json(AuthErrors.ACCOUNT_NOT_FOUND, { status: 400 });
    }

    // Build query
    const query: any = {
      userId: new ObjectId(user.id),
      accountId: account._id,
    };

    if (status) {
      query.status = status;
    }
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }
    if (assetClass) {
      query.assetClass = assetClass;
    }

    // Get total count for pagination
    const totalCount = await db.collection("positions").countDocuments(query);

    // Fetch positions with pagination
    const positions = await db
      .collection("positions")
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich positions with current market data and P&L calculations
    const enrichedPositions = await Promise.all(
      positions.map(async (position: any) => {
        // Get current market data
        const marketData = await db
          .collection("market_data")
          .findOne({ symbol: position.symbol }, { sort: { timestamp: -1 } });

        // Get security details
        const security = await db
          .collection("securities")
          .findOne({ symbol: position.symbol });

        const currentPrice = marketData?.price || position.averagePrice || 0;
        const costBasis = position.quantity * position.averagePrice;
        const currentValue = position.quantity * currentPrice;
        const unrealizedPnL = currentValue - costBasis;
        const unrealizedPnLPercent =
          costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

        // Calculate realized P&L from related trades
        const realizedTrades = await db
          .collection("trades")
          .find({
            positionId: position._id,
            status: "FILLED",
            side: "SELL",
          })
          .toArray();

        const realizedPnL = realizedTrades.reduce(
          (sum: number, trade: any) => sum + (trade.pnl || 0),
          0,
        );

        // Calculate total return including dividends
        const dividends = await db
          .collection("dividends")
          .find({
            userId: new ObjectId(user.id),
            symbol: position.symbol,
            exDate: {
              $gte: position.openedAt,
              $lte:
                position.status === "CLOSED" ? position.closedAt : new Date(),
            },
          })
          .toArray();

        const totalDividends = dividends.reduce(
          (sum: number, dividend: any) => sum + (dividend.amount || 0),
          0,
        );

        // Day change calculation
        const previousClose = marketData?.previousClose || currentPrice;
        const dayChange = (currentPrice - previousClose) * position.quantity;
        const dayChangePercent =
          previousClose > 0
            ? ((currentPrice - previousClose) / previousClose) * 100
            : 0;

        return {
          id: position._id,
          symbol: position.symbol,
          companyName: security?.companyName || position.symbol,
          assetClass: position.assetClass || "STOCK",
          status: position.status,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          currentPrice,
          costBasis,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent,
          realizedPnL,
          totalDividends,
          totalReturn: unrealizedPnL + realizedPnL + totalDividends,
          totalReturnPercent:
            costBasis > 0
              ? ((unrealizedPnL + realizedPnL + totalDividends) / costBasis) *
                100
              : 0,
          dayChange,
          dayChangePercent,
          openedAt: position.openedAt,
          closedAt: position.closedAt,
          holdingPeriod: position.closedAt
            ? Math.floor(
                (position.closedAt.getTime() - position.openedAt.getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : Math.floor(
                (new Date().getTime() - position.openedAt.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
          sector: security?.sector,
          industry: security?.industry,
          marketCap: security?.marketCap,
          peRatio: security?.peRatio,
          beta: security?.beta,
          dividend: security?.dividend,
          dividendYield: security?.dividendYield,
          volume: marketData?.volume || 0,
          avgVolume: marketData?.avgVolume || 0,
          high52Week: security?.high52Week,
          low52Week: security?.low52Week,
          lastUpdated: marketData?.timestamp,
        };
      }),
    );

    // Calculate summary statistics
    const summary = {
      totalPositions: enrichedPositions.length,
      totalValue: enrichedPositions.reduce(
        (sum, pos) => sum + pos.currentValue,
        0,
      ),
      totalCostBasis: enrichedPositions.reduce(
        (sum, pos) => sum + pos.costBasis,
        0,
      ),
      totalUnrealizedPnL: enrichedPositions.reduce(
        (sum, pos) => sum + pos.unrealizedPnL,
        0,
      ),
      totalRealizedPnL: enrichedPositions.reduce(
        (sum, pos) => sum + pos.realizedPnL,
        0,
      ),
      totalDividends: enrichedPositions.reduce(
        (sum, pos) => sum + pos.totalDividends,
        0,
      ),
      totalDayChange: enrichedPositions.reduce(
        (sum, pos) => sum + pos.dayChange,
        0,
      ),
      winnersCount: enrichedPositions.filter((pos) => pos.unrealizedPnL > 0)
        .length,
      losersCount: enrichedPositions.filter((pos) => pos.unrealizedPnL < 0)
        .length,
    };

    summary.totalUnrealizedPnL =
      summary.totalCostBasis > 0
        ? (summary.totalUnrealizedPnL / summary.totalCostBasis) * 100
        : 0;

    summary.totalDayChange =
      summary.totalValue > 0
        ? (summary.totalDayChange / summary.totalValue) * 100
        : 0;

    // Asset allocation
    const allocationByAssetClass = enrichedPositions.reduce((acc: any, pos) => {
      const assetClass = pos.assetClass;
      if (!acc[assetClass]) {
        acc[assetClass] = { value: 0, count: 0 };
      }
      acc[assetClass].value += pos.currentValue;
      acc[assetClass].count += 1;
      return acc;
    }, {});

    const allocation = Object.entries(allocationByAssetClass).map(
      ([assetClass, data]: [string, any]) => ({
        assetClass,
        value: data.value,
        count: data.count,
        percentage:
          summary.totalValue > 0 ? (data.value / summary.totalValue) * 100 : 0,
      }),
    );

    return NextResponse.json({
      positions: enrichedPositions,
      summary,
      allocation,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();
    const { orderId, executionDetails } = body;

    if (!orderId || !executionDetails) {
      return NextResponse.json(
        { error: "Order ID and execution details are required" },
        { status: 400 },
      );
    }

    // Get the order and verify ownership
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(user.id),
      status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not executable" },
        { status: 404 },
      );
    }

    // Get user's trading account
    const account = await getUserAccount(user.id);
    if (!account) {
      return NextResponse.json(AuthErrors.ACCOUNT_NOT_FOUND, { status: 400 });
    }

    const {
      executedQuantity,
      executedPrice,
      commission = 0,
      executedAt = new Date(),
    } = executionDetails;

    // Validate execution details
    if (executedQuantity <= 0 || executedPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid execution quantity or price" },
        { status: 400 },
      );
    }

    if (executedQuantity > order.quantity - (order.filledQuantity || 0)) {
      return NextResponse.json(
        { error: "Execution quantity exceeds remaining order quantity" },
        { status: 400 },
      );
    }

    // Handle position creation or update
    let position;
    let positionAction;

    if (order.side === "BUY") {
      // Check for existing position
      const existingPosition = await db.collection("positions").findOne({
        userId: new ObjectId(user.id),
        accountId: account._id,
        symbol: order.symbol,
        status: "OPEN",
      });

      if (existingPosition) {
        // Update existing position
        const newQuantity = existingPosition.quantity + executedQuantity;
        const newCostBasis =
          existingPosition.quantity * existingPosition.averagePrice +
          executedQuantity * executedPrice;
        const newAveragePrice = newCostBasis / newQuantity;

        await db.collection("positions").updateOne(
          { _id: existingPosition._id },
          {
            $set: {
              quantity: newQuantity,
              averagePrice: newAveragePrice,
              costBasis: newCostBasis,
              updatedAt: new Date(),
            },
            $addToSet: {
              transactions: {
                type: "BUY",
                quantity: executedQuantity,
                price: executedPrice,
                commission,
                executedAt,
                orderId: order._id,
              },
            },
          },
        );

        position = { ...existingPosition, _id: existingPosition._id };
        positionAction = "UPDATED";
      } else {
        // Create new position
        const newPosition = {
          userId: new ObjectId(user.id),
          accountId: account._id,
          symbol: order.symbol,
          assetClass: order.assetClass || "STOCK",
          quantity: executedQuantity,
          averagePrice: executedPrice,
          costBasis: executedQuantity * executedPrice,
          status: "OPEN",
          openedAt: executedAt,
          createdAt: new Date(),
          updatedAt: new Date(),
          transactions: [
            {
              type: "BUY",
              quantity: executedQuantity,
              price: executedPrice,
              commission,
              executedAt,
              orderId: order._id,
            },
          ],
        };

        const result = await db.collection("positions").insertOne(newPosition);
        position = { ...newPosition, _id: result.insertedId };
        positionAction = "CREATED";
      }
    } else {
      // SELL order - reduce or close position
      const existingPosition = await db.collection("positions").findOne({
        userId: new ObjectId(user.id),
        accountId: account._id,
        symbol: order.symbol,
        status: "OPEN",
      });

      if (!existingPosition) {
        return NextResponse.json(
          { error: "No open position found for this symbol" },
          { status: 400 },
        );
      }

      if (executedQuantity > existingPosition.quantity) {
        return NextResponse.json(
          { error: "Cannot sell more shares than owned" },
          { status: 400 },
        );
      }

      // Calculate P&L for this sale
      const existingPosWithPrice = existingPosition as any;
      const avgPrice = existingPosWithPrice.averagePrice || 0;
      const salePnL =
        (executedPrice - avgPrice) * executedQuantity - commission;

      const newQuantity = existingPosition.quantity - executedQuantity;

      if (newQuantity === 0) {
        // Close position
        await db.collection("positions").updateOne(
          { _id: existingPosition._id },
          {
            $set: {
              quantity: 0,
              status: "CLOSED",
              closedAt: executedAt,
              realizedPnL: (existingPosition.realizedPnL || 0) + salePnL,
              updatedAt: new Date(),
            },
            $addToSet: {
              transactions: {
                type: "SELL",
                quantity: executedQuantity,
                price: executedPrice,
                commission,
                pnl: salePnL,
                executedAt,
                orderId: order._id,
              },
            },
          },
        );
        positionAction = "CLOSED";
      } else {
        // Reduce position
        const existingPosWithPrice = existingPosition as any;
        const newCostBasis = newQuantity * existingPosWithPrice.averagePrice;

        await db.collection("positions").updateOne(
          { _id: existingPosition._id },
          {
            $set: {
              quantity: newQuantity,
              costBasis: newCostBasis,
              realizedPnL: (existingPosition.realizedPnL || 0) + salePnL,
              updatedAt: new Date(),
            },
            $addToSet: {
              transactions: {
                type: "SELL",
                quantity: executedQuantity,
                price: executedPrice,
                commission,
                pnl: salePnL,
                executedAt,
                orderId: order._id,
              },
            },
          },
        );
        positionAction = "REDUCED";
      }

      position = { ...existingPosition, _id: existingPosition._id };
    }

    // Create trade record
    const trade = {
      userId: new ObjectId(user.id),
      accountId: account._id,
      orderId: order._id,
      positionId: position._id,
      symbol: order.symbol,
      side: order.side,
      quantity: executedQuantity,
      price: executedPrice,
      value: executedQuantity * executedPrice,
      commission,
      pnl:
        order.side === "SELL"
          ? (executedPrice - (position as any).averagePrice) *
              executedQuantity -
            commission
          : 0,
      status: "FILLED",
      executedAt,
      createdAt: new Date(),
    };

    const tradeResult = await db.collection("trades").insertOne(trade);

    // Update order status
    const newFilledQuantity = (order.filledQuantity || 0) + executedQuantity;
    const orderStatus =
      newFilledQuantity >= order.quantity ? "FILLED" : "PARTIALLY_FILLED";

    await db.collection("orders").updateOne(
      { _id: order._id },
      {
        $set: {
          filledQuantity: newFilledQuantity,
          remainingQuantity: order.quantity - newFilledQuantity,
          status: orderStatus,
          lastFillAt: executedAt,
          updatedAt: new Date(),
        },
        $addToSet: {
          fills: {
            quantity: executedQuantity,
            price: executedPrice,
            commission,
            executedAt,
            tradeId: tradeResult.insertedId,
          },
        },
      },
    );

    // Update account balances
    if (order.side === "BUY") {
      // Release reserved funds and update equity
      const executionCost = executedQuantity * executedPrice + commission;
      await db.collection("accounts").updateOne(
        { _id: account._id },
        {
          $inc: {
            equity: executedQuantity * executedPrice,
            pendingBuyValue: -executionCost,
          },
          $set: { updatedAt: new Date() },
        },
      );
    } else {
      // Add cash from sale
      const saleProceeds = executedQuantity * executedPrice - commission;
      await db.collection("accounts").updateOne(
        { _id: account._id },
        {
          $inc: {
            cash: saleProceeds,
            buyingPower: saleProceeds,
            equity: -(executedQuantity * executedPrice),
          },
          $set: { updatedAt: new Date() },
        },
      );
    }

    // Create audit log
    await createAuditLog(
      user.id,
      "POSITION_TRANSACTION",
      "position",
      position._id.toString(),
      {
        action: positionAction,
        symbol: order.symbol,
        side: order.side,
        quantity: executedQuantity,
        price: executedPrice,
        commission,
        orderId: order._id.toString(),
      },
      {
        tradeId: tradeResult.insertedId.toString(),
        accountId: account._id.toString(),
      },
    );

    return NextResponse.json(
      {
        message: `Position ${positionAction.toLowerCase()} successfully`,
        position: {
          id: position._id,
          symbol: (position as any).symbol || order.symbol,
          action: positionAction,
        },
        trade: {
          id: tradeResult.insertedId,
          ...trade,
        },
        order: {
          id: order._id,
          status: orderStatus,
          filledQuantity: newFilledQuantity,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating/updating position:", error);
    return NextResponse.json(
      { error: "Failed to process position transaction" },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();
    const { positionId, updates } = body;

    if (!positionId || !updates) {
      return NextResponse.json(
        { error: "Position ID and updates are required" },
        { status: 400 },
      );
    }

    // Verify position ownership
    const hasOwnership = await verifyResourceOwnership(
      "positions",
      positionId,
      user.id,
    );

    if (!hasOwnership) {
      return NextResponse.json(
        { error: "Position not found or access denied" },
        { status: 404 },
      );
    }

    // Only allow specific fields to be updated
    const allowedUpdates: any = {};

    if (updates.notes !== undefined) {
      allowedUpdates.notes = updates.notes;
    }

    if (updates.alerts !== undefined) {
      // Validate alerts structure
      if (updates.alerts.priceAlerts) {
        for (const alert of updates.alerts.priceAlerts) {
          if (!alert.price || !alert.condition || !alert.type) {
            return NextResponse.json(
              { error: "Invalid alert configuration" },
              { status: 400 },
            );
          }
        }
      }
      allowedUpdates.alerts = updates.alerts;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 },
      );
    }

    allowedUpdates.updatedAt = new Date();

    await db
      .collection("positions")
      .updateOne({ _id: new ObjectId(positionId) }, { $set: allowedUpdates });

    // Create audit log
    await createAuditLog(
      user.id,
      "POSITION_UPDATED",
      "position",
      positionId,
      allowedUpdates,
      { updatedFields: Object.keys(allowedUpdates) },
    );

    return NextResponse.json({
      message: "Position updated successfully",
    });
  } catch (error) {
    console.error("Error updating position:", error);
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 },
    );
  }
});

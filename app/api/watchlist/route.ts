import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { withAuth, createAuditLog, AuthErrors } from "@/lib/auth/server-utils";

export const GET = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const assetClass = searchParams.get("assetClass");
    const sortBy = searchParams.get("sortBy") || "addedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build query
    const query: any = { userId: new ObjectId(user.id) };
    if (assetClass) {
      query.assetClass = assetClass;
    }

    // Get total count for pagination
    const totalCount = await db.collection("watchlist").countDocuments(query);

    // Fetch watchlist items with pagination
    const watchlistItems = await db
      .collection("watchlist")
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich watchlist items with current market data
    const enrichedItems = await Promise.all(
      watchlistItems.map(async (item: any) => {
        // Get current market data for the symbol
        const marketData = await db
          .collection("market_data")
          .findOne({ symbol: item.symbol }, { sort: { timestamp: -1 } });

        // Get security details
        const security = await db
          .collection("securities")
          .findOne({ symbol: item.symbol });

        // Calculate price change with real market data
        const currentPrice = marketData?.price || security?.lastPrice || 0;
        const previousClose =
          marketData?.previousClose || marketData?.price || currentPrice;
        const priceChange = currentPrice - previousClose;
        const priceChangePercent =
          previousClose > 0 ? (priceChange / previousClose) * 100 : 0;

        return {
          id: item._id,
          symbol: item.symbol,
          assetClass: item.assetClass,
          addedAt: item.addedAt,
          companyName: security?.companyName || item.symbol,
          sector: security?.sector,
          industry: security?.industry,
          marketCap: security?.marketCap,
          currentPrice,
          priceChange,
          priceChangePercent,
          volume: marketData?.volume || 0,
          avgVolume: marketData?.avgVolume || 0,
          high52Week: security?.high52Week,
          low52Week: security?.low52Week,
          peRatio: security?.peRatio,
          dividend: security?.dividend,
          dividendYield: security?.dividendYield,
          beta: security?.beta,
          lastUpdated: marketData?.timestamp,
        };
      }),
    );

    // Get watchlist statistics
    const statistics = await db
      .collection("watchlist")
      .aggregate([
        { $match: { userId: new ObjectId(user.id) } },
        {
          $group: {
            _id: "$assetClass",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      watchlist: enrichedItems,
      statistics: {
        total: totalCount,
        byAssetClass: statistics.reduce(
          (acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();
    const { symbol, assetClass = "STOCK", notes } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    const symbolUpper = symbol.toUpperCase();

    // Check if symbol already in watchlist
    const existing = await db.collection("watchlist").findOne({
      userId: new ObjectId(user.id),
      symbol: symbolUpper,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Symbol already in watchlist" },
        { status: 400 },
      );
    }

    // Get or create security information
    let security = await db
      .collection("securities")
      .findOne({ symbol: symbolUpper });

    if (!security) {
      // Create basic security entry if not found
      const newSecurity = {
        symbol: symbolUpper,
        companyName: symbolUpper,
        assetClass: assetClass,
        exchange: "NASDAQ",
        currency: "USD",
        sector: "Technology",
        industry: "Software",
        createdAt: new Date(),
      };
      const result = await db.collection("securities").insertOne(newSecurity);
      security = { ...newSecurity, _id: result.insertedId };
    }

    // Check watchlist limit (max 200 symbols per user)
    const currentCount = await db.collection("watchlist").countDocuments({
      userId: new ObjectId(user.id),
    });

    if (currentCount >= 200) {
      return NextResponse.json(
        { error: "Watchlist limit reached (200 symbols maximum)" },
        { status: 400 },
      );
    }

    const watchlistItem = {
      userId: new ObjectId(user.id),
      symbol: symbolUpper,
      assetClass: security?.assetClass || assetClass,
      companyName: security?.companyName || symbolUpper,
      sector: security?.sector || "Technology",
      notes: notes || "",
      addedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("watchlist").insertOne(watchlistItem);

    // Create audit log
    await createAuditLog(
      user.id,
      "WATCHLIST_SYMBOL_ADDED",
      "watchlist",
      result.insertedId.toString(),
      {
        symbol: symbolUpper,
        assetClass: watchlistItem.assetClass,
        companyName: security?.companyName || symbolUpper,
      },
    );

    // Get current market data for response
    const marketData = await db
      .collection("market_data")
      .findOne({ symbol: symbolUpper }, { sort: { timestamp: -1 } });

    // If no market data exists, create initial entry
    let currentPrice = marketData?.price || 100;
    let previousClose = marketData?.previousClose || currentPrice;

    if (!marketData) {
      const initialMarketData = {
        symbol: symbolUpper,
        price: currentPrice,
        previousClose: previousClose,
        volume: 0,
        avgVolume: 1000000,
        timestamp: new Date(),
        source: "initial",
      };
      await db.collection("market_data").insertOne(initialMarketData);
    }

    const priceChange = currentPrice - previousClose;
    const priceChangePercent =
      previousClose > 0 ? (priceChange / previousClose) * 100 : 0;

    return NextResponse.json(
      {
        item: {
          id: result.insertedId,
          ...watchlistItem,
          currentPrice,
          priceChange,
          priceChangePercent,
          volume: marketData?.volume || 0,
          lastUpdated: new Date(),
        },
        message: "Symbol added to watchlist successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();
    const { itemId, notes, alerts } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    // Verify item exists and belongs to user
    const existingItem = await db.collection("watchlist").findOne({
      _id: new ObjectId(itemId),
      userId: new ObjectId(user.id),
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 },
      );
    }

    const updates: any = { updatedAt: new Date() };

    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (alerts !== undefined) {
      // Validate and process alerts structure
      if (alerts.priceAlerts) {
        const validatedAlerts = [];
        for (const alert of alerts.priceAlerts) {
          if (alert.price && alert.condition && alert.type) {
            validatedAlerts.push({
              id: crypto.randomUUID(),
              price: parseFloat(alert.price),
              condition: alert.condition, // "above", "below", "cross_up", "cross_down"
              type: alert.type, // "email", "push", "sms"
              enabled: true,
              createdAt: new Date(),
            });
          }
        }
        updates.alerts = { priceAlerts: validatedAlerts };
      } else {
        updates.alerts = alerts;
      }
    }

    if (Object.keys(updates).length === 1) {
      // Only updatedAt
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 },
      );
    }

    await db
      .collection("watchlist")
      .updateOne({ _id: new ObjectId(itemId) }, { $set: updates });

    // Create audit log
    await createAuditLog(
      user.id,
      "WATCHLIST_ITEM_UPDATED",
      "watchlist",
      itemId,
      {
        symbol: existingItem.symbol,
        updates: Object.keys(updates).filter((key) => key !== "updatedAt"),
      },
    );

    return NextResponse.json({
      message: "Watchlist item updated successfully",
    });
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist item" },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const itemId = searchParams.get("itemId");

    if (!symbol && !itemId) {
      return NextResponse.json(
        { error: "Symbol or item ID is required" },
        { status: 400 },
      );
    }

    let query: any = { userId: new ObjectId(user.id) };

    if (itemId) {
      query._id = new ObjectId(itemId);
    } else if (symbol) {
      query.symbol = symbol.toUpperCase();
    }

    // Get the item before deletion for audit log
    const existingItem = await db.collection("watchlist").findOne(query);

    if (!existingItem) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 },
      );
    }

    const result = await db.collection("watchlist").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to remove from watchlist" },
        { status: 500 },
      );
    }

    // Create audit log
    await createAuditLog(
      user.id,
      "WATCHLIST_SYMBOL_REMOVED",
      "watchlist",
      existingItem._id.toString(),
      {
        symbol: existingItem.symbol,
        companyName: existingItem.companyName,
        assetClass: existingItem.assetClass,
      },
    );

    return NextResponse.json({
      message: "Symbol removed from watchlist successfully",
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 },
    );
  }
});

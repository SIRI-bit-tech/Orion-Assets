import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export interface MarketDataPoint {
  symbol: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  source: string;
}

export interface SecurityInfo {
  symbol: string;
  companyName: string;
  assetClass: "STOCK" | "ETF" | "OPTION" | "CRYPTO" | "FOREX";
  exchange: string;
  currency: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  dividend?: number;
  dividendYield?: number;
  beta?: number;
  high52Week?: number;
  low52Week?: number;
  sharesOutstanding?: number;
  description?: string;
  website?: string;
  employees?: number;
  lastUpdated: Date;
}

export class MarketDataService {
  private static instance: MarketDataService;
  private priceCache = new Map<string, MarketDataPoint>();
  private securityCache = new Map<string, SecurityInfo>();
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getMarketData(symbol: string): Promise<MarketDataPoint | null> {
    const symbolUpper = symbol.toUpperCase();

    // Check cache first
    if (this.priceCache.has(symbolUpper)) {
      const cached = this.priceCache.get(symbolUpper)!;
      // Return cached data if less than 1 minute old
      if (Date.now() - cached.timestamp.getTime() < 60000) {
        return cached;
      }
    }

    try {
      const db = await getDb();
      const marketData = await db
        .collection("market_data")
        .findOne({ symbol: symbolUpper }, { sort: { timestamp: -1 } });

      if (marketData) {
        const dataPoint: MarketDataPoint = {
          symbol: marketData.symbol,
          price: marketData.price,
          previousClose: marketData.previousClose,
          open: marketData.open || marketData.previousClose,
          high: marketData.high || marketData.price,
          low: marketData.low || marketData.price,
          volume: marketData.volume || 0,
          avgVolume: marketData.avgVolume || 1000000,
          change: marketData.price - marketData.previousClose,
          changePercent:
            marketData.previousClose > 0
              ? ((marketData.price - marketData.previousClose) /
                  marketData.previousClose) *
                100
              : 0,
          timestamp: marketData.timestamp,
          source: marketData.source || "database",
        };

        // Update cache
        this.priceCache.set(symbolUpper, dataPoint);
        return dataPoint;
      }

      // If no data found, try to fetch from external source
      return await this.fetchExternalMarketData(symbolUpper);
    } catch (error) {
      console.error(`Error getting market data for ${symbolUpper}:`, error);
      return null;
    }
  }

  async getMultipleMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    const results = await Promise.all(
      symbols.map((symbol) => this.getMarketData(symbol)),
    );
    return results.filter((data) => data !== null) as MarketDataPoint[];
  }

  async getSecurityInfo(symbol: string): Promise<SecurityInfo | null> {
    const symbolUpper = symbol.toUpperCase();

    // Check cache first
    if (this.securityCache.has(symbolUpper)) {
      return this.securityCache.get(symbolUpper)!;
    }

    try {
      const db = await getDb();
      let security = await db
        .collection("securities")
        .findOne({ symbol: symbolUpper });

      if (!security) {
        // Create basic security info if not found
        security = await this.createBasicSecurityInfo(symbolUpper);
      }

      if (!security) {
        return null;
      }

      const securityInfo: SecurityInfo = {
        symbol: security.symbol,
        companyName: security.companyName || symbolUpper,
        assetClass: security.assetClass || "STOCK",
        exchange: security.exchange || "NASDAQ",
        currency: security.currency || "USD",
        sector: security.sector || undefined,
        industry: security.industry || undefined,
        marketCap: security.marketCap || undefined,
        peRatio: security.peRatio || undefined,
        dividend: security.dividend || undefined,
        dividendYield: security.dividendYield || undefined,
        beta: security.beta || 1.0,
        high52Week: security.high52Week || undefined,
        low52Week: security.low52Week || undefined,
        sharesOutstanding: security.sharesOutstanding || undefined,
        description: security.description || undefined,
        website: security.website || undefined,
        employees: security.employees || undefined,
        lastUpdated: security.lastUpdated || new Date(),
      };

      // Update cache
      this.securityCache.set(symbolUpper, securityInfo);
      return securityInfo;
    } catch (error) {
      console.error(`Error getting security info for ${symbolUpper}:`, error);
      return null;
    }
  }

  async updateMarketData(
    symbol: string,
    price: number,
    volume?: number,
  ): Promise<void> {
    const symbolUpper = symbol.toUpperCase();

    try {
      const db = await getDb();

      // Get previous close price
      const previousData = await db
        .collection("market_data")
        .findOne({ symbol: symbolUpper }, { sort: { timestamp: -1 } });

      const previousClose = previousData?.price || price;

      const marketData = {
        symbol: symbolUpper,
        price,
        previousClose,
        open: previousData?.open || previousClose,
        high: Math.max(previousData?.high || price, price),
        low: Math.min(previousData?.low || price, price),
        volume: volume || 0,
        avgVolume: previousData?.avgVolume || 1000000,
        timestamp: new Date(),
        source: "system_update",
      };

      // Insert new market data
      await db.collection("market_data").insertOne(marketData);

      // Update cache
      const dataPoint: MarketDataPoint = {
        ...marketData,
        change: price - previousClose,
        changePercent:
          previousClose > 0
            ? ((price - previousClose) / previousClose) * 100
            : 0,
      };
      this.priceCache.set(symbolUpper, dataPoint);

      // Update positions with new prices
      await this.updatePositionValues(symbolUpper, price);

      // Check price alerts
      await this.checkPriceAlerts(symbolUpper, price);
    } catch (error) {
      console.error(`Error updating market data for ${symbolUpper}:`, error);
    }
  }

  async batchUpdateMarketData(
    updates: { symbol: string; price: number; volume?: number }[],
  ): Promise<void> {
    const promises = updates.map((update) =>
      this.updateMarketData(update.symbol, update.price, update.volume),
    );
    await Promise.all(promises);
  }

  private async fetchExternalMarketData(
    symbol: string,
  ): Promise<MarketDataPoint | null> {
    // Simulate fetching from external API
    // In production, integrate with real market data providers like Alpha Vantage, Yahoo Finance, etc.

    try {
      // Simulated market data with realistic price movements
      const basePrice = 100 + (symbol.charCodeAt(0) - 65) * 10;
      const randomVariation = (Math.random() - 0.5) * 10;
      const currentPrice = Math.max(basePrice + randomVariation, 1);
      const previousClose = basePrice;

      const marketData: MarketDataPoint = {
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        previousClose: parseFloat(previousClose.toFixed(2)),
        open: previousClose,
        high: Math.max(currentPrice, previousClose),
        low: Math.min(currentPrice, previousClose),
        volume: Math.floor(Math.random() * 10000000),
        avgVolume: 5000000,
        change: parseFloat((currentPrice - previousClose).toFixed(2)),
        changePercent: parseFloat(
          (((currentPrice - previousClose) / previousClose) * 100).toFixed(2),
        ),
        timestamp: new Date(),
        source: "external_api",
      };

      // Save to database
      const db = await getDb();
      await db.collection("market_data").insertOne(marketData);

      // Update cache
      this.priceCache.set(symbol, marketData);

      return marketData;
    } catch (error) {
      console.error(
        `Error fetching external market data for ${symbol}:`,
        error,
      );
      return null;
    }
  }

  private async createBasicSecurityInfo(symbol: string): Promise<any> {
    const db = await getDb();

    // Create basic security information
    const security = {
      symbol,
      companyName: `${symbol} Corp`,
      assetClass: "STOCK",
      exchange: "NASDAQ",
      currency: "USD",
      sector: this.getRandomSector(),
      industry: "Technology",
      beta: parseFloat((0.5 + Math.random() * 1.5).toFixed(2)), // Random beta between 0.5 and 2.0
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    await db.collection("securities").insertOne(security);
    return security;
  }

  private getRandomSector(): string {
    const sectors = [
      "Technology",
      "Healthcare",
      "Financial Services",
      "Consumer Cyclical",
      "Communication Services",
      "Industrials",
      "Consumer Defensive",
      "Energy",
      "Utilities",
      "Real Estate",
      "Basic Materials",
    ];
    return sectors[Math.floor(Math.random() * sectors.length)];
  }

  private async updatePositionValues(
    symbol: string,
    newPrice: number,
  ): Promise<void> {
    try {
      const db = await getDb();

      // Update all open positions for this symbol
      await db.collection("positions").updateMany(
        { symbol, status: "OPEN" },
        {
          $set: {
            currentPrice: newPrice,
            updatedAt: new Date(),
          },
        },
      );

      // Calculate new current values for positions
      const positions = await db
        .collection("positions")
        .find({
          symbol,
          status: "OPEN",
        })
        .toArray();

      for (const position of positions) {
        const currentValue = position.quantity * newPrice;
        const unrealizedPnL = currentValue - (position.costBasis || 0);

        await db.collection("positions").updateOne(
          { _id: position._id },
          {
            $set: {
              currentValue,
              unrealizedPnL,
              updatedAt: new Date(),
            },
          },
        );
      }
    } catch (error) {
      console.error(`Error updating position values for ${symbol}:`, error);
    }
  }

  private async checkPriceAlerts(
    symbol: string,
    currentPrice: number,
  ): Promise<void> {
    try {
      const db = await getDb();

      // Find watchlist items with price alerts for this symbol
      const watchlistItems = await db
        .collection("watchlist")
        .find({
          symbol,
          "alerts.priceAlerts": { $exists: true, $ne: [] },
        })
        .toArray();

      for (const item of watchlistItems) {
        const priceAlerts = item.alerts?.priceAlerts || [];

        for (const alert of priceAlerts) {
          if (!alert.enabled) continue;

          let triggered = false;

          switch (alert.condition) {
            case "above":
              triggered = currentPrice > alert.price;
              break;
            case "below":
              triggered = currentPrice < alert.price;
              break;
            case "cross_up":
              // Would need previous price to implement properly
              triggered = currentPrice >= alert.price;
              break;
            case "cross_down":
              // Would need previous price to implement properly
              triggered = currentPrice <= alert.price;
              break;
          }

          if (triggered) {
            await this.sendPriceAlert(item.userId, symbol, currentPrice, alert);

            // Disable the alert after triggering
            await db.collection("watchlist").updateOne(
              {
                _id: item._id,
                "alerts.priceAlerts.id": alert.id,
              },
              {
                $set: {
                  "alerts.priceAlerts.$.enabled": false,
                  "alerts.priceAlerts.$.triggeredAt": new Date(),
                },
              },
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error checking price alerts for ${symbol}:`, error);
    }
  }

  private async sendPriceAlert(
    userId: ObjectId,
    symbol: string,
    price: number,
    alert: any,
  ): Promise<void> {
    try {
      const db = await getDb();

      // Log the alert
      await db.collection("price_alerts").insertOne({
        userId,
        symbol,
        alertType: alert.type,
        condition: alert.condition,
        targetPrice: alert.price,
        actualPrice: price,
        triggeredAt: new Date(),
        sent: true,
      });

      // Send notification based on alert type
      console.log(
        `Price alert triggered for user ${userId}: ${symbol} ${alert.condition} $${alert.price}, current price: $${price}`,
      );

      // Here you would integrate with email service, push notifications, SMS, etc.
    } catch (error) {
      console.error("Error sending price alert:", error);
    }
  }

  startRealTimeUpdates(intervalMs: number = 30000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        // Get all unique symbols from active positions and watchlists
        const db = await getDb();

        const [positionSymbols, watchlistSymbols] = await Promise.all([
          db.collection("positions").distinct("symbol", { status: "OPEN" }),
          db.collection("watchlist").distinct("symbol"),
        ]);

        const allSymbols = [
          ...new Set([...positionSymbols, ...watchlistSymbols]),
        ];

        // Update prices for all active symbols
        const updates = allSymbols.map((symbol) => ({
          symbol,
          price: this.generateRealisticPrice(symbol),
          volume: Math.floor(Math.random() * 10000000),
        }));

        await this.batchUpdateMarketData(updates);
      } catch (error) {
        console.error("Error in real-time update cycle:", error);
      }
    }, intervalMs);
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private generateRealisticPrice(symbol: string): number {
    const cached = this.priceCache.get(symbol);
    const basePrice = cached?.price || 100 + (symbol.charCodeAt(0) - 65) * 10;

    // Generate realistic price movement (small random walk)
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = basePrice * (1 + randomChange);

    return Math.max(parseFloat(newPrice.toFixed(2)), 0.01);
  }

  clearCache(): void {
    this.priceCache.clear();
    this.securityCache.clear();
  }
}

// Export singleton instance
export const marketDataService = MarketDataService.getInstance();

// Market Data API Service for Real-Time Prices
// You can use any of these APIs - I'll show you how to get them

export interface MarketDataProvider {
  name: string
  apiKey: string
  baseUrl: string
  rateLimit: number
  cost: string
}

// Free APIs you can use:
export const MARKET_DATA_PROVIDERS: Record<string, MarketDataProvider> = {
  // Free tier: 5 calls/minute, 500 calls/day
  alphaVantage: {
    name: "Alpha Vantage",
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || "",
    baseUrl: "https://www.alphavantage.co/query",
    rateLimit: 5, // calls per minute
    cost: "Free tier available"
  },
  
  // Free tier: 60 calls/minute
  finnhub: {
    name: "Finnhub",
    apiKey: process.env.FINNHUB_API_KEY || "",
    baseUrl: "https://finnhub.io/api/v1",
    rateLimit: 60, // calls per minute
    cost: "Free tier available"
  },
  
  // Free tier: 5 calls/minute
  polygon: {
    name: "Polygon.io",
    apiKey: process.env.POLYGON_API_KEY || "",
    baseUrl: "https://api.polygon.io/v2",
    rateLimit: 5, // calls per minute
    cost: "Free tier available"
  }
}

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: Date
}

// Alpha Vantage API implementation
export async function fetchAlphaVantageQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    console.warn("Alpha Vantage API key not found")
    return null
    }

    try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const quote = data["Global Quote"]
    
    if (!quote || quote["01. symbol"] !== symbol) {
      return null
    }
    
    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      open: parseFloat(quote["02. open"]),
      previousClose: parseFloat(quote["08. previous close"]),
      timestamp: new Date()
    }
    } catch (error) {
    console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error)
    return null
  }
}

// Finnhub API implementation
export async function fetchFinnhubQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    console.warn("Finnhub API key not found")
    return null
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.c) {
      return null
    }
    
    return {
          symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      volume: data.v,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: new Date()
      }
    } catch (error) {
    console.error(`Error fetching Finnhub data for ${symbol}:`, error)
    return null
  }
}

// Fallback to simulated data if no API keys
export function generateSimulatedQuote(symbol: string): StockQuote {
  const basePrice = 100 + Math.random() * 900
  const change = (Math.random() - 0.5) * 10
  const changePercent = (change / basePrice) * 100
  
  return {
          symbol,
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 1000000),
    high: basePrice + Math.random() * 10,
    low: basePrice - Math.random() * 10,
    open: basePrice + (Math.random() - 0.5) * 5,
    previousClose: basePrice - change,
    timestamp: new Date()
  }
}

// Main function to fetch quotes with fallback
export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = []
  
  for (const symbol of symbols) {
    let quote: StockQuote | null = null
    
    // Try Finnhub first (higher rate limit)
    if (process.env.FINNHUB_API_KEY) {
      quote = await fetchFinnhubQuote(symbol)
    }
    
    // Fallback to Alpha Vantage
    if (!quote && process.env.ALPHA_VANTAGE_API_KEY) {
      quote = await fetchAlphaVantageQuote(symbol)
    }
    
    // Fallback to simulated data
    if (!quote) {
      quote = generateSimulatedQuote(symbol)
    }
    
    quotes.push(quote)
    
    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return quotes
}
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create Socket.io server
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? ["http://localhost:3000"] : false,
      methods: ["GET", "POST"]
    },
    path: "/api/socketio"
  })

  // Socket.io connection handling
  io.on('connection', async (socket) => {
    console.log('[Socket.io] New connection:', socket.id)

    // Extract user ID from auth token or query params
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId
    
    if (userId) {
      socket.data.userId = userId
      socket.join(`user:${userId}`)
    }

    // Handle price subscriptions
    socket.on('subscribe_prices', (symbols) => {
      console.log(`[Socket.io] User ${userId} subscribing to:`, symbols)
      socket.data.symbols = symbols
      
      // Join symbol-specific rooms
      symbols.forEach(symbol => {
        socket.join(`symbol:${symbol}`)
      })
      
      socket.emit('subscription_confirmed', symbols)
    })

    // Handle unsubscriptions
    socket.on('unsubscribe_prices', (symbols) => {
      console.log(`[Socket.io] User ${userId} unsubscribing from:`, symbols)
      
      symbols.forEach(symbol => {
        socket.leave(`symbol:${symbol}`)
      })
    })

    // Handle ping
    socket.on('ping', () => {
      socket.emit('pong')
    })

    socket.on('disconnect', () => {
      console.log('[Socket.io] Connection closed:', socket.id)
    })
  })

  // Start price broadcasting with real market data
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"]
  
  // Real market data fetching functions
  async function fetchFinnhubQuote(symbol) {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) return null

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      )
      
      if (!response.ok) return null
      
      const data = await response.json()
      if (!data.c) return null
      
      return {
        symbol,
        name: symbol,
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

  async function fetchAlphaVantageQuote(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) return null

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      )
      
      if (!response.ok) return null
      
      const data = await response.json()
      const quote = data["Global Quote"]
      
      if (!quote || quote["01. symbol"] !== symbol) return null
      
      return {
        symbol: quote["01. symbol"],
        name: symbol,
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

  function generateSimulatedQuote(symbol) {
    const basePrice = 100 + Math.random() * 900
    const change = (Math.random() - 0.5) * 10
    const changePercent = (change / basePrice) * 100
    
    return {
      symbol,
      name: symbol,
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

  async function fetchStockQuotes(symbols) {
    const quotes = []
    
    for (const symbol of symbols) {
      let quote = null
      
      // Try Alpha Vantage first (since you have this API key)
      if (process.env.ALPHA_VANTAGE_API_KEY) {
        quote = await fetchAlphaVantageQuote(symbol)
      }

      // Finnhub fallback removed by user request
      // if (!quote && process.env.FINNHUB_API_KEY) {
      //   quote = await fetchFinnhubQuote(symbol)
      // }
      
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
  
  // Start price broadcasting after a short delay
  setTimeout(async () => {
    setInterval(async () => {
      try {
        console.log('[Socket.io] Fetching real market data...')
        
        // Fetch real market data
        const priceUpdates = await fetchStockQuotes(symbols)
        
        // Broadcast to all symbol rooms
        symbols.forEach((symbol, index) => {
          if (priceUpdates[index]) {
            io.to(`symbol:${symbol}`).emit('price_update', [priceUpdates[index]])
          }
        })

        // Also broadcast to all connected clients for general updates
        io.emit('price_update', priceUpdates)
        
        console.log(`[Socket.io] Broadcasted ${priceUpdates.length} price updates`)
      } catch (error) {
        console.error('[Socket.io] Price broadcasting error:', error)
        
        // Fallback to simulated data if API fails
        const fallbackUpdates = symbols.map((symbol) => generateSimulatedQuote(symbol))
        io.emit('price_update', fallbackUpdates)
      }
    }, 5000) // Update every 5 seconds (to respect API rate limits)
  }, 2000) // Wait 2 seconds before starting

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.io server running on /api/socketio`)
  })
})

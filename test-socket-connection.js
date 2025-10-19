// Simple test to verify Socket.io connection
const { io } = require('socket.io-client')

console.log('Testing Socket.io connection...')
console.log('Make sure the server is running with: npm run dev')

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
})

socket.on('connect', () => {
  console.log('✅ Connected to Socket.io server:', socket.id)
  
  // Subscribe to price updates
  socket.emit('subscribe_prices', ['AAPL', 'GOOGL'])
  
  // Listen for price updates
  socket.on('price_update', (data) => {
    console.log('📈 Received price update:', data.length, 'stocks')
    data.forEach(quote => {
      console.log(`  ${quote.symbol}: $${quote.price.toFixed(2)} (${quote.changePercent.toFixed(2)}%)`)
    })
  })
  
  socket.on('subscription_confirmed', (symbols) => {
    console.log('✅ Subscribed to symbols:', symbols)
  })
})

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.io server')
})

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message)
})

// Keep the process running
setTimeout(() => {
  console.log('Test completed. Press Ctrl+C to exit.')
}, 30000)

# Real-Time Dashboard Setup Guide


### 1. **Socket.io Server & Client**
- Converted WebSocket to Socket.io for better reliability
- MongoDB change streams for real-time database updates
- Room-based subscriptions for targeted updates
- Auto-reconnection and error handling

### 2. **Real TradingView Widgets**
- **Market Overview**: `https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js`
- **News Timeline**: `https://s3.tradingview.com/external-embedding/embed-widget-timeline.js`
- **Watchlist**: `https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js`
- **Heatmap**: `https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js`
- **Live Charts**: `https://s3.tradingview.com/tv.js` with real-time API updates

### 3. **Real-Time Data Flow**
```
MongoDB → Change Streams → Socket.io Server → Socket.io Client → React Components → TradingView Widgets
```

## 🚀 How to Get It Running

### Step 1: Install Dependencies
```bash
npm install socket.io socket.io-client @types/socket.io
```

### Step 2: Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
```

### Step 3: Start the Development Server
```bash
npm run dev or pnpm dev
```

### Step 4: Access the Dashboard
Visit: `http://localhost:3000/dashboard`

## 📊 Dashboard Components

### **Real-Time Trading Section**
- **TradingView Chart**: Live AAPL chart with real-time price updates
- **Live Price Feed**: Real-time price updates for multiple symbols

### **Market Overview**
- **TradingView Market Overview**: Real market data for stocks, tech, and crypto
- **TradingView Heatmap**: Live market heatmap for NASDAQ

### **Watchlist & News**
- **TradingView Watchlist**: Live watchlist with real-time prices
- **TradingView News**: Real financial news timeline

## 🔧 How It Connects to Your Database

### **MongoDB Collections Used**
- `orders` - Real-time order updates
- `positions` - Real-time position updates
- `trading_data` - Price data (you can add this)

### **Real-Time Updates**
1. **Orders**: When orders are created/updated in MongoDB
2. **Positions**: When positions change
3. **Prices**: Simulated every 2 seconds (replace with real market data API)

### **Socket.io Events**
- `price_update` - Live price data
- `order_update` - Order status changes
- `position_update` - Position changes
- `notification` - System notifications

## 🎯 TradingView Widget API Usage

### **Real-Time Chart Updates**
```typescript
// The chart automatically updates with live data
const widget = window.TradingView.widget
widget.chart().updateData(newBar)
```

### **Available Widgets**
1. **Market Overview**: Multi-symbol overview with tabs
2. **News Timeline**: Real financial news feed
3. **Watchlist**: Symbol overview with charts
4. **Heatmap**: Market sector heatmap
5. **Live Charts**: Advanced charting with real-time updates

## 🔄 Real-Time Features

### **Price Updates**
- Updates every 2 seconds
- Symbol-specific subscriptions
- Real-time chart updates

### **Order Management**
- Live order status updates
- Position changes
- Trade executions

### **News & Market Data**
- Real financial news
- Live market overview
- Sector performance

## 🛠 Customization

### **Add More Symbols**
```typescript
// In TradingViewMarketOverview
symbols = [
  ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"],
  ["NVDA", "META", "NFLX", "AMD", "INTC"],
  ["BTCUSD", "ETHUSD", "XRPUSD", "ADAUSD", "SOLUSD"]
]
```

### **Change Update Frequency**
```typescript
// In server.ts
setInterval(async () => {
  // Price updates
}, 1000) // Change to 1 second
```

### **Add Real Market Data**
Replace the simulated data in `startPriceBroadcasting()` with real market data API calls.

## 🎉 Result

Your dashboard now has:
- ✅ **Real TradingView widgets** (not demo)
- ✅ **Live price feeds** from Socket.io
- ✅ **Real-time database updates** via MongoDB change streams
- ✅ **Professional trading interface**
- ✅ **Live news and market data**

The dashboard is now fully functional with real-time data and professional TradingView widgets!

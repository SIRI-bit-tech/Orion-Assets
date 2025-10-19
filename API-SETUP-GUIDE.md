# Real-Time Market Data API Setup Guide

## 🚀 Quick Setup (Free APIs)

### Option 1: Finnhub (Recommended - 60 calls/minute)
1. Go to [Finnhub.io](https://finnhub.io/)
2. Sign up for free account
3. Get your API key from dashboard
4. Add to `.env.local`:
```env
FINNHUB_API_KEY=your_finnhub_api_key_here
```

### Option 2: Alpha Vantage (5 calls/minute)
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get free API key
3. Add to `.env.local`:
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

### Option 3: Polygon.io (5 calls/minute)
1. Go to [Polygon.io](https://polygon.io/)
2. Sign up for free account
3. Get your API key
4. Add to `.env.local`:
```env
POLYGON_API_KEY=your_polygon_key_here
```

## 📋 Complete Environment Setup

Create `.env.local` file in your project root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/orion-assets-broker
MONGODB_DB=orion-assets-broker

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Market Data APIs (Choose one or more)
FINNHUB_API_KEY=your_finnhub_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
POLYGON_API_KEY=your_polygon_key_here

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
```

## 🔧 How to Get API Keys

### Finnhub (Recommended)
- **Website**: https://finnhub.io/
- **Free Tier**: 60 calls/minute, 1,000 calls/day
- **Signup**: Email + password
- **API Key**: Available immediately in dashboard

### Alpha Vantage
- **Website**: https://www.alphavantage.co/
- **Free Tier**: 5 calls/minute, 500 calls/day
- **Signup**: Just email
- **API Key**: Instant via email

### Polygon.io
- **Website**: https://polygon.io/
- **Free Tier**: 5 calls/minute
- **Signup**: Email + phone verification
- **API Key**: Available in dashboard

## 🚀 Start the Server

1. **Install dependencies**:
```bash
npm install
```

2. **Start with Socket.io**:
```bash
npm run dev
```

3. **Visit dashboard**:
```
http://localhost:3000/dashboard
```

## 📊 What You'll Get

- ✅ **Real-time stock prices** from live APIs
- ✅ **Live price feed** with connection status
- ✅ **TradingView charts** with real data
- ✅ **Market overview** with live data
- ✅ **Professional trading interface**

## 🔄 Fallback System

If no API keys are provided, the system will:
- Use simulated data (still works)
- Show "Simulated Data" in console
- Update every 2 seconds with realistic price movements

## 🎯 API Priority

The system tries APIs in this order:
1. **Finnhub** (highest rate limit)
2. **Alpha Vantage** (backup)
3. **Simulated data** (fallback)

## 📈 Rate Limits

- **Finnhub**: 60 calls/minute (best for real-time)
- **Alpha Vantage**: 5 calls/minute (slower updates)
- **Polygon**: 5 calls/minute (slower updates)

For production, consider upgrading to paid tiers for higher rate limits.

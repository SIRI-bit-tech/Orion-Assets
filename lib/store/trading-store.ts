import { create } from "zustand"

interface Order {
  _id: string
  // other properties of Order
}

interface Position {
  _id: string
  // other properties of Position
}

interface WatchlistItem {
  symbol: string
  // other properties of WatchlistItem
}

interface TradingStore {
  orders: Order[]
  positions: Position[]
  watchlist: WatchlistItem[]

  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void

  setPositions: (positions: Position[]) => void
  updatePosition: (positionId: string, updates: Partial<Position>) => void

  setWatchlist: (watchlist: WatchlistItem[]) => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
}

export const useTradingStore = create<TradingStore>((set) => ({
  orders: [],
  positions: [],
  watchlist: [],

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((order) => (order._id.toString() === orderId ? { ...order, ...updates } : order)),
    })),

  setPositions: (positions) => set({ positions }),
  updatePosition: (positionId, updates) =>
    set((state) => ({
      positions: state.positions.map((position) =>
        position._id.toString() === positionId ? { ...position, ...updates } : position,
      ),
    })),

  setWatchlist: (watchlist) => set({ watchlist }),
  addToWatchlist: (item) => set((state) => ({ watchlist: [...state.watchlist, item] })),
  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((item) => item.symbol !== symbol),
    })),
}))

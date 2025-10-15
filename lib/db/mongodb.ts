import { MongoClient, type Db, MongoClientOptions, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "orion-assets-broker"

// Production-ready MongoDB options
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5,  // Maintain at least 5 socket connections
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// In development mode we use a global variable to maintain the connection
// This prevents connections from being created on every hot reload
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

// Graceful shutdown helper
export async function closeDbConnection(): Promise<void> {
  try {
    const mongoClient = await clientPromise
    await mongoClient.close()
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined
    }
    console.log("MongoDB connection closed successfully")
  } catch (error) {
    console.error("Error closing MongoDB connection:", error)
  }
}

export const connectToDatabase = getDb

export default clientPromise

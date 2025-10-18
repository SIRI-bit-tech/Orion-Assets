import { NextRequest, NextResponse } from "next/server";
// Auth DB connection removed - using main DB connection only
import { getDb } from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Test main MongoDB connection
    let mainDbStatus = "disconnected";
    let mainDbLatency = 0;

    try {
      const mainDbStart = Date.now();
      const mainDb = await getDb();
      await mainDb.admin().ping();
      mainDbLatency = Date.now() - mainDbStart;
      mainDbStatus = "connected";
    } catch (error) {
      console.error("Main DB health check failed:", error);
      mainDbStatus = "error";
    }

    // Auth DB uses same connection as main DB
    const authDbStatus = mainDbStatus;
    const authDbLatency = mainDbLatency;

    // Check if any critical collections exist
    let collectionsStatus = "unknown";
    let collections: string[] = [];

    try {
      const db = await getDb();
      const collectionList = await db.listCollections().toArray();
      collections = collectionList.map((col) => col.name);
      collectionsStatus = "ok";
    } catch (error) {
      console.error("Collections check failed:", error);
      collectionsStatus = "error";
    }

    const totalLatency = Date.now() - startTime;
    const overallStatus =
      mainDbStatus === "connected" && authDbStatus === "connected"
        ? "healthy"
        : "unhealthy";

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      latency: {
        total: totalLatency,
        mainDb: mainDbLatency,
        authDb: authDbLatency,
      },
      connections: {
        mainDatabase: mainDbStatus,
        authDatabase: authDbStatus,
      },
      collections: {
        status: collectionsStatus,
        count: collections.length,
        names: collections.slice(0, 10), // Show first 10 collections
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        mongodbDb: process.env.MONGODB_DB || "orion-assets-broker",
      },
    };

    // Return appropriate HTTP status
    const httpStatus = overallStatus === "healthy" ? 200 : 503;

    return NextResponse.json(healthData, { status: httpStatus });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        latency: {
          total: Date.now() - startTime,
        },
      },
      { status: 503 },
    );
  }
}

// Also support POST for testing
export async function POST(request: NextRequest) {
  return GET(request);
}

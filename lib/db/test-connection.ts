import clientPromise, { getDb } from './mongodb';

/**
 * Test MongoDB connection
 * @returns {Promise<{success: boolean, message: string, dbName?: string}>}
 */
export async function testDatabaseConnection() {
  try {
    // Test the connection by connecting to the MongoDB client
    const client = await clientPromise;
    
    // Get the database instance
    const db = await getDb();
    const dbName = db.databaseName;
    
    // Run a simple command to verify the connection
    const result = await db.command({ ping: 1 });
    
    if (result.ok === 1) {
      return {
        success: true,
        message: `Successfully connected to MongoDB database: ${dbName}`,
        dbName
      };
    } else {
      return {
        success: false,
        message: 'Connection test failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Database connection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Verify specific collections exist in the database
 * @returns {Promise<{success: boolean, message: string, collections?: string[]}>}
 */
export async function verifyCollections() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    return {
      success: true,
      message: `Found ${collectionNames.length} collections`,
      collections: collectionNames
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to verify collections: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
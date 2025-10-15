import { getDb } from './mongodb';

/**
 * Creates all necessary indexes for production performance
 * @returns {Promise<{success: boolean, message: string, indexes: string[]}>}
 */
export async function createDatabaseIndexes() {
  try {
    const db = await getDb();
    const indexes = [];

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    indexes.push('users.email (unique)');
    
    await db.collection('users').createIndex({ role: 1 });
    indexes.push('users.role');

    // Accounts collection indexes
    await db.collection('accounts').createIndex({ userId: 1 });
    indexes.push('accounts.userId');
    
    // Orders collection indexes
    await db.collection('orders').createIndex({ userId: 1 });
    indexes.push('orders.userId');
    
    await db.collection('orders').createIndex({ accountId: 1 });
    indexes.push('orders.accountId');
    
    await db.collection('orders').createIndex({ status: 1 });
    indexes.push('orders.status');
    
    await db.collection('orders').createIndex({ symbol: 1 });
    indexes.push('orders.symbol');
    
    await db.collection('orders').createIndex({ placedAt: -1 });
    indexes.push('orders.placedAt');
    
    // Positions collection indexes
    await db.collection('positions').createIndex({ userId: 1 });
    indexes.push('positions.userId');
    
    await db.collection('positions').createIndex({ accountId: 1 });
    indexes.push('positions.accountId');
    
    await db.collection('positions').createIndex({ symbol: 1 });
    indexes.push('positions.symbol');
    
    await db.collection('positions').createIndex({ status: 1 });
    indexes.push('positions.status');
    
    await db.collection('positions').createIndex({ userId: 1, symbol: 1, status: 1 });
    indexes.push('positions.userId_symbol_status (compound)');
    
    // Trades collection indexes
    await db.collection('trades').createIndex({ userId: 1 });
    indexes.push('trades.userId');
    
    await db.collection('trades').createIndex({ accountId: 1 });
    indexes.push('trades.accountId');
    
    await db.collection('trades').createIndex({ orderId: 1 });
    indexes.push('trades.orderId');
    
    await db.collection('trades').createIndex({ positionId: 1 });
    indexes.push('trades.positionId');
    
    await db.collection('trades').createIndex({ executedAt: -1 });
    indexes.push('trades.executedAt');

    return {
      success: true,
      message: `Successfully created ${indexes.length} indexes`,
      indexes
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create indexes: ${error instanceof Error ? error.message : String(error)}`,
      indexes: []
    };
  }
}

/**
 * Verifies that all required collections exist
 * @returns {Promise<{success: boolean, message: string, missingCollections?: string[]}>}
 */
export async function verifyRequiredCollections() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      'users',
      'accounts',
      'orders',
      'positions',
      'trades'
    ];
    
    const missingCollections = requiredCollections.filter(
      name => !collectionNames.includes(name)
    );
    
    if (missingCollections.length === 0) {
      return {
        success: true,
        message: 'All required collections exist'
      };
    } else {
      return {
        success: false,
        message: `Missing collections: ${missingCollections.join(', ')}`,
        missingCollections
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to verify collections: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
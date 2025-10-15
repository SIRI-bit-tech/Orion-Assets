import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

/**
 * Test user-related database operations
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
export async function testUserOperations() {
  try {
    const db = await getDb();
    
    // Count users
    const userCount = await db.collection('users').countDocuments();
    
    // Test user query
    const randomUser = await db.collection('users').findOne({});
    
    return {
      success: true,
      message: `Successfully tested user operations. Found ${userCount} users.`,
      details: {
        userCount,
        sampleUser: randomUser ? {
          id: randomUser._id,
          email: randomUser.email,
          role: randomUser.role
        } : null
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `User operations test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Test account-related database operations
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
export async function testAccountOperations() {
  try {
    const db = await getDb();
    
    // Count accounts
    const accountCount = await db.collection('accounts').countDocuments();
    
    return {
      success: true,
      message: `Successfully tested account operations. Found ${accountCount} accounts.`,
      details: { accountCount }
    };
  } catch (error) {
    return {
      success: false,
      message: `Account operations test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
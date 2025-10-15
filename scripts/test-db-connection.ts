import { closeDbConnection } from '../lib/db/mongodb';
import { testDatabaseConnection, verifyCollections } from '../lib/db/test-connection';
import { testUserOperations, testAccountOperations } from '../lib/db/test-user-operations';

async function runTests() {
  console.log('🔍 Testing database connection...');
  
  // Test 1: Basic connection
  const connectionResult = await testDatabaseConnection();
  console.log(`Connection test: ${connectionResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(connectionResult.message);
  
  if (!connectionResult.success) {
    console.error('Database connection failed. Please check your MONGODB_URI in .env.local');
    await closeDbConnection();
    process.exit(1);
  }
  
  // Test 2: Verify collections
  console.log('\n🔍 Verifying database collections...');
  const collectionsResult = await verifyCollections();
  console.log(`Collections test: ${collectionsResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(collectionsResult.message);
  
  if (collectionsResult.success && collectionsResult.collections) {
    console.log('Found collections:');
    collectionsResult.collections.forEach(collection => {
      console.log(`- ${collection}`);
    });
  }
  
  // Test 3: User operations
  console.log('\n🔍 Testing user operations...');
  const userResult = await testUserOperations();
  console.log(`User operations test: ${userResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(userResult.message);
  
  if (userResult.success && userResult.details) {
    console.log(`Total users: ${userResult.details.userCount}`);
    if (userResult.details.sampleUser) {
      console.log('Sample user found with ID:', userResult.details.sampleUser.id);
    }
  }
  
  // Test 4: Account operations
  console.log('\n🔍 Testing account operations...');
  const accountResult = await testAccountOperations();
  console.log(`Account operations test: ${accountResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(accountResult.message);
  
  console.log('\n✅ All database tests completed successfully!');
  
  // Cleanup
  await closeDbConnection();
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
  closeDbConnection().finally(() => {
    process.exit(1);
  });
});
  console.log(accountResult.message);
  
  console.log('\n✅ All database tests completed successfully!');
  console.log(accountResult.message);
  
  console.log('\n✅ All database tests completed successfully!');
  
  // Cleanup
  await closeDbConnection();
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
  closeDbConnection().finally(() => {
    process.exit(1);
  });
});
  console.error('Test failed with error:', Error);
  process.exit(1);
});
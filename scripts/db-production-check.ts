import { testDatabaseConnection, verifyCollections } from '../lib/db/test-connection';
import { testUserOperations, testAccountOperations } from '../lib/db/test-user-operations';
import { createDatabaseIndexes, verifyRequiredCollections } from '../lib/db/indexes';
import { closeDbConnection } from '../lib/db/mongodb';

async function runProductionChecks() {
  console.log('🔍 ORION ASSETS BROKER - DATABASE PRODUCTION READINESS CHECK');
  console.log('===========================================================\n');
  
  try {
    // Test 1: Basic connection
    console.log('🔍 Testing database connection...');
    const connectionResult = await testDatabaseConnection();
    console.log(`Connection test: ${connectionResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(connectionResult.message);
    
    if (!connectionResult.success) {
      console.error('Database connection failed. Please check your MONGODB_URI in .env.local');
      process.exit(1);
    }
    
    // Test 2: Verify required collections
    console.log('\n🔍 Verifying required collections...');
    const requiredCollectionsResult = await verifyRequiredCollections();
    console.log(`Required collections test: ${requiredCollectionsResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(requiredCollectionsResult.message);
    
    if (!requiredCollectionsResult.success) {
      console.error('Missing required collections. Database is not production ready.');
      if (requiredCollectionsResult.missingCollections) {
        console.log('Missing collections:');
        requiredCollectionsResult.missingCollections.forEach(collection => {
          console.log(`- ${collection}`);
        });
      }
    }
    
    // Test 3: List all collections
    console.log('\n🔍 Listing all collections...');
    const collectionsResult = await verifyCollections();
    console.log(`Collections test: ${collectionsResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (collectionsResult.success && collectionsResult.collections) {
      console.log('Found collections:');
      collectionsResult.collections.forEach(collection => {
        console.log(`- ${collection}`);
      });
    }
    
    // Test 4: Create or verify indexes
    console.log('\n🔍 Creating database indexes for production performance...');
    const indexesResult = await createDatabaseIndexes();
    console.log(`Indexes creation: ${indexesResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(indexesResult.message);
    
    if (indexesResult.success && indexesResult.indexes) {
      console.log('Created/verified indexes:');
      indexesResult.indexes.forEach(index => {
        console.log(`- ${index}`);
      });
    }
    
    // Test 5: User operations
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
    
    // Test 6: Account operations
    console.log('\n🔍 Testing account operations...');
    const accountResult = await testAccountOperations();
    console.log(`Account operations test: ${accountResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(accountResult.message);
    
    // Production readiness summary
    console.log('\n📊 PRODUCTION READINESS SUMMARY');
    console.log('==============================');
    
    const tests = [
      { name: 'Database Connection', result: connectionResult.success },
      { name: 'Required Collections', result: requiredCollectionsResult.success },
      { name: 'Database Indexes', result: indexesResult.success },
      { name: 'User Operations', result: userResult.success },
      { name: 'Account Operations', result: accountResult.success }
    ];
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    const passRate = Math.round((passedTests / totalTests) * 100);
    
    tests.forEach(test => {
      console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
    });
    
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    
    if (passRate === 100) {
      console.log('\n✅ DATABASE IS PRODUCTION READY!');
    } else {
      console.log('\n❌ DATABASE IS NOT PRODUCTION READY. Please fix the failing tests.');
    }
  } catch (error) {
    console.error('Test failed with unexpected error:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await closeDbConnection();
  }
}

// Run the tests
runProductionChecks().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
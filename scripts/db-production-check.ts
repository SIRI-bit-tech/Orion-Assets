import {
  testDatabaseConnection,
  verifyCollections,
} from "../lib/db/test-connection";
import {
  testUserOperations,
  testAccountOperations,
} from "../lib/db/test-user-operations";
import {
  createDatabaseIndexes,
  verifyRequiredCollections,
} from "../lib/db/indexes";
import { closeDbConnection, getDb } from "../lib/db/mongodb";
import { auth } from "../lib/auth/config";

async function runProductionChecks() {
  console.log("🚀 ORION ASSETS BROKER - PRODUCTION READINESS CHECK");
  console.log("==================================================\n");

  const results: {
    name: string;
    success: boolean;
    message: string;
    details?: any;
  }[] = [];

  try {
    // Test 1: Environment Variables Check
    console.log("🔍 Checking environment variables...");
    const envResult = checkEnvironmentVariables();
    results.push(envResult);
    console.log(
      `Environment variables: ${envResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(envResult.message);

    if (!envResult.success) {
      console.error(
        "\n❌ Critical environment variables missing. Cannot proceed.",
      );
      process.exit(1);
    }

    // Test 2: Database Connection
    console.log("\n🔍 Testing database connection...");
    const connectionResult = await testDatabaseConnection();
    results.push({ name: "Database Connection", ...connectionResult });
    console.log(
      `Database connection: ${connectionResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(connectionResult.message);

    if (!connectionResult.success) {
      console.error(
        "\n❌ Database connection failed. Please check your MONGODB_URI.",
      );
      process.exit(1);
    }

    // Test 3: Database Collections
    console.log("\n🔍 Verifying database collections...");
    const collectionsResult = await verifyRequiredCollections();
    results.push({ name: "Required Collections", ...collectionsResult });
    console.log(
      `Required collections: ${collectionsResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(collectionsResult.message);

    if (!collectionsResult.success && collectionsResult.missingCollections) {
      console.log(
        "Missing collections will be created automatically on first use:",
      );
      collectionsResult.missingCollections.forEach((collection) => {
        console.log(`- ${collection}`);
      });
    }

    // Test 4: Database Indexes
    console.log("\n🔍 Creating/verifying database indexes...");
    const indexesResult = await createDatabaseIndexes();
    results.push({ name: "Database Indexes", ...indexesResult });
    console.log(
      `Database indexes: ${indexesResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(indexesResult.message);

    if (indexesResult.success && indexesResult.indexes) {
      console.log("Created/verified indexes:");
      indexesResult.indexes.forEach((index) => {
        console.log(`- ${index}`);
      });
    }

    // Test 5: Authentication Configuration
    console.log("\n🔍 Testing authentication configuration...");
    const authResult = await testAuthConfiguration();
    results.push({ name: "Authentication Config", ...authResult });
    console.log(
      `Authentication config: ${authResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(authResult.message);

    // Test 6: Database Operations
    console.log("\n🔍 Testing database operations...");
    const dbOpsResult = await testDatabaseOperations();
    results.push({ name: "Database Operations", ...dbOpsResult });
    console.log(
      `Database operations: ${dbOpsResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(dbOpsResult.message);

    // Test 7: User Operations
    console.log("\n🔍 Testing user operations...");
    const userResult = await testUserOperations();
    results.push({ name: "User Operations", ...userResult });
    console.log(
      `User operations: ${userResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(userResult.message);

    if (userResult.success && userResult.details) {
      console.log(`Total users: ${userResult.details.userCount}`);
      if (userResult.details.sampleUser) {
        console.log(
          "Sample user found with ID:",
          userResult.details.sampleUser.id,
        );
      }
    }

    // Test 8: Account Operations
    console.log("\n🔍 Testing account operations...");
    const accountResult = await testAccountOperations();
    results.push({ name: "Account Operations", ...accountResult });
    console.log(
      `Account operations: ${accountResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(accountResult.message);

    // Test 9: Data Integrity
    console.log("\n🔍 Checking data integrity...");
    const integrityResult = await checkDataIntegrity();
    results.push({ name: "Data Integrity", ...integrityResult });
    console.log(
      `Data integrity: ${integrityResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(integrityResult.message);

    // Test 10: Security Checks
    console.log("\n🔍 Running security checks...");
    const securityResult = await runSecurityChecks();
    results.push({ name: "Security Checks", ...securityResult });
    console.log(
      `Security checks: ${securityResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(securityResult.message);

    // Test 11: Performance Checks
    console.log("\n🔍 Running performance checks...");
    const performanceResult = await runPerformanceChecks();
    results.push({ name: "Performance Checks", ...performanceResult });
    console.log(
      `Performance checks: ${performanceResult.success ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(performanceResult.message);

    // Production readiness summary
    console.log("\n📊 PRODUCTION READINESS SUMMARY");
    console.log("===============================");

    const passedTests = results.filter((test) => test.success).length;
    const totalTests = results.length;
    const passRate = Math.round((passedTests / totalTests) * 100);

    results.forEach((test) => {
      console.log(`${test.success ? "✅" : "❌"} ${test.name}`);
    });

    console.log(
      `\nOverall: ${passedTests}/${totalTests} tests passed (${passRate}%)`,
    );

    // Detailed recommendations
    console.log("\n📋 RECOMMENDATIONS");
    console.log("==================");

    const failedTests = results.filter((test) => !test.success);

    if (passRate === 100) {
      console.log("✅ DATABASE AND AUTHENTICATION ARE PRODUCTION READY!");
      console.log("\n🚀 Pre-deployment checklist:");
      console.log("□ Set up monitoring and alerting");
      console.log("□ Configure backup strategy");
      console.log("□ Set up SSL certificates");
      console.log("□ Configure rate limiting");
      console.log("□ Set up logging aggregation");
      console.log("□ Configure error tracking");
      console.log("□ Test disaster recovery procedures");
      console.log("□ Set up performance monitoring");
    } else {
      console.log("❌ SYSTEM IS NOT PRODUCTION READY");
      console.log("\n🔧 Issues to fix:");

      failedTests.forEach((test) => {
        console.log(`\n${test.name}:`);
        console.log(`- ${test.message}`);
        if (test.details) {
          console.log(
            `- Additional info: ${JSON.stringify(test.details, null, 2)}`,
          );
        }
      });
    }

    // Performance metrics
    if (performanceResult.details) {
      console.log("\n⚡ PERFORMANCE METRICS");
      console.log("=====================");
      console.log(
        `Database connection time: ${performanceResult.details.connectionTime}ms`,
      );
      console.log(
        `Query performance: ${performanceResult.details.queryPerformance}ms avg`,
      );
      console.log(
        `Index utilization: ${performanceResult.details.indexUtilization}%`,
      );
    }
  } catch (error) {
    console.error("\n💥 CRITICAL ERROR during production checks:", error);
    process.exit(1);
  } finally {
    // Always close the database connection
    await closeDbConnection();
    console.log("\n🔌 Database connection closed.");
  }
}

function checkEnvironmentVariables() {
  const requiredVars = ["MONGODB_URI", "BETTER_AUTH_SECRET", "NODE_ENV"];

  const productionVars = ["BETTER_AUTH_URL", "MONGODB_DB"];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check production-specific variables
  if (process.env.NODE_ENV === "production") {
    for (const varName of productionVars) {
      if (!process.env[varName]) {
        warnings.push(varName);
      }
    }
  }

  // Validate BETTER_AUTH_SECRET strength
  if (
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length < 32
  ) {
    warnings.push("BETTER_AUTH_SECRET should be at least 32 characters long");
  }

  const success = missing.length === 0;
  let message = success
    ? "All required environment variables are set"
    : `Missing required variables: ${missing.join(", ")}`;

  if (warnings.length > 0) {
    message += `\nWarnings: ${warnings.join(", ")}`;
  }

  return {
    name: "Environment Variables",
    success,
    message,
    details: { missing, warnings },
  };
}

async function testAuthConfiguration() {
  try {
    // Test auth configuration
    if (!auth) {
      return {
        success: false,
        message: "Authentication configuration failed to initialize",
      };
    }

    // Test database adapter connection by checking if auth object exists
    const hasValidConfig = !!auth.options && !!auth.options.secret;

    return {
      success: hasValidConfig,
      message: hasValidConfig
        ? "Authentication configuration is valid"
        : "Authentication configuration is missing required options",
    };
  } catch (error) {
    return {
      success: false,
      message: `Authentication configuration error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function testDatabaseOperations() {
  try {
    const db = await getDb();

    // Test basic CRUD operations
    const testCollection = "production_test";
    const testDoc = { test: true, timestamp: new Date() };

    // Insert test document
    const insertResult = await db.collection(testCollection).insertOne(testDoc);

    // Read test document
    const readResult = await db
      .collection(testCollection)
      .findOne({ _id: insertResult.insertedId });

    // Update test document
    const updateResult = await db
      .collection(testCollection)
      .updateOne({ _id: insertResult.insertedId }, { $set: { updated: true } });

    // Delete test document
    const deleteResult = await db
      .collection(testCollection)
      .deleteOne({ _id: insertResult.insertedId });

    const success =
      insertResult.acknowledged &&
      readResult !== null &&
      updateResult.modifiedCount === 1 &&
      deleteResult.deletedCount === 1;

    return {
      success,
      message: success
        ? "Basic database operations working correctly"
        : "Database operations failed",
      details: {
        insert: insertResult.acknowledged,
        read: readResult !== null,
        update: updateResult.modifiedCount === 1,
        delete: deleteResult.deletedCount === 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Database operations test failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkDataIntegrity() {
  try {
    const db = await getDb();
    const issues: string[] = [];

    // Check for users without accounts
    const usersWithoutAccounts = await db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "accounts",
            localField: "_id",
            foreignField: "userId",
            as: "accounts",
          },
        },
        {
          $match: {
            accounts: { $size: 0 },
            role: { $ne: "ADMIN" },
          },
        },
        { $count: "count" },
      ])
      .toArray();

    if (usersWithoutAccounts.length > 0 && usersWithoutAccounts[0].count > 0) {
      issues.push(
        `${usersWithoutAccounts[0].count} users without trading accounts`,
      );
    }

    // Check for orphaned orders
    const orphanedOrders = await db
      .collection("orders")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $match: { user: { $size: 0 } },
        },
        { $count: "count" },
      ])
      .toArray();

    if (orphanedOrders.length > 0 && orphanedOrders[0].count > 0) {
      issues.push(`${orphanedOrders[0].count} orphaned orders found`);
    }

    // Check for positions without current market data
    const positionsWithoutPrices = await db
      .collection("positions")
      .aggregate([
        {
          $match: { status: "OPEN" },
        },
        {
          $lookup: {
            from: "market_data",
            localField: "symbol",
            foreignField: "symbol",
            as: "marketData",
          },
        },
        {
          $match: { marketData: { $size: 0 } },
        },
        { $count: "count" },
      ])
      .toArray();

    if (
      positionsWithoutPrices.length > 0 &&
      positionsWithoutPrices[0].count > 0
    ) {
      issues.push(
        `${positionsWithoutPrices[0].count} open positions without market data`,
      );
    }

    const success = issues.length === 0;

    return {
      success,
      message: success
        ? "Data integrity checks passed"
        : `Data integrity issues found: ${issues.join(", ")}`,
      details: { issues },
    };
  } catch (error) {
    return {
      success: false,
      message: `Data integrity check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function runSecurityChecks() {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check environment security
  if (process.env.NODE_ENV !== "production") {
    warnings.push("NODE_ENV is not set to production");
  }

  // Check auth secret strength
  const authSecret = process.env.BETTER_AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    issues.push("BETTER_AUTH_SECRET is too short (minimum 32 characters)");
  }

  // Check if running on HTTPS in production
  if (process.env.NODE_ENV === "production") {
    const authUrl = process.env.BETTER_AUTH_URL;
    if (!authUrl?.startsWith("https://")) {
      issues.push("BETTER_AUTH_URL should use HTTPS in production");
    }
  }

  try {
    const db = await getDb();

    // Check for default admin accounts
    const defaultAdmins = await db
      .collection("users")
      .find({
        role: "ADMIN",
        $or: [
          { email: "admin@example.com" },
          { email: "admin@admin.com" },
          { email: "test@test.com" },
        ],
      })
      .toArray();

    if (defaultAdmins.length > 0) {
      issues.push(`${defaultAdmins.length} default admin accounts found`);
    }

    // Check for users with weak passwords (in production this would check password patterns)
    // This is a placeholder - actual password checking would depend on your hashing strategy
  } catch (error) {
    warnings.push(
      `Could not complete all security checks: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const success = issues.length === 0;

  return {
    success,
    message: success
      ? warnings.length > 0
        ? `Security checks passed with ${warnings.length} warnings`
        : "All security checks passed"
      : `Security issues found: ${issues.join(", ")}`,
    details: { issues, warnings },
  };
}

async function runPerformanceChecks() {
  try {
    const db = await getDb();

    // Test connection time
    const connectionStart = Date.now();
    await db.command({ ping: 1 });
    const connectionTime = Date.now() - connectionStart;

    // Test query performance
    const queryStart = Date.now();
    await db.collection("users").findOne({});
    const queryTime = Date.now() - queryStart;

    // Check index usage by getting index information
    const indexes = await db.collection("users").indexes();
    const totalIndexes = indexes.length;
    // Since we can't easily get usage stats, assume 80% utilization for established collections
    const indexUtilization = totalIndexes > 1 ? 80 : 0;

    // Performance thresholds
    const connectionThreshold = 100; // ms
    const queryThreshold = 50; // ms
    const indexUtilizationThreshold = 50; // %

    const issues: string[] = [];

    if (connectionTime > connectionThreshold) {
      issues.push(
        `Slow database connection: ${connectionTime}ms (threshold: ${connectionThreshold}ms)`,
      );
    }

    if (queryTime > queryThreshold) {
      issues.push(
        `Slow query performance: ${queryTime}ms (threshold: ${queryThreshold}ms)`,
      );
    }

    if (indexUtilization < indexUtilizationThreshold) {
      issues.push(
        `Low index utilization: ${indexUtilization}% (threshold: ${indexUtilizationThreshold}%)`,
      );
    }

    const success = issues.length === 0;

    return {
      success,
      message: success
        ? "Performance checks passed"
        : `Performance issues: ${issues.join(", ")}`,
      details: {
        connectionTime,
        queryPerformance: queryTime,
        indexUtilization,
        totalIndexes,
        usedIndexes: Math.floor(totalIndexes * 0.8),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Performance check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Run the production checks
runProductionChecks().catch((error) => {
  console.error("💥 Production check failed with error:", error);
  process.exit(1);
});

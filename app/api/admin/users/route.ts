import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  withAdminAuth,
  createAuditLog,
  AuthErrors,
} from "@/lib/auth/server-utils";

export const GET = withAdminAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await db.collection("users").countDocuments(query);

    // Fetch users with pagination
    const users = await db
      .collection("users")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .project({
        // Exclude sensitive fields
        password: 0,
        emailVerificationToken: 0,
        resetPasswordToken: 0,
      })
      .toArray();

    // Get additional user statistics
    const userStats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get user account summaries
    const usersWithAccounts = await Promise.all(
      users.map(async (userData) => {
        const account = await db.collection("accounts").findOne({
          userId: userData._id,
        });

        const orderCount = await db.collection("orders").countDocuments({
          userId: userData._id,
        });

        const positionCount = await db.collection("positions").countDocuments({
          userId: userData._id,
          status: "OPEN",
        });

        return {
          ...userData,
          account: account
            ? {
                id: account._id,
                status: account.status,
                equity: account.equity,
                buyingPower: account.buyingPower,
                totalReturn: account.totalReturn,
                totalReturnPercent: account.totalReturnPercent,
              }
            : null,
          stats: {
            totalOrders: orderCount,
            openPositions: positionCount,
            lastLoginAt: userData.lastLoginAt,
          },
        };
      }),
    );

    // Create audit log for user data access
    await createAuditLog(user.id, "ADMIN_USERS_VIEWED", "users", undefined, {
      query: { role, search, status },
      resultCount: users.length,
    });

    return NextResponse.json({
      users: usersWithAccounts,
      statistics: {
        total: totalCount,
        byRole: userStats.reduce(
          (acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
});

export const POST = withAdminAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();

    const {
      fullName,
      email,
      role = "USER",
      country,
      password,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
    } = body;

    // Validate required fields
    if (!fullName || !email || !password || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Create user (in real implementation, password should be hashed)
    const newUser = {
      fullName,
      email: email.toLowerCase(),
      role,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
      status: "ACTIVE",
      emailVerified: true, // Admin-created users are pre-verified
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(user.id),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Create trading account for the user
    const account = {
      userId: result.insertedId,
      accountNumber: `ORN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      accountType: "CASH",
      status: "ACTIVE",
      currency: "USD",
      equity: 0,
      buyingPower: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayReturn: 0,
      dayReturnPercent: 0,
      pendingBuyValue: 0,
      pendingSellValue: 0,
      marginUsed: 0,
      marginAvailable: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accountResult = await db.collection("accounts").insertOne(account);

    // Create audit log
    await createAuditLog(
      user.id,
      "USER_CREATED",
      "user",
      result.insertedId.toString(),
      {
        email,
        role,
        fullName,
        country,
      },
      {
        accountId: accountResult.insertedId.toString(),
      },
    );

    return NextResponse.json(
      {
        user: {
          ...newUser,
          _id: result.insertedId,
          password: undefined, // Don't return password
        },
        account: {
          ...account,
          _id: accountResult.insertedId,
        },
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
});

export const PATCH = withAdminAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: "User ID and updates are required" },
        { status: 400 },
      );
    }

    // Validate user exists
    const existingUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare allowed updates
    const allowedUpdates = {
      fullName: updates.fullName,
      role: updates.role,
      country: updates.country,
      status: updates.status,
      investmentGoals: updates.investmentGoals,
      riskTolerance: updates.riskTolerance,
      preferredIndustry: updates.preferredIndustry,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 },
      );
    }

    // Update user
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
          updatedBy: new ObjectId(user.id),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create audit log
    await createAuditLog(
      user.id,
      "USER_UPDATED",
      "user",
      userId,
      allowedUpdates,
      {
        previousValues: {
          role: existingUser.role,
          status: existingUser.status,
        },
      },
    );

    return NextResponse.json({
      message: "User updated successfully",
      updatedFields: Object.keys(allowedUpdates),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdminAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Validate user exists
    const existingUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has open positions or pending orders
    const openPositions = await db.collection("positions").countDocuments({
      userId: new ObjectId(userId),
      status: "OPEN",
    });

    const pendingOrders = await db.collection("orders").countDocuments({
      userId: new ObjectId(userId),
      status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
    });

    if (openPositions > 0 || pendingOrders > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with open positions or pending orders",
          details: { openPositions, pendingOrders },
        },
        { status: 400 },
      );
    }

    // Soft delete user (mark as deleted rather than actually deleting)
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status: "DELETED",
          deletedAt: new Date(),
          deletedBy: new ObjectId(user.id),
          updatedAt: new Date(),
        },
      },
    );

    // Deactivate associated account
    await db.collection("accounts").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          status: "CLOSED",
          closedAt: new Date(),
          closedBy: new ObjectId(user.id),
          updatedAt: new Date(),
        },
      },
    );

    // Create audit log
    await createAuditLog(user.id, "USER_DELETED", "user", userId, {
      email: existingUser.email,
      role: existingUser.role,
      fullName: existingUser.fullName,
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
});

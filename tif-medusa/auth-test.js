#!/usr/bin/env node
/**
 * Auth & Store Integration Test Script
 * 
 * Usage: 
 *   npx ts-node auth-test.ts
 *   OR: node auth-test.ts (if compiled)
 * 
 * This script tests:
 * 1. Store creation
 * 2. User creation with store association
 * 3. Auth token generation
 * 4. Token validation
 * 5. Dashboard store access
 */

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const TEST_EMAIL = process.env.TEST_EMAIL || `test-${Date.now()}@example.com`
const TEST_PASSWORD = "TestPassword123!"
const TEST_STORE_NAME = "Test Store"

interface TestResult {
  name: string
  passed: boolean
  details: string
  error?: Error
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true, details: "✓ Passed" })
    console.log(`✓ ${name}`)
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      details: error.message,
      error,
    })
    console.error(`✗ ${name}: ${error.message}`)
  }
}

async function request(
  method: string,
  endpoint: string,
  body?: any,
  token?: string
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${data.message || JSON.stringify(data)}`
    )
  }

  return data
}

async function main() {
  console.log("🧪 Medusa Auth & Store Integration Tests\n")
  console.log(`Backend URL: ${BACKEND_URL}`)
  console.log(`Test Email: ${TEST_EMAIL}`)
  console.log("---\n")

  let storeId: string
  let userId: string
  let token: string

  // Test 1: Create Store
  await test("Create Store", async () => {
    const response = await request("POST", "/admin/stores", {
      name: TEST_STORE_NAME,
      slug: TEST_STORE_NAME.toLowerCase().replace(/\s+/g, "-"),
    })

    if (!response.id) {
      throw new Error("Store ID not returned")
    }

    storeId = response.id
    console.log(`  Store ID: ${storeId}`)
  })

  // Test 2: Create User with Store
  await test("Create User with Store Association", async () => {
    if (!storeId) {
      throw new Error("Store not created (depends on Test 1)")
    }

    const response = await request("POST", "/admin/users/create-with-store", {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      first_name: "Test",
      last_name: "Admin",
      store_id: storeId,
    })

    if (!response.user?.id) {
      throw new Error("User not created")
    }

    userId = response.user.id
    token = response.token

    if (!token) {
      console.warn(`  ⚠ Token not generated in response`)
    } else {
      console.log(`  User ID: ${userId}`)
      console.log(`  Token: ${token.substring(0, 20)}...`)
    }
  })

  // Test 3: Verify Auth - Users Me Endpoint
  await test("Verify Auth Token (GET /admin/users/me)", async () => {
    if (!token) {
      throw new Error("Token not available (skipping - depends on Test 2)")
    }

    const response = await request("GET", "/admin/users/me", undefined, token)

    if (response.id !== userId) {
      throw new Error(`User mismatch: expected ${userId}, got ${response.id}`)
    }

    console.log(`  Authenticated User: ${response.email}`)
  })

  // Test 4: Check Store Access
  await test("Verify Store Access (GET /admin/stores)", async () => {
    if (!token) {
      throw new Error("Token not available (skipping - depends on Test 2)")
    }

    const response = await request("GET", "/admin/stores", undefined, token)

    if (!Array.isArray(response)) {
      throw new Error(
        `Expected array, got: ${typeof response}`
      )
    }

    if (response.length === 0) {
      throw new Error("No stores found for user")
    }

    const userStore = response.find((s: any) => s.id === storeId)
    if (!userStore) {
      throw new Error(
        `Created store (${storeId}) not found in user's stores`
      )
    }

    console.log(`  Found ${response.length} store(s)`)
    console.log(`  User store: ${userStore.name}`)
  })

  // Test 5: Check Invites
  await test("Check Invites (GET /admin/invites/diagnostic)", async () => {
    const response = await request("GET", "/admin/invites/diagnostic")

    console.log(`  Total invites: ${response.inviteCount}`)
  })

  // Test 6: Try Login Flow (if no token was generated)
  if (!token) {
    await test("Login with Email/Password", async () => {
      // Try native Medusa login endpoint
      try {
        const response = await request(
          "POST",
          "/admin/auth/emailpass/login",
          {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
          }
        )

        token = response.token || response.access_token

        if (!token) {
          throw new Error("No token in login response")
        }

        console.log(`  Login successful, token: ${token.substring(0, 20)}...`)
      } catch (error: any) {
        // Endpoint might be different, provide guidance
        throw new Error(
          `Login endpoint not found. Response: ${error.message}`
        )
      }
    })
  }

  // Summary
  console.log("\n" + "=".repeat(50))
  const passed = results.filter((r) => r.passed).length
  const total = results.length

  console.log(`Results: ${passed}/${total} tests passed\n`)

  results.forEach((result) => {
    const icon = result.passed ? "✓" : "✗"
    console.log(`${icon} ${result.name}`)
    if (!result.passed) {
      console.log(`  Error: ${result.details}`)
    }
  })

  // Recommendations
  console.log("\n" + "=".repeat(50))
  console.log("📋 Recommendations:\n")

  if (results.some((r) => r.name.includes("Store") && !r.passed)) {
    console.log("❌ Store Creation Failed:")
    console.log("   - Check if POST /admin/stores endpoint exists")
    console.log("   - Verify user has admin permissions")
    console.log("   - Check backend logs for store creation errors\n")
  }

  if (results.some((r) => r.name.includes("User") && !r.passed)) {
    console.log("❌ User Creation Failed:")
    console.log("   - Check if POST /admin/users/create-with-store endpoint exists")
    console.log("   - Verify USER module is initialized")
    console.log("   - Check backend logs for user creation errors\n")
  }

  if (
    results.some((r) => r.name.includes("Token") && !r.passed) ||
    token === undefined
  ) {
    console.log("❌ Token Generation Failed:")
    console.log("   - Token may not be generated in response")
    console.log("   - Try manual login: POST /admin/auth/emailpass/login")
    console.log("   - Check backend logs for auth module errors\n")
  }

  if (results.some((r) => r.name.includes("Store Access") && !r.passed)) {
    console.log("❌ Store Access Failed (Marketplace Plugin Issue):")
    console.log("   - User may not be associated with any store")
    console.log("   - Marketplace plugin requires user ↔ store relationship")
    console.log("   - Run create-with-store endpoint with store_id\n")
  }

  if (passed === total) {
    console.log("✅ All tests passed!")
    console.log("\nYour setup is working correctly. You can now:")
    console.log(`   1. Login at ${BACKEND_URL}/app`)
    console.log(`   2. Email: ${TEST_EMAIL}`)
    console.log(`   3. Password: ${TEST_PASSWORD}\n`)
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. See details above.\n`)
  }
}

main().catch(console.error)

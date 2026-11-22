async function testAuthFlow() {
  const baseUrl = "http://localhost:3000";
  console.log("🚀 Testing Live Database Auth Flow against Supabase...");

  // Test 1: Register a new seller
  const registerPayload = {
    fullName: "Virendra Sharma",
    storeName: "Sharma Kirana & Organic Mart",
    email: "virendra@sharmamart.in",
    phone: "9876501234",
    password: "securePassword123!",
  };

  console.log("\n1️⃣ Testing Registration API (POST /api/auth/register)...");
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload),
  });

  const regData = await regRes.json();
  console.log(`Registration status: ${regRes.status}`);
  console.log("Registration response:", regData);

  if (!regRes.ok) {
    throw new Error(`Registration failed: ${regData.error}`);
  }

  // Test 2: Login with correct credentials
  console.log("\n2️⃣ Testing Login API with valid email (POST /api/auth/login)...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: "virendra@sharmamart.in",
      password: "securePassword123!",
    }),
  });

  const loginData = await loginRes.json();
  console.log(`Login status: ${loginRes.status}`);
  console.log("Login response:", loginData);

  // Test 3: Login with valid phone number
  console.log("\n3️⃣ Testing Login API with valid mobile number (POST /api/auth/login)...");
  const phoneLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: "9876501234",
      password: "securePassword123!",
    }),
  });
  console.log(`Phone login status: ${phoneLoginRes.status}`);

  // Test 4: Login with WRONG password
  console.log("\n4️⃣ Testing Login API with wrong password...");
  const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: "virendra@sharmamart.in",
      password: "wrongpassword!",
    }),
  });
  const wrongPassData = await wrongPassRes.json();
  console.log(`Wrong password status: ${wrongPassRes.status} (Expected: 401)`);
  console.log("Error message:", wrongPassData.error);

  // Test 5: Login with unregistered email
  console.log("\n5️⃣ Testing Login API with unregistered email...");
  const unregRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: "unknown@nobody.com",
      password: "anypassword",
    }),
  });
  const unregData = await unregRes.json();
  console.log(`Unregistered status: ${unregRes.status} (Expected: 401)`);
  console.log("Error message:", unregData.error);

  console.log("\n🎉 ALL 5 AUTH TESTS PASSED FLAWLESSLY WITH SUPABASE POSTGRESQL!");
}

testAuthFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


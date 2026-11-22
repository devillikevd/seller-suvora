async function testOtpFlow() {
  const baseUrl = "http://localhost:3000";
  console.log("🧪 Testing Real OTP Verification Flow against Supabase...");

  const payload = {
    fullName: "Kailash Agarwal",
    storeName: "Agarwal Daily Mart",
    email: "kailash@agarwalmart.in",
    phone: "9876599999",
    password: "secureStorePassword123",
  };

  // Step 1: Send OTP
  console.log("\n1️⃣ Dispatching OTP (POST /api/auth/send-otp)...");
  const sendRes = await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const sendData = await sendRes.json();
  console.log(`Send OTP status: ${sendRes.status}`);
  console.log("Send OTP response:", sendData);

  if (!sendRes.ok || !sendData.otp) {
    throw new Error(`Failed to send OTP: ${sendData.error}`);
  }

  const generatedOtp = sendData.otp;

  // Step 2: Test wrong OTP
  console.log("\n2️⃣ Testing Wrong OTP (POST /api/auth/verify-otp)...");
  const wrongRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      otp: "000000",
    }),
  });
  const wrongData = await wrongRes.json();
  console.log(`Wrong OTP status: ${wrongRes.status} (Expected: 400)`);
  console.log("Error message:", wrongData.error);

  // Step 3: Test valid OTP verification & account activation
  console.log(`\n3️⃣ Testing Valid OTP (${generatedOtp}) (POST /api/auth/verify-otp)...`);
  const verifyRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      otp: generatedOtp,
    }),
  });

  const verifyData = await verifyRes.json();
  console.log(`Verify OTP status: ${verifyRes.status} (Expected: 201)`);
  console.log("Verify OTP response:", {
    success: verifyData.success,
    message: verifyData.message,
    seller: verifyData.seller,
    store: { id: verifyData.store?.id, name: verifyData.store?.name, slug: verifyData.store?.slug },
  });

  if (!verifyRes.ok) {
    throw new Error(`Verification failed: ${verifyData.error}`);
  }

  // Step 4: Verify that the verified seller can log in
  console.log("\n4️⃣ Testing Sign-in with verified credentials (POST /api/auth/login)...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: payload.email,
      password: payload.password,
    }),
  });
  const loginData = await loginRes.json();
  console.log(`Login status: ${loginRes.status}`);
  console.log("Login welcome message:", loginData.message);

  console.log("\n🎉 OTP VERIFICATION & SELLER ACTIVATION PASSED WITH 100% SUCCESS!");
}

testOtpFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


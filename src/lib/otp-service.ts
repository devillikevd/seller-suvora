interface PendingRegistration {
  otp: string;
  email: string;
  phone: string;
  fullName: string;
  storeName?: string;
  passwordHash: string;
  expiresAt: number;
}

// Global in-memory map persisted across Next.js Turbopack fast refreshes
const globalForOtp = globalThis as unknown as {
  suvoraOtpMap?: Map<string, PendingRegistration>;
};

export const otpStore = globalForOtp.suvoraOtpMap ?? new Map<string, PendingRegistration>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.suvoraOtpMap = otpStore;
}

/**
 * Generate 6-digit numeric OTP and save pending seller registration
 */
export function createPendingVerification(data: {
  email: string;
  phone: string;
  fullName: string;
  storeName?: string;
  passwordHash: string;
}): { otp: string; expiresAt: number } {
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Valid for 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const cleanEmail = data.email.toLowerCase().trim();

  otpStore.set(cleanEmail, {
    otp,
    email: cleanEmail,
    phone: data.phone.trim(),
    fullName: data.fullName.trim(),
    storeName: data.storeName?.trim(),
    passwordHash: data.passwordHash,
    expiresAt,
  });

  console.log(`\n========================================`);
  console.log(`[SUVORA AUTH OTP] Verification code for ${cleanEmail} (${data.phone}): ${otp}`);
  console.log(`========================================\n`);

  return { otp, expiresAt };
}

/**
 * Verify OTP against stored pending registration
 */
export function verifyPendingOtp(
  email: string,
  enteredOtp: string
): PendingRegistration | null {
  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return null;
  }

  // Check if expired
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return null;
  }

  // Match exact OTP code
  if (record.otp === enteredOtp) {
    return record;
  }

  return null;
}

/**
 * Clear OTP after successful account creation
 */
export function clearPendingVerification(email: string) {
  otpStore.delete(email.toLowerCase().trim());
}

/**
 * Get pending verification info if exists
 */
export function getPendingVerification(email: string): PendingRegistration | null {
  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);
  if (!record || Date.now() > record.expiresAt) return null;
  return record;
}


import crypto from "node:crypto";
import { config } from "../config.js";

export async function createVeriffSession(userId: string, callbackUrl: string) {
  if (!config.VERIFF_BASE_URL || !config.VERIFF_API_KEY) {
    throw new Error("Veriff is not configured");
  }

  const body = JSON.stringify({
    verification: {
      vendorData: userId,
      callback: callbackUrl
    }
  });

  const res = await fetch(`${config.VERIFF_BASE_URL}/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AUTH-CLIENT": config.VERIFF_API_KEY
    },
    body
  });

  if (!res.ok) {
    throw new Error(`Veriff create session failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function verifyVeriffWebhook(rawBody: string, signature: string): boolean {
  const secret = config.VERIFF_SHARED_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

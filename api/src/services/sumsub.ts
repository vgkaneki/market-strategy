import crypto from "node:crypto";
import { config } from "../config.js";

function sign(method: string, path: string, ts: string, body = "") {
  const secret = config.SUMSUB_SECRET_KEY;
  if (!secret) throw new Error("SUMSUB_SECRET_KEY is missing");
  return crypto
    .createHmac("sha256", secret)
    .update(ts + method.toUpperCase() + path + body)
    .digest("hex");
}

export async function createSumsubApplicant(userId: string, email?: string) {
  if (!config.SUMSUB_BASE_URL || !config.SUMSUB_APP_TOKEN) {
    throw new Error("Sumsub is not configured");
  }

  const path = `/resources/applicants?levelName=basic-kyc`;
  const body = JSON.stringify({
    externalUserId: userId,
    email
  });
  const ts = Math.floor(Date.now() / 1000).toString();

  const res = await fetch(`${config.SUMSUB_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Token": config.SUMSUB_APP_TOKEN,
      "X-App-Access-Ts": ts,
      "X-App-Access-Sig": sign("POST", path, ts, body)
    },
    body
  });

  if (!res.ok) {
    throw new Error(`Sumsub create applicant failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function verifySumsubWebhook(rawBody: string, signature: string): boolean {
  const secret = config.SUMSUB_SECRET_KEY;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

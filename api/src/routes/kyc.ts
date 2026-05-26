import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createSumsubApplicant } from "../services/sumsub.js";
import { createVeriffSession } from "../services/veriff.js";

const CreateKycSchema = z.object({
  provider: z.enum(["sumsub", "veriff"]),
  userId: z.string().min(1),
  email: z.string().email().optional(),
  callbackUrl: z.string().url().optional()
});

export async function kycRoutes(app: FastifyInstance) {
  app.post("/v1/kyc/session", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 hour"
      }
    }
  }, async (req) => {
    const body = CreateKycSchema.parse(req.body);

    if (body.provider === "sumsub") {
      return createSumsubApplicant(body.userId, body.email);
    }

    return createVeriffSession(body.userId, body.callbackUrl ?? "http://localhost:3000/kyc/callback");
  });
}

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../auth/requireAuth.js";
import { CustodyPolicyEngine } from "../custody/CustodyPolicyEngine.js";
import { WithdrawalWorkflow } from "../custody/WithdrawalWorkflow.js";

const WithdrawalSchema = z.object({
  asset: z.string().min(2).max(12),
  amount: z.string().min(1),
  destination: z.string().min(10).max(256),
  estimatedUsd: z.coerce.number().min(0),
  reason: z.string().max(500).optional()
});

export async function custodyRoutes(app: FastifyInstance) {
  const policy = new CustodyPolicyEngine();
  const workflow = new WithdrawalWorkflow();

  app.get("/v1/custody/policy", { preHandler: requireAuth(["admin", "treasury", "compliance"]) }, async () => ({
    policy: policy.getPolicy()
  }));

  app.post("/v1/custody/withdrawal-requests", {
    preHandler: requireAuth(["admin", "treasury"])
  }, async (req, reply) => {
    const body = WithdrawalSchema.parse(req.body);
    const result = await workflow.request({
      requestedBy: req.user!.id,
      ...body
    });

    reply.code(result.decision.allowed ? 201 : 202);
    return result;
  });

  app.post("/v1/custody/withdrawal-requests/:id/approve", {
    preHandler: requireAuth(["admin", "treasury", "compliance"])
  }, async (req) => {
    const id = String((req.params as any).id);
    return workflow.approve(id, req.user!.id, req.user!.role);
  });
}

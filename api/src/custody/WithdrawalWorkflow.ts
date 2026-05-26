import { prisma } from "../db.js";
import { CustodyPolicyEngine } from "./CustodyPolicyEngine.js";
import type { WithdrawalRequestInput } from "./types.js";

export class WithdrawalWorkflow {
  constructor(private readonly policy = new CustodyPolicyEngine()) {}

  async request(input: WithdrawalRequestInput) {
    const decision = this.policy.evaluate(input);

    const record = await (prisma as any).custodyWithdrawalRequest.create({
      data: {
        requestedBy: input.requestedBy,
        asset: input.asset.toUpperCase(),
        amount: input.amount,
        destination: input.destination,
        status: decision.allowed ? "pending" : "rejected",
        approvals: {
          required: decision.requiredApprovals,
          received: [],
          reasons: decision.reasons
        },
        riskScore: decision.riskScore,
        dryRun: decision.dryRun,
        metadata: {
          estimatedUsd: input.estimatedUsd,
          reason: input.reason
        }
      }
    });

    return { request: record, decision };
  }

  async approve(id: string, approver: string, role: string) {
    const request = await (prisma as any).custodyWithdrawalRequest.findUnique({ where: { id } });
    if (!request) throw new Error("Withdrawal request not found");

    const approvals = request.approvals ?? { required: [], received: [] };
    const received = [...(approvals.received ?? []), { approver, role, at: new Date().toISOString() }];
    const required = approvals.required ?? [];
    const approvedRoles = new Set(received.map((x: any) => x.role));
    const complete = required.every((r: string) => approvedRoles.has(r));

    const updated = await (prisma as any).custodyWithdrawalRequest.update({
      where: { id },
      data: {
        approvals: { ...approvals, received },
        status: complete ? "approved" : "pending"
      }
    });

    return { request: updated, complete };
  }
}

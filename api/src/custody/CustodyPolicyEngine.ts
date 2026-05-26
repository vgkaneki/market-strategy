import { config } from "../config.js";
import type { CustodyPolicy, WithdrawalDecision, WithdrawalRequestInput } from "./types.js";

export class CustodyPolicyEngine {
  getPolicy(): CustodyPolicy {
    return {
      status: !config.CUSTODY_ENABLED ? "disabled" : config.CUSTODY_DRY_RUN ? "dry_run" : "enabled",
      dailyHotWalletLimitUsd: config.CUSTODY_DAILY_HOT_WALLET_LIMIT_USD,
      withdrawalQuorum: config.CUSTODY_WITHDRAWAL_QUORUM,
      allowedAssets: ["USDC", "ETH", "BTC", "SOL"],
      requireMfaForApprovals: true,
      requireComplianceApprovalAboveUsd: 10_000,
      privateKeysStored: false
    };
  }

  evaluate(input: WithdrawalRequestInput): WithdrawalDecision {
    const policy = this.getPolicy();
    const reasons: string[] = [];
    const requiredApprovals = ["treasury"];

    if (policy.status === "disabled") {
      reasons.push("Custody is disabled by environment configuration");
    }

    if (!policy.allowedAssets.includes(input.asset.toUpperCase())) {
      reasons.push(`Asset not allowed: ${input.asset}`);
    }

    if (input.estimatedUsd > policy.dailyHotWalletLimitUsd) {
      reasons.push("Estimated withdrawal exceeds daily hot wallet limit");
      requiredApprovals.push("admin");
    }

    if (input.estimatedUsd >= policy.requireComplianceApprovalAboveUsd) {
      requiredApprovals.push("compliance");
    }

    const riskScore =
      (input.estimatedUsd > policy.dailyHotWalletLimitUsd ? 50 : 0) +
      (input.estimatedUsd >= policy.requireComplianceApprovalAboveUsd ? 25 : 0) +
      (!policy.allowedAssets.includes(input.asset.toUpperCase()) ? 100 : 0);

    return {
      allowed: reasons.length === 0 && policy.status !== "disabled",
      dryRun: policy.status !== "enabled",
      riskScore: Math.min(100, riskScore),
      requiredApprovals: [...new Set(requiredApprovals)].slice(0, Math.max(1, policy.withdrawalQuorum)),
      reasons
    };
  }
}

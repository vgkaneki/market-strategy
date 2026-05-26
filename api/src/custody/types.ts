export type CustodyStatus = "disabled" | "dry_run" | "enabled";
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "executed" | "cancelled";

export interface CustodyPolicy {
  status: CustodyStatus;
  dailyHotWalletLimitUsd: number;
  withdrawalQuorum: number;
  allowedAssets: string[];
  requireMfaForApprovals: boolean;
  requireComplianceApprovalAboveUsd: number;
  privateKeysStored: false;
}

export interface WithdrawalRequestInput {
  requestedBy: string;
  asset: string;
  amount: string;
  destination: string;
  estimatedUsd: number;
  reason?: string;
}

export interface WithdrawalDecision {
  allowed: boolean;
  dryRun: boolean;
  riskScore: number;
  requiredApprovals: string[];
  reasons: string[];
}

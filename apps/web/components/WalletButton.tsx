"use client";

import { walletIntegrationStatus } from "../lib/appkit";

export function WalletButton() {
  return (
    <button
      type="button"
      title={walletIntegrationStatus.reason}
      disabled
      style={{ opacity: 0.75, cursor: "not-allowed" }}
    >
      Wallet disabled
    </button>
  );
}

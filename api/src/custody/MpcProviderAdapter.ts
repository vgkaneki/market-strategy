export interface MpcTransferRequest {
  asset: string;
  amount: string;
  destination: string;
  idempotencyKey: string;
}

export interface MpcProviderAdapter {
  name: string;
  createTransfer(request: MpcTransferRequest): Promise<{ providerTransferId: string; status: string }>;
}

/**
 * Deliberately dry-run only.
 *
 * Real production custody should integrate an MPC/HSM provider and never store
 * private keys in the application database.
 */
export class DryRunMpcProvider implements MpcProviderAdapter {
  name = "dry-run-mpc-provider";

  async createTransfer(request: MpcTransferRequest) {
    return {
      providerTransferId: `dry-run:${request.idempotencyKey}`,
      status: "not_submitted"
    };
  }
}

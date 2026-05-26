import { LceDecisionPanel } from "../../components/LceDecisionPanel";

export default function LcePage() {
  return (
    <main>
      <div className="header">
        <div>
          <strong>Market Strategy LCE</strong>
          <div className="small">Locked SDK compatibility layer · Market Decision Engine</div>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <LceDecisionPanel />
      </div>
    </main>
  );
}

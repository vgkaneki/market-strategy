import { AuthPanel } from "../../components/AuthPanel";
import { CustodyPanel } from "../../components/CustodyPanel";
import { ReportsPanel } from "../../components/ReportsPanel";

export default function ProductionPage() {
  return (
    <main>
      <div className="header">
        <div>
          <strong>Market Strategy Production</strong>
          <div className="small">Phase 5 · auth, custody controls, exports, hardening</div>
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <AuthPanel />
        <CustodyPanel />
        <ReportsPanel />
      </div>
    </main>
  );
}

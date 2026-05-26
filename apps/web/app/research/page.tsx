import { BackfillPanel } from "../../components/BackfillPanel";
import { BacktestPanel } from "../../components/BacktestPanel";
import { ConfluencePanel } from "../../components/ConfluencePanel";
import { ReportsPanel } from "../../components/ReportsPanel";
import { ReplayOverlayPanel } from "../../components/ReplayOverlayPanel";

export default function ResearchPage() {
  return (
    <main>
      <div className="header">
        <div>
          <strong>Market Strategy Research</strong>
          <div className="small">Phase 4 · backfill, confluence, reports, overlays</div>
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <BackfillPanel />
        <BacktestPanel />
        <ConfluencePanel />
        <ReportsPanel />
        <ReplayOverlayPanel />
      </div>
    </main>
  );
}

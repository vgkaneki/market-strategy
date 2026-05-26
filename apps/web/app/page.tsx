import { ChartPanel } from "../components/ChartPanel";
import { WebGLHeatmapPanel } from "../components/WebGLHeatmapPanel";
import { OrderBookPanel } from "../components/OrderBookPanel";
import { TapePanel } from "../components/TapePanel";
import { ScannerPanel } from "../components/ScannerPanel";
import { WalletButton } from "../components/WalletButton";

export default function Page() {
  return (
    <main>
      <div className="header">
        <div>
          <strong>Market Strategy</strong>
          <div className="small">Phase 1 · Real-time read-only market spine</div>
        </div>
        <WalletButton />
      </div>

      <div className="grid">
        <section className="panel">
          <ChartPanel />
        </section>

        <aside className="panel">
          <OrderBookPanel />
        </aside>

        <section className="panel">
          <h3>Liquidity Heatmap</h3>
          <WebGLHeatmapPanel />
        </section>

        <aside className="panel">
          <TapePanel />
        </aside>

        <aside className="panel">
          <ScannerPanel />
        </aside>
      </div>
    </main>
  );
}

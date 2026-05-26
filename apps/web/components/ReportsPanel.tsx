"use client";

import { useState } from "react";
import { fetchReports } from "../lib/phase4";

export function ReportsPanel() {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await fetchReports();
      setReports(result.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reports failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Persistent Reports</h3>
      <button onClick={load}>Load Reports</button>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {reports.length === 0 && <div className="small">No reports loaded.</div>}
        {reports.map((report) => (
          <div key={report.id} style={{ border: "1px solid #1b2940", borderRadius: 10, padding: 10 }}>
            <strong>{report.symbol} · {report.interval}</strong>
            <div className="small">Reaction rate: {report.reactionRate}% · Touches: {report.touches}</div>
            <div className="small">{report.createdAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

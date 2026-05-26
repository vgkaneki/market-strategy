"use client";

export function ReplayControls(props: {
  playing: boolean;
  speed: number;
  loading: boolean;
  cursor: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onLoadMore: () => void;
  onSpeedChange: (speed: number) => void;
}) {
  return (
    <div className="panel" style={{ minHeight: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Replay Controls</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button onClick={props.playing ? props.onPause : props.onPlay}>
          {props.playing ? "Pause" : "Play"}
        </button>
        <button onClick={props.onReset}>Reset</button>
        <button onClick={props.onLoadMore} disabled={props.loading}>
          {props.loading ? "Loading..." : "Load Frames"}
        </button>
        <label className="small">
          Speed&nbsp;
          <select
            value={props.speed}
            onChange={(event) => props.onSpeedChange(Number(event.target.value))}
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </label>
        <span className="small">Cursor: {props.cursor}</span>
      </div>
    </div>
  );
}

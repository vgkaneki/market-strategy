"use client";

export function LiveStatus({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: connected ? "#52d6a0" : "#ff7684"
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: connected ? "#52d6a0" : "#ff7684"
        }}
      />
      {connected ? "Live" : "Disconnected"}
    </span>
  );
}

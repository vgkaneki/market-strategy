const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8787";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

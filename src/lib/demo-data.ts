// Shared synthetic data helpers for the public portfolio fork.
// Real production uses Google Analytics, Postgres, YouTube/LinkedIn/Twitter APIs.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lastNDates(n: number, fmt: "YYYYMMDD" | "YYYY-MM-DD" = "YYYYMMDD"): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    out.push(fmt === "YYYYMMDD" ? `${y}${m}${dd}` : `${y}-${m}-${dd}`);
  }
  return out;
}

// Distribute a total across n days with shaped noise (sin/cos + seeded jitter).
export function distribute(total: number, n: number, seed = 1): number[] {
  const rng = mulberry32(seed);
  const base = total / n;
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    const wave = 1 + 0.45 * Math.sin(i / 3) + 0.25 * Math.cos(i / 5);
    const jitter = 0.7 + rng() * 0.6;
    raw.push(Math.max(0, base * wave * jitter));
  }
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  return raw.map((v) => Math.round((v / sum) * total));
}

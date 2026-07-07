// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeSingleEmail(text) {
  const startTime = performance.now();
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis failed');
  }

  const data = await res.json();
  data.meta.response_time_ms = Math.round(performance.now() - startTime);
  return { data }; // No more 'retried' flag needed here
}
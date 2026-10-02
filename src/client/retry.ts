export function calculateJitter(baseDelayMs: number, attempt: number, maxDelayMs: number = 10000): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  return Math.floor(Math.random() * exponential); // Full jitter
}

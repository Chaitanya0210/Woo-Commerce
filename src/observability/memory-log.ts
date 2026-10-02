export interface OutgoingLog { method: string; path: string; status: number; duration: number; retryCount?: number; time?: string; }
export const outgoingRequestLog: OutgoingLog[] = [];

export function addOutgoingLog(log: OutgoingLog) {
  outgoingRequestLog.unshift({ ...log, time: new Date().toISOString() });
  if (outgoingRequestLog.length > 100) outgoingRequestLog.pop();
}

const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export function fmtClock(d: Date) {
  return `${DOW[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}·${MON[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export function greetPart(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

export function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

export function fmtDay(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'today';
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 1) return 'yesterday';
  return `${String(d.getDate()).padStart(2,'0')}·${MON[d.getMonth()]?.toLowerCase() ?? ''}`;
}

export function fmtTxnDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return fmtTime(iso);
  return fmtDay(iso);
}

export function fmtPace(secPerKm: number) {
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}:${String(s).padStart(2,'0')}/km`;
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}`;
  return `${m}m`;
}

export { MON };

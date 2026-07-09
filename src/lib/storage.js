const KEY = "mindcoding.saved.v1";
const DAILY = "mindcoding.daily.v1";

export function loadSaved() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
export function persistSaved(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function loadDaily() {
  try {
    const d = JSON.parse(localStorage.getItem(DAILY));
    return d && d.date === todayKey() ? d : null;
  } catch { return null; }
}
export function persistDaily(entry) {
  try { localStorage.setItem(DAILY, JSON.stringify(entry)); } catch {}
}

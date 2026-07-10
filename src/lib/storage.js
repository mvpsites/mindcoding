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

const FAVS = "mindcoding.favs.v1";
const JOURNAL = "mindcoding.journal.v1";

export function loadFavs() {
  try { return JSON.parse(localStorage.getItem(FAVS)) || []; } catch { return []; }
}
export function toggleFav(id) {
  const f = loadFavs();
  const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
  try { localStorage.setItem(FAVS, JSON.stringify(next)); } catch {}
  return next;
}
export function loadJournal() {
  try { return JSON.parse(localStorage.getItem(JOURNAL)) || []; } catch { return []; }
}
export function addJournal(entry) {
  const j = [{ id: Date.now(), date: new Date().toISOString(), ...entry }, ...loadJournal()];
  try { localStorage.setItem(JOURNAL, JSON.stringify(j)); } catch {}
  return j;
}
export function exportMySpace() {
  const data = {
    exported: new Date().toISOString(),
    saved: loadSaved(), favorites: loadFavs(), journal: loadJournal(),
    programs: JSON.parse(localStorage.getItem("mindcoding.programs.v1") || "{}"),
    daily: JSON.parse(localStorage.getItem("mindcoding.daily.v1") || "null"),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mind-coding-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* Check-in history — the daily loop's on-device trendline. */
const CHECKINS = "mindcoding.checkins.v1";
export function loadCheckins() {
  try { return JSON.parse(localStorage.getItem(CHECKINS)) || []; } catch { return []; }
}
export function addCheckin(feelingId) {
  const list = [{ date: new Date().toISOString(), feeling: feelingId }, ...loadCheckins()].slice(0, 400);
  try { localStorage.setItem(CHECKINS, JSON.stringify(list)); } catch {}
  return list;
}
export function hasCheckedInBefore() {
  return loadCheckins().length > 0;
}

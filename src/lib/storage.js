const KEY = "mindcoding.saved.v1";

export function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function persistSaved(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode etc.) — readings simply won't persist */
  }
}

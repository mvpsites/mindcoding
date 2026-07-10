/* Programs: ordered phases of repetition. Same engine will power mixed-format Journeys.
   model: "phased" — the same item plays every day within a phase. Repetition is the recoding. */
import { todayKey } from "../lib/storage.js";

export const PROGRAMS = [
  {
    id: "becoming-30",
    title: "30 Days of Becoming",
    days: 30,
    line: "One song a week, every day. Repetition is how the new belief takes.",
    phases: [
      { from: 1,  to: 7,  contentId: "song-identity" },
      { from: 8,  to: 15, contentId: "song-release" },
      { from: 16, to: 23, contentId: "song-favor" },
      { from: 24, to: 30, contentId: "song-peace" },
    ],
  },
  {
    id: "letting-go-7",
    title: "7 Days of Letting Go",
    days: 7,
    line: "A week of release: one song, one narration, and the daily card as your mirror.",
    phases: [
      { from: 1, to: 4, contentId: "song-release" },
      { from: 5, to: 7, contentId: "narr-again" },
    ],
  },
];

export const programById = (id) => PROGRAMS.find((p) => p.id === id);
export const contentForDay = (program, day) =>
  program.phases.find((ph) => day >= ph.from && day <= ph.to)?.contentId || null;

/* —— progress (localStorage), day-gated with grace —— */
const PKEY = "mindcoding.programs.v1";

const loadAll = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch { return {}; } };
const saveAll = (o) => { try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch {} };

const daysBetween = (fromKey) => {
  const [y, m, d] = fromKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const [y2, m2, d2] = todayKey().split("-").map(Number);
  const now = new Date(y2, m2 - 1, d2);
  return Math.floor((now - start) / 86400000);
};

export function getProgress(programId) {
  const p = loadAll()[programId];
  if (!p) return null;
  const program = programById(programId);
  const unlocked = Math.min(daysBetween(p.startedAt) + 1, program.days);
  const done = p.completedDays || [];
  let current = 1;
  while (done.includes(current) && current < program.days) current++;
  current = Math.min(current, unlocked);
  const finished = done.length >= program.days;
  return { startedAt: p.startedAt, completedDays: done, unlocked, current, finished };
}

export function startProgram(programId) {
  const all = loadAll();
  if (!all[programId]) {
    all[programId] = { startedAt: todayKey(), completedDays: [] };
    saveAll(all);
  }
  return getProgress(programId);
}

export function completeDay(programId, day) {
  const all = loadAll();
  const p = all[programId];
  if (!p) return null;
  const prog = getProgress(programId);
  if (day > prog.unlocked) return prog; // gate: no bingeing ahead
  if (!p.completedDays.includes(day)) p.completedDays.push(day);
  saveAll(all);
  return getProgress(programId);
}

export function activePrograms() {
  const all = loadAll();
  return Object.keys(all)
    .map((id) => ({ program: programById(id), progress: getProgress(id) }))
    .filter((x) => x.program && x.progress && !x.progress.finished);
}

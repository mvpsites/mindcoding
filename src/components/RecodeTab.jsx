import { useMemo, useState } from "react";
import { COLLECTIONS, collectionById } from "../data/collections.js";
import { byCollection, itemById } from "../data/library.js";
import { PROGRAMS, getProgress, startProgram, completeDay, contentForDay } from "../data/programs.js";
import ContentCard from "./ContentCard.jsx";

function ProgramCard({ program, openItem, onToast }) {
  const [progress, setProgress] = useState(() => getProgress(program.id));
  const todayItem = progress ? itemById(contentForDay(program, progress.current)) : null;

  const begin = () => { setProgress(startProgram(program.id)); onToast?.(`${program.title} — Day 1 begins`); };
  const done = () => {
    const p = completeDay(program.id, progress.current);
    setProgress({ ...p });
    onToast?.(p.finished ? "Program complete. Look at you." : `Day ${progress.current} complete`);
  };

  return (
    <div className="mc-program">
      <div className="mc-progtop">
        <div>
          <div className="mc-progtitle">{program.title}</div>
          <div className="mc-progline">{program.line}</div>
        </div>
        <div className="mc-progdays">{program.days} days</div>
      </div>

      {!progress && (
        <button className="mc-cta mc-small" onClick={begin}><b>Begin</b><small>Day 1 unlocks today</small></button>
      )}

      {progress && !progress.finished && (
        <>
          <div className="mc-progbar" role="progressbar" aria-valuenow={progress.completedDays.length} aria-valuemax={program.days}>
            <span style={{ width: `${(progress.completedDays.length / program.days) * 100}%` }} />
          </div>
          <div className="mc-progrow">
            <div className="mc-progstat">
              Day {progress.current} of {program.days}
              {progress.unlocked > progress.current ? " · catching up" : ""}
            </div>
            {todayItem && (
              <button className="mc-progplay" onClick={() => openItem(todayItem)}>
                Today: <b>{todayItem.title}</b>
              </button>
            )}
          </div>
          <button className="mc-ghost mc-small" onClick={done}><b>Mark today complete</b></button>
        </>
      )}

      {progress?.finished && <div className="mc-progdone">Complete. The repetition did its work.</div>}
    </div>
  );
}

export default function RecodeTab({ openItem, go, focusCollection, onToast }) {
  const [open, setOpen] = useState(focusCollection || null);
  const col = open ? collectionById(open) : null;
  const items = useMemo(() => (open ? byCollection(open) : []), [open]);

  if (col) {
    return (
      <section className="mc-recodetab">
        <button className="mc-back" onClick={() => setOpen(null)}>← All of Recode</button>
        <div className="mc-eyebrow">RECODE · {col.name.toUpperCase()}</div>
        <h2 className="mc-h2">{col.name}</h2>
        <p className="mc-lead">{col.line}</p>
        {items.length ? (
          <div className="mc-grid2">
            {items.map((x) => <ContentCard key={x.id} item={x} onOpen={openItem} />)}
          </div>
        ) : (
          <p className="mc-empty">The first {col.name} experiences are in production. They'll appear here the day they release.</p>
        )}
        <div className="mc-toolrow">
          <button className="mc-toolcard" onClick={() => go("reflect")}>
            <span className="mc-tooltitle">Reflect</span>
            <span className="mc-toolsub">Draw a card on this — the deck is a mirror</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mc-recodetab">
      <div className="mc-eyebrow">RECODE</div>
      <h2 className="mc-h2">Choose what goes in.</h2>
      <p className="mc-lead">Programs, music, narrations, and reflection — organized by what you're building, not by format.</p>

      <div className="mc-block">
        <div className="mc-eyebrow">PROGRAMS</div>
        {PROGRAMS.map((p) => <ProgramCard key={p.id} program={p} openItem={openItem} onToast={onToast} />)}
      </div>

      <div className="mc-block">
        <div className="mc-eyebrow">THE FIVE DOORS</div>
        <div className="mc-doors">
          {COLLECTIONS.map((c) => (
            <button key={c.id} className={`mc-door mc-door-${c.id}`} onClick={() => setOpen(c.id)}>
              <span className="mc-doorname">{c.name}</span>
              <span className="mc-doorline">{c.line}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mc-block">
        <div className="mc-eyebrow">TOOLS</div>
        <div className="mc-toolrow">
          <button className="mc-toolcard" onClick={() => go("reflect")}>
            <span className="mc-tooltitle">Reflect — the deck</span>
            <span className="mc-toolsub">Daily card, readings, and all 78 originals</span>
          </button>
          <button className="mc-toolcard" onClick={() => go("myspace")}>
            <span className="mc-tooltitle">My Space</span>
            <span className="mc-toolsub">Journal, favorites, saved readings — on this device only</span>
          </button>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { loadFavs, loadJournal, exportMySpace } from "../lib/storage.js";
import { itemById } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";
import Saved from "./Saved.jsx";

export default function MySpace({ saved, onRemove, go, openItem }) {
  const [journal] = useState(loadJournal);
  const favs = useMemo(() => loadFavs().map(itemById).filter(Boolean), []);

  return (
    <section className="mc-myspace">
      <div className="mc-eyebrow">MY SPACE</div>
      <h2 className="mc-h2">Yours alone.</h2>
      <p className="mc-lead">
        Everything here lives only on this device — it never leaves it. Back it up any time.
      </p>
      <button className="mc-ghost mc-small" onClick={exportMySpace}><b>Download backup</b></button>

      {favs.length > 0 && (
        <div className="mc-block">
          <div className="mc-eyebrow">FAVORITES</div>
          <div className="mc-rail">
            {favs.map((x) => <ContentCard key={x.id} item={x} onOpen={openItem} />)}
          </div>
        </div>
      )}

      <div className="mc-block">
        <div className="mc-eyebrow">JOURNAL</div>
        {journal.length === 0 ? (
          <p className="mc-empty">Prompts you answer — under songs, readings, anywhere — collect here as one stream.</p>
        ) : (
          <div className="mc-jstream">
            {journal.map((j) => (
              <div key={j.id} className="mc-jentry">
                <div className="mc-jmeta">{new Date(j.date).toLocaleDateString()} · {j.title}</div>
                {j.prompt && <div className="mc-jprompt">{j.prompt}</div>}
                <p className="mc-jtext">{j.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mc-block">
        <div className="mc-eyebrow">SAVED READINGS</div>
        <Saved saved={saved} onRemove={onRemove} go={go} embedded />
      </div>
    </section>
  );
}

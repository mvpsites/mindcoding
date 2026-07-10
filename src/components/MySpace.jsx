import { useMemo } from "react";
import { loadFavs, exportMySpace } from "../lib/storage.js";
import { itemById } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";
import Saved from "./Saved.jsx";

export default function MySpace({ saved, onRemove, go, openItem }) {
  const favs = useMemo(() => loadFavs().map(itemById).filter(Boolean), []);

  return (
    <section className="mc-myspace">
      <div className="mc-eyebrow">LOCAL</div>
      <h2 className="mc-h2">Runs on-device.</h2>
      <p className="mc-lead">
        Your favorites and readings are stored locally — nothing syncs, nothing leaves this device. Back it up any time.
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
        <div className="mc-eyebrow">SAVED READINGS</div>
        <Saved saved={saved} onRemove={onRemove} go={go} embedded />
      </div>
    </section>
  );
}

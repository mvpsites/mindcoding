import { useState } from "react";
import { TYPE_LABEL } from "../data/library.js";
import { collectionById } from "../data/collections.js";
import { loadFavs, toggleFav } from "../lib/storage.js";

const GLYPH = { song: "♪", narration: "❝", visualization: "◉", decode: "▲" };

export function Cover({ item, big }) {
  const cls = `mc-cover mc-cov-${item.collection || "decode"} ${big ? "mc-cover-big" : ""}`;
  return (
    <div className={cls} aria-hidden="true">
      {item.cover ? (
        <img src={item.cover.startsWith("http") ? item.cover : import.meta.env.BASE_URL + item.cover} alt="" loading="lazy" />
      ) : (
        <span className="mc-covglyph">{GLYPH[item.type]}</span>
      )}
      {item.status !== "live" && <span className="mc-soon">In production</span>}
    </div>
  );
}

export default function ContentCard({ item, onOpen, wide }) {
  return (
    <button className={`mc-ccard ${wide ? "mc-ccard-wide" : ""}`} onClick={() => onOpen(item)}>
      <Cover item={item} />
      <span className="mc-cctype">{TYPE_LABEL[item.type]} · {item.duration}</span>
      <span className="mc-cctitle">{item.title}</span>
    </button>
  );
}

export function ContentModal({ item, onClose, onToast }) {
  const [favs, setFavs] = useState(loadFavs);
  if (!item) return null;
  const col = collectionById(item.collection);
  const fav = favs.includes(item.id);


  return (
    <div className="mc-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="mc-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="mc-x" onClick={onClose} aria-label="Close">✕</button>
        <Cover item={item} big />
        <div className="mc-sheettype">{TYPE_LABEL[item.type]}{col ? ` · ${col.name}` : ""} · {item.duration}</div>
        <h3 className="mc-sheettitle">{item.title}</h3>
        <p className="mc-sheetblurb">{item.blurb}</p>

        {item.ytId ? (
          <div className="mc-embed">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.ytId}`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mc-embedsoon">This experience is in production. It will play here the day it's released.</div>
        )}

        <div className="mc-sheetrow">
          <button className={`mc-ghost mc-favbtn ${fav ? "mc-favon" : ""}`} onClick={() => setFavs(toggleFav(item.id))}>
            <b>{fav ? "♥ Favorited" : "♡ Favorite"}</b>
          </button>
        </div>

      </div>
    </div>
  );
}

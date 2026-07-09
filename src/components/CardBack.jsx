export default function CardBack() {
  return (
    <img
      className="mc-backimg"
      src={import.meta.env.BASE_URL + "art/card-back.webp"}
      alt=""
      draggable="false"
      loading="eager"
    />
  );
}

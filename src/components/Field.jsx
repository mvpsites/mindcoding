export default function Field({ label, children, tone, delay = 0, on }) {
  return (
    <div className={`mc-field ${tone || ""} ${on ? "mc-on" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="mc-label">{label}</div>
      <div className="mc-fieldbody">{children}</div>
    </div>
  );
}

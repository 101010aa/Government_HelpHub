import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Clock3 } from "lucide-react";
export function Status({ verified }) {
  return (
    <span className={`status ${verified ? "verified" : "unverified"}`}>
      <span className="status-dot" />
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}
export function Empty({
  title = "Nothing here yet",
  text = "Try adjusting your search or filters.",
}) {
  return (
    <div className="empty">
      <span className="empty-symbol">⌕</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Spinner() {
  return (
    <div className="spinner-wrap">
      <span className="spinner" />
      Loading…
    </div>
  );
}
export function Notice({ children, type = "error" }) {
  return (
    <div className={`notice ${type}`} role="status">
      {children}
    </div>
  );
}
export function HelplineCard({ item }) {
  const channels = item.contactChannels || [];
  const moreNumbers = [
    ["Office", channels.find((contact) => contact.channel === "Office telephone")?.value],
    [
      "SMS / WhatsApp / Viber",
      channels.find((contact) => contact.channel === "SMS")?.value,
    ],
    ["Fax", channels.find((contact) => contact.channel === "Fax")?.value],
  ].filter(([, value]) => value);
  return (
    <article className="helpline-card">
      <div className="card-top">
        <span className="category-tag">
          {item.category?.name || "Public service"}
        </span>
        <Status verified={item.isVerified} />
      </div>
      <h3>{item.name}</h3>
      <div className="phone-number">{item.number}</div>
      {moreNumbers.length > 0 && (
        <div className="card-contact-numbers">
          {moreNumbers.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span> {value}
            </div>
          ))}
        </div>
      )}
      <p className="card-description">{item.description || item.purpose}</p>
      <div className="card-meta">
        <span>{item.operator}</span>
        <span>
          <Clock3 size={14} />
          {item.availability}
        </span>
      </div>
      <Link className="text-link" to={`/helplines/${item._id}`}>
        View details <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Pagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  return (
    <div className="pagination">
      <button
        className="button button-quiet"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        className="button button-quiet"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
export function AdminTabs() {
  return (
    <nav className="admin-tabs">
      {[
        ["/admin", "Overview"],
        ["/admin/helplines", "Helplines"],
        ["/admin/categories", "Categories"],
        ["/admin/users", "People"],
        ["/admin/conversations", "Conversations"],
      ].map(([to, label]) => (
        <Link key={to} to={to}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function VerifiedMark() {
  return <CheckCircle2 size={17} aria-label="Verified" />;
}

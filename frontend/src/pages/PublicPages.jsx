import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  Globe2,
  Clock3,
  CheckCircle2,
  Info,
  Users,
  HeartPulse,
  Flame,
  Landmark,
  CarFront,
  Lightbulb,
  Droplets,
  MessagesSquare,
} from "lucide-react";
import api from "../services/api";
import {
  HelplineCard,
  Empty,
  Spinner,
  Notice,
  PageHeading,
  Pagination,
  Status,
} from "../components/UI";
import { useAuth } from "../context/AuthContext";
const iconMap = {
  Emergency: Phone,
  Police: ShieldCheck,
  "Fire & Rescue": Flame,
  Health: HeartPulse,
  Women: HeartPulse,
  Children: Users,
  Disaster: Info,
  Traffic: CarFront,
  "Government Complaints": Landmark,
  "Consumer Protection": ShieldCheck,
  Electricity: Lightbulb,
  Water: Droplets,
  Transport: CarFront,
  Other: MessagesSquare,
};
export function Home() {
  const [categories, setCategories] = useState([]),
    [helplines, setHelplines] = useState([]),
    [query, setQuery] = useState("");
  const emergencyCategoryId = categories.find(
    (category) => category.name === "Emergency",
  )?._id;
  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {});
    api
      .get("/helplines?verified=true&limit=3&sort=verified")
      .then((r) => setHelplines(r.data.items))
      .catch(() => {});
  }, []);
  return (
    <>
      <section className="hero">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-content">
          <div className="eyebrow hero-eyebrow">
            <span /> A public service directory for everyone
          </div>
          <h1>
            Find the right
            <br />
            <em>government helpline.</em>
          </h1>
          <p>
            Clear information for the moments you need it. Search public service
            contacts, understand what they can help with, and find the official
            source.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              location.href = `/helplines?search=${encodeURIComponent(query)}`;
            }}
          >
            <Search size={20} />
            <input
              aria-label="Search helplines"
              placeholder="What do you need help with?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="button button-primary">
              Search <ArrowRight size={16} />
            </button>
          </form>
          <div className="popular-searches">
            <span>Try searching</span>
            {["health", "police", "transport"].map((x) => (
              <Link key={x} to={`/helplines?search=${x}`}>
                {x}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-stamp">
            <span>PUBLIC SERVICE</span>
            <Landmark size={40} />
            <b>
              Here
              <br />
              to help.
            </b>
            <span>ONE CLEAR PLACE</span>
          </div>
          <div className="art-note">
            A little easier
            <br />
            to find your way. <ArrowUpRight />
          </div>
          <div className="art-dots" />
        </div>
        <div className="hero-bottom">
          <span>Designed for everyday questions and urgent moments alike</span>
          <span className="scroll-cue">
            Explore the directory <span>↓</span>
          </span>
        </div>
      </section>
      <section className="trust-strip">
        <div>
          <ShieldCheck />
          <span>
            <b>Source-led information</b>
            <small>Know where details come from</small>
          </span>
        </div>
        <div>
          <Search />
          <span>
            <b>Easy to navigate</b>
            <small>Find services by need or category</small>
          </span>
        </div>
        <div>
          <Users />
          <span>
            <b>Made for everyone</b>
            <small>Simple, helpful, accessible</small>
          </span>
        </div>
        <div>
          <Clock3 />
          <span>
            <b>Availability at a glance</b>
            <small>Know when to reach out</small>
          </span>
        </div>
      </section>
      <section className="section-wrap category-section">
        <div className="section-title-row">
          <div>
            <div className="eyebrow">START WITH WHAT YOU NEED</div>
            <h2>
              Browse by category<span className="title-period">.</span>
            </h2>
            <p>
              From urgent help to everyday services, find the right place to
              start.
            </p>
          </div>
          <Link className="text-link" to="/categories">
            All categories <ArrowRight size={16} />
          </Link>
        </div>
        {categories.length ? (
          <div className="category-grid">
            {categories.slice(0, 8).map((c, i) => {
              const Icon = iconMap[c.name] || Info;
              return (
                <Link
                  className="category-card"
                  to={`/helplines?category=${c._id}`}
                  key={c._id}
                >
                  <span className={`category-icon category-icon-${i % 4}`}>
                    <Icon size={21} />
                  </span>
                  <b>{c.name}</b>
                  <span>
                    Explore services <ArrowUpRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <Empty
            title="Categories will appear here"
            text="Categories are managed through the service directory."
          />
        )}
        <div className="category-banner">
          <div>
            <span>NOT SURE WHERE TO START?</span>
            <b>Find a service that fits your situation.</b>
          </div>
          <Link to="/helplines" className="button button-dark">
            Explore all helplines <ArrowRight size={16} />
          </Link>
          <div className="banner-spark">✳</div>
        </div>
      </section>
      <section className="section-wrap popular-section">
        <div className="section-title-row">
          <div>
            <div className="eyebrow">CAREFULLY SOURCE CHECKED</div>
            <h2>
              Verified listings<span className="title-period">.</span>
            </h2>
            <p>
              Only listings marked verified by an administrator appear here.
            </p>
          </div>
          <Link className="text-link" to="/helplines?verified=true">
            View verified listings <ArrowRight size={16} />
          </Link>
        </div>
        {helplines.length ? (
          <div className="helpline-grid">
            {helplines.map((h) => (
              <HelplineCard key={h._id} item={h} />
            ))}
          </div>
        ) : (
          <div className="verified-empty">
            <div className="verified-empty-icon">
              <ShieldCheck />
            </div>
            <div>
              <b>Verified listings are on their way.</b>
              <p>
                When an administrator confirms a listing's source, it will
                appear here.
              </p>
            </div>
            <Link to="/helplines">
              Browse all listings <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
      <section className="emergency-wrap">
        <div className="emergency-panel">
          <div className="emergency-symbol">
            <Phone />
          </div>
          <div>
            <span className="eyebrow">NEED URGENT ASSISTANCE?</span>
            <h2>Help should be easy to find.</h2>
            <p>
              Browse the directory and check each service's official source and
              availability before contacting them.
            </p>
          </div>
          <Link
            to={
              emergencyCategoryId
                ? `/helplines?category=${emergencyCategoryId}`
                : "/helplines"
            }
            className="button button-light"
          >
            Find emergency services <ArrowRight size={16} />
          </Link>
          <span className="emergency-number">
            01 <i> / </i> DIRECTORY
          </span>
        </div>
      </section>
    </>
  );
}
export function Directory() {
  const [params, setParams] = useSearchParams(),
    [data, setData] = useState(null),
    [cats, setCats] = useState([]),
    [error, setError] = useState("");
  const search = params.get("search") || "",
    category = params.get("category") || "",
    verified = params.get("verified") || "",
    page = Number(params.get("page") || 1);
  const [typed, setTyped] = useState(search);
  useEffect(() => {
    setTyped(search);
  }, [search]);
  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCats(r.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    let timer = setTimeout(() => {
      const p = new URLSearchParams(params);
      if (typed) p.set("search", typed);
      else p.delete("search");
      if (p.get("page")) p.set("page", "1");
      setParams(p, { replace: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [typed]);
  useEffect(() => {
    let cancelled = false;
    setError("");
    api
      .get("/helplines", {
        params: {
          search,
          category,
          verified: verified || undefined,
          page,
          limit: 9,
        },
      })
      .then((r) => {
        if (!cancelled) setData(r.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, verified, page]);
  function change(k, v) {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    p.delete("page");
    setParams(p);
  }
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="THE SERVICE DIRECTORY"
        title="Find the right helpline."
        description="Search public services and understand what each listing can help you with."
      />
      <div className="directory-controls">
        <label className="input-search">
          <Search />
          <input
            placeholder="Search by service, number, or operator…"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => change("category", e.target.value)}
        >
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Verification filter"
          value={verified}
          onChange={(e) => change("verified", e.target.value)}
        >
          <option value="">Any verification</option>
          <option value="true">Verified only</option>
          <option value="false">Not verified</option>
        </select>
      </div>
      <div className="results-label">
        {data
          ? `${data.total} ${data.total === 1 ? "listing" : "listings"} found`
          : ""}{" "}
        {search && (
          <>
            for <b>“{search}”</b>
          </>
        )}
      </div>
      {error && <Notice>{error}</Notice>}
      {!data && !error ? (
        <Spinner />
      ) : data?.items.length ? (
        <div className="helpline-grid">
          {data.items.map((h) => (
            <HelplineCard key={h._id} item={h} />
          ))}
        </div>
      ) : (
        <>
          <Empty
            title="No helplines found"
            text="Try another search or choose a different category."
          />
          {(category || search || verified) && (
            <div className="empty-directory-link">
              <Link className="text-link" to="/helplines">
                Clear filters and show all directory listings <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </>
      )}
      <Pagination
        page={page}
        pages={data?.pages || 0}
        onChange={(n) => change("page", String(n))}
      />
      <div className="directory-note">
        <Info size={16} />
        <span>
          Always confirm the number, operating hours, and eligibility with the
          linked official source. A listing is identified as verified only when
          explicitly marked.
        </span>
      </div>
    </div>
  );
}
export function Categories() {
  const [cats, setCats] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCats(r.data))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="EXPLORE THE DIRECTORY"
        title="Browse categories."
        description="Start with the kind of service you are looking for."
      />
      {error && <Notice>{error}</Notice>}
      {!cats.length && !error ? (
        <Spinner />
      ) : (
        <div className="category-grid category-grid-large">
          {cats.map((c, i) => {
            const Icon = iconMap[c.name] || Info;
            return (
              <Link
                className="category-card"
                to={`/helplines?category=${c._id}`}
                key={c._id}
              >
                <span className={`category-icon category-icon-${i % 4}`}>
                  <Icon size={22} />
                </span>
                <b>{c.name}</b>
                <p>{c.description}</p>
                <span>
                  View listings <ArrowUpRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function Detail() {
  const { id } = useParams(),
    [item, setItem] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get(`/helplines/${id}`)
      .then((r) => setItem(r.data))
      .catch((e) => setError(e.message));
  }, [id]);
  if (error)
    return (
      <div className="page-wrap">
        <Notice>{error}</Notice>
        <Link className="text-link" to="/helplines">
          ← Back to directory
        </Link>
      </div>
    );
  if (!item) return <Spinner />;
  return (
    <div className="page-wrap detail-page">
      <Link className="back-link" to="/helplines">
        ← All helplines
      </Link>
      <div className="detail-heading">
        <div>
          <span className="category-tag">
            {item.category?.name || "Public service"}
          </span>
          <h1>{item.name}</h1>
          <p>{item.description || item.purpose}</p>
        </div>
        <Status verified={item.isVerified} />
      </div>
      <div className="detail-main">
        <section className="detail-primary">
          <div className="number-panel">
            <span>HELPLINE NUMBER</span>
            <div className="number-value">
              <Phone size={23} />
              {item.number}
            </div>
            <p>Primary published contact number. Confirm call charges with your provider.</p>
          </div>
          <div className="detail-block">
            <div className="eyebrow">HOW THEY CAN HELP</div>
            <h2>{item.purpose}</h2>
            {item.services?.length > 0 && (
              <>
                <h3>Services provided</h3>
                <ul className="service-list">
                  {item.services.map((s, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} />
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {item.contactChannels?.length > 0 && (
            <div className="detail-block">
              <div className="eyebrow">CONTACT CHANNELS</div>
              <div className="contact-channel-list">
                {item.contactChannels.map((contact, index) => (
                  <div className="contact-channel-row" key={`${contact.channel}-${index}`}>
                    <span>{contact.channel}</span>
                    <b>{contact.value}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.eligibility && (
            <div className="detail-block">
              <div className="eyebrow">WHO CAN CONTACT THEM</div>
              <p>{item.eligibility}</p>
            </div>
          )}
          <div className="detail-block">
            <div className="eyebrow">ABOUT THIS LISTING</div>
            <p className="source-note">
              <Info size={17} />
              Information is provided as a directory entry. Confirm details with
              the listed operator before acting.
            </p>
          </div>
        </section>
        <aside className="detail-aside">
          <div className="info-card">
            <h3>At a glance</h3>
            <div className="info-row">
              <span>Operator</span>
              <b>{item.operator}</b>
            </div>
            <div className="info-row">
              <span>Government body</span>
              <b>{item.governmentBody || "Not specified"}</b>
            </div>
            <div className="info-row">
              <span>Availability</span>
              <b>{item.availability || "Not specified"}</b>
            </div>
            <div className="info-row">
              <span>Toll-free</span>
              <b>{item.isTollFree ? "Yes" : "Not specified"}</b>
            </div>
            <div className="info-row">
              <span>Last verified</span>
              <b>
                {item.isVerified && item.lastVerifiedAt
                  ? new Date(item.lastVerifiedAt).toLocaleDateString()
                  : "Not verified"}
              </b>
            </div>
            <div className="info-row">
              <span>Verification</span>
              <Status verified={item.isVerified} />
            </div>
          </div>
          <div className="info-card source-card">
            <div className="eyebrow">OFFICIAL SOURCES</div>
            <p>
              Use these links to confirm current details directly with the
              provider.
            </p>
            {item.officialWebsite && (
              <a
                className="source-text-link"
                href={item.officialWebsite}
                target="_blank"
                rel="noreferrer"
              >
                Open official portal <ArrowUpRight size={14} />
              </a>
            )}
            {item.officialWebsite && (
              <a
                className="source-link"
                href={`${item.officialWebsite.replace(/\/$/, "")}/track-complain`}
                target="_blank"
                rel="noreferrer"
              >
                <Globe2 size={16} /> Track an existing complaint <ArrowUpRight size={14} />
              </a>
            )}
            {item.sourceUrl && (
              <a
                className="source-link"
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Globe2 size={16} />
                Source reference <ArrowUpRight size={14} />
              </a>
            )}
            {item.additionalSources?.map((source, index) => (
              <a
                className="source-link"
                href={source.url}
                target="_blank"
                rel="noreferrer"
                key={`${source.url}-${index}`}
              >
                <Globe2 size={16} /> {source.label} <ArrowUpRight size={14} />
              </a>
            ))}
            {!item.officialWebsite && !item.sourceUrl && (
              <p className="muted">
                No official source link has been added yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

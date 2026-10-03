import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Send,
  Plus,
  UserCircle,
  MessageCircle,
  Clock3,
  Pencil,
  Trash2,
  Shield,
  Search,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Empty, Notice, Spinner, PageHeading } from "../components/UI";
export function Login() {
  const { login } = useAuth(),
    nav = useNavigate(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login({ email, password });
      nav("/helplines");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to your account."
      intro="Your conversations and profile, all in one place."
    >
      <form className="form-stack" onSubmit={submit}>
        {error && <Notice>{error}</Notice>}
        <label>
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>
        <button className="button button-primary form-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
        </button>
        <p className="form-foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
export function Register() {
  const { register } = useAuth(),
    nav = useNavigate(),
    [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      confirm: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function field(k) {
    return (e) => setForm({ ...form, [k]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8)
      return setError("Choose a password with at least 8 characters.");
    if (form.password !== form.confirm)
      return setError("Your passwords do not match.");
    setBusy(true);
    try {
      await register(form);
      nav("/helplines");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      eyebrow="JOIN THE DIRECTORY"
      title="Create your account."
      intro="Sign up to start conversations and keep your profile up to date."
    >
      <form className="form-stack" onSubmit={submit}>
        {error && <Notice>{error}</Notice>}
        <label>
          Your name
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={field("name")}
            placeholder="Full name"
          />
        </label>
        <label>
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={field("email")}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={field("password")}
            placeholder="At least 8 characters"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={field("confirm")}
            placeholder="Enter password again"
          />
        </label>
        <button className="button button-primary form-submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}{" "}
          <ArrowRight size={16} />
        </button>
        <p className="form-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
function AuthShell({ eyebrow, title, intro, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="eyebrow">A CLEARER PATH TO PUBLIC SERVICES</div>
        <h2>
          Help is easier
          <br />
          to find when
          <br />
          <em>we make it clear.</em>
        </h2>
        <p>
          Search listings, explore official references and talk through your
          next steps.
        </p>
        <div className="auth-side-mark">
          GH<span>H</span>
        </div>
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{intro}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
export function Profile() {
  const { user, update } = useAuth(),
    [name, setName] = useState(user?.name || ""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [copied, setCopied] = useState(false);
  async function copyMemberId() {
    if (!user?.id || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed. Select the member ID and copy it manually.");
    }
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const body = { name };
      if (password) body.password = password;
      await update(body);
      setPassword("");
      setSuccess("Your profile has been updated.");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Profile & settings."
        description="Manage your name and account password."
      />
      <div className="profile-layout">
        <div className="profile-summary">
          <div className="profile-avatar">
            <UserCircle size={42} />
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className="category-tag">
            {user?.role === "admin" ? "Administrator" : "Member"}
          </span>
          <div className="member-id-card">
            <span>Member account ID</span>
            <code>{user?.id}</code>
            <button
              type="button"
              className="member-id-copy"
              onClick={copyMemberId}
              disabled={!user?.id}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy ID"}
            </button>
            <small>
              Share this ID with a member so they can start a conversation with you.
            </small>
          </div>
        </div>
        <form className="profile-form form-stack" onSubmit={submit}>
          {error && <Notice>{error}</Notice>}
          {success && <Notice type="success">{success}</Notice>}
          <label>
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Email address
            <input value={user?.email || ""} disabled />
            <small>Email changes are not currently available.</small>
          </label>
          <label>
            New password
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep your password"
            />
          </label>
          <button className="button button-primary">
            Save changes <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
export function ChatList() {
  const { user } = useAuth(),
    [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [target, setTarget] = useState(""),
    [busy, setBusy] = useState(false);
  function load() {
    api
      .get("/conversations")
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.message));
  }
  useEffect(() => {
    load();
  }, []);
  async function create(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/conversations", { participantId: target });
      location.href = `/chat/${r.data._id}`;
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="YOUR INBOX"
        title="Conversations."
        description="Start and manage conversations with other members of the directory."
      />
      <div className="chat-start">
        <form onSubmit={create}>
          <label>
            <UserCircle size={18} /> Start a conversation with a member account ID
            <input
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Paste their member ID"
            />
          </label>
          <button className="button button-primary" disabled={busy}>
            <Plus size={16} /> {busy ? "Starting…" : "Start conversation"}
          </button>
        </form>
        <p>
          Find your ID on your Profile page. Ask the member you want to contact to share theirs.
        </p>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="conversation-list">
        {items.map((c) => {
          const other = c.participants.find((p) => p._id !== user?.id);
          return (
            <Link
              className="conversation-row"
              to={`/chat/${c._id}`}
              key={c._id}
            >
              <span className="conversation-avatar">
                <MessageCircle />
              </span>
              <span className="conversation-content">
                <b>{other?.name || "Conversation"}</b>
                <span>{c.lastMessage || "No messages yet"}</span>
              </span>
              <span className="conversation-time">
                <Clock3 size={14} />
                {new Date(c.lastMessageAt).toLocaleDateString()}
              </span>
              <ArrowRight size={17} />
            </Link>
          );
        })}
        {!items.length && !error && (
          <Empty
            title="Your inbox is quiet"
            text="Start a conversation with a directory member to see it here."
          />
        )}
      </div>
    </div>
  );
}
export function ChatRoom() {
  const { id } = useParams(),
    { user } = useAuth(),
    [conversation, setConversation] = useState(null),
    [items, setItems] = useState([]),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    endRef = useRef(null),
    latest = useRef(null);
  useEffect(() => {
    let active = true;
    async function initial() {
      try {
        const [c, m] = await Promise.all([
          api.get(`/conversations/${id}`),
          api.get(`/conversations/${id}/messages`),
        ]);
        if (!active) return;
        setConversation(c.data);
        setItems(m.data);
        latest.current = m.data.at(-1)?._id || null;
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    initial();
    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const p = latest.current ? { after: latest.current } : {};
        const r = await api.get(`/conversations/${id}/messages`, { params: p });
        if (r.data.length) {
          setItems((old) => {
            const ids = new Set(old.map((x) => x._id));
            const fresh = r.data.filter((x) => !ids.has(x._id));
            if (fresh.length) latest.current = fresh.at(-1)._id;
            return [...old, ...fresh];
          });
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    }, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [items.length],
  );
  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await api.post(`/conversations/${id}/messages`, {
        message: message.trim(),
      });
      setItems((old) => [...old, r.data]);
      latest.current = r.data._id;
      setMessage("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function edit(m) {
    const next = prompt("Edit your message", m.message);
    if (next === null) return;
    try {
      const r = await api.put(`/messages/${m._id}`, { message: next });
      setItems((old) => old.map((x) => (x._id === m._id ? r.data : x)));
    } catch (e) {
      setError(e.message);
    }
  }
  async function remove(m) {
    if (!confirm("Delete this message?")) return;
    try {
      await api.delete(`/messages/${m._id}`);
      setItems((old) => old.filter((x) => x._id !== m._id));
    } catch (e) {
      setError(e.message);
    }
  }
  const other = conversation?.participants?.find((p) => p._id !== user?.id);
  return (
    <div className="page-wrap chat-room-wrap">
      <Link to="/chat" className="back-link">
        ← All conversations
      </Link>
      <section className="chat-room">
        <header className="chat-room-head">
          <span className="conversation-avatar">
            <MessageCircle />
          </span>
          <div>
            <b>{other?.name || "Conversation"}</b>
            <small>Messages update every 4 seconds</small>
          </div>
        </header>
        <div className="message-list">
          {items.map((m) => (
            <div
              key={m._id}
              className={`message-line ${m.sender?._id === user?.id ? "mine" : ""}`}
            >
              <div className="message-bubble">
                <span className="message-sender">
                  {m.sender?.name || "Member"}
                </span>
                <p>{m.message}</p>
                <small>
                  {new Date(m.createdAt).toLocaleString()}
                  {m.isEdited ? " · edited" : ""}
                </small>
              </div>
              {(m.sender?._id === user?.id || user?.role === "admin") && (
                <div className="message-actions">
                  <button onClick={() => edit(m)} aria-label="Edit message">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(m)} aria-label="Delete message">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {!items.length && (
            <Empty
              title="Start the conversation"
              text="Send a message to get things going."
            />
          )}
          <div ref={endRef} />
        </div>
        {error && <Notice>{error}</Notice>}
        <form className="chat-compose" onSubmit={submit}>
          <input
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message…"
            aria-label="Message"
          />
          <button
            className="button button-primary"
            disabled={busy || !message.trim()}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </section>
    </div>
  );
}

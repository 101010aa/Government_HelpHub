import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Phone,
  FolderOpen,
  MessagesSquare,
  Pencil,
  Trash2,
  Check,
  Eye,
} from "lucide-react";
import api from "../services/api";
import {
  AdminTabs,
  Empty,
  Notice,
  PageHeading,
  Spinner,
  Status,
} from "../components/UI";
function AdminShell({ children }) {
  return (
    <div className="page-wrap admin-wrap">
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Manage the directory."
        description="Keep service information clear, current, and easy to verify."
      />
      <AdminTabs />
      {children}
    </div>
  );
}
export function AdminHome() {
  const [stats, setStats] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.message));
  }, []);
  const blocks = [
    ["People", stats?.users, Users, "/admin/users"],
    ["Helplines", stats?.helplines, Phone, "/admin/helplines"],
    ["Verified", stats?.verified, ShieldCheck, "/admin/helplines"],
    ["Active", stats?.active, Check, "/admin/helplines"],
    ["Categories", stats?.categories, FolderOpen, "/admin/categories"],
    [
      "Conversations",
      stats?.conversations,
      MessagesSquare,
      "/admin/conversations",
    ],
  ];
  return (
    <AdminShell>
      {error && <Notice>{error}</Notice>}
      {!stats && !error ? (
        <Spinner />
      ) : (
        <div className="stats-grid">
          {blocks.map(([label, n, Icon, to]) => (
            <Link className="stat-card" to={to} key={label}>
              <span>
                <Icon size={19} />
                {label}
              </span>
              <b>{n}</b>
              <small>
                View details <ArrowRight size={13} />
              </small>
            </Link>
          ))}
        </div>
      )}
      <div className="admin-note">
        <ShieldCheck />
        <div>
          <b>Keep official information traceable.</b>
          <p>
            Set a source URL before marking a helpline as verified. Record the
            date when source details are checked.
          </p>
        </div>
        <Link to="/admin/helplines" className="button button-primary">
          Manage helplines <ArrowRight size={15} />
        </Link>
      </div>
    </AdminShell>
  );
}
export function AdminHelplines() {
  const [items, setItems] = useState([]),
    [cats, setCats] = useState([]),
    [error, setError] = useState(""),
    [form, setForm] = useState(null),
    [saving, setSaving] = useState(false),
    [search, setSearch] = useState("");
  async function load() {
    try {
      const [r, c] = await Promise.all([
        api.get("/helplines", { params: { active: "all", limit: 50, search } }),
        api.get("/categories", { params: { all: true } }),
      ]);
      setItems(r.data.items);
      setCats(c.data);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [search]);
  function edit(h) {
    setForm(
      h
        ? {
            ...h,
            category: h.category?._id || h.category,
            services: (h.services || []).join("\n"),
            contactChannels: (h.contactChannels || [])
              .map((channel) => `${channel.channel} | ${channel.value} | ${channel.url || ""}`)
              .join("\n"),
            additionalSources: (h.additionalSources || [])
              .map((source) => `${source.label} | ${source.url}`)
              .join("\n"),
            lastVerifiedAt: h.lastVerifiedAt
              ? new Date(h.lastVerifiedAt).toISOString().slice(0, 10)
              : "",
          }
        : {
            name: "",
            number: "",
            description: "",
            purpose: "",
            operator: "",
            governmentBody: "",
            category: cats[0]?._id || "",
            availability: "Not specified",
            isTollFree: false,
            eligibility: "",
            services: "",
            contactChannels: "",
            additionalSources: "",
            officialWebsite: "",
            sourceUrl: "",
            isVerified: false,
            isActive: true,
            lastVerifiedAt: "",
          },
    );
  }
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...form,
      services: form.services
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      contactChannels: form.contactChannels
        .split("\n")
        .map((line) => line.split("|").map((part) => part.trim()))
        .filter(([channel, value]) => channel && value)
        .map(([channel, value, url = ""]) => ({ channel, value, url })),
      additionalSources: form.additionalSources
        .split("\n")
        .map((line) => line.split("|").map((part) => part.trim()))
        .filter(([label, url]) => label && url)
        .map(([label, url]) => ({ label, url })),
      lastVerifiedAt: form.lastVerifiedAt || null,
    };
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    try {
      if (form._id) await api.put(`/helplines/${form._id}`, body);
      else await api.post("/helplines", body);
      setForm(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(h) {
    if (!confirm(`Deactivate ${h.name}?`)) return;
    try {
      await api.delete(`/helplines/${h._id}`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function toggle(h) {
    try {
      await api.put(`/helplines/${h._id}`, {
        isVerified: !h.isVerified,
        lastVerifiedAt: !h.isVerified ? new Date().toISOString() : null,
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <AdminShell>
      <div className="admin-toolbar">
        <label className="input-search">
          <Search />
          <input
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className="button button-primary" onClick={() => edit(null)}>
          <Plus size={16} /> Add helpline
        </button>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name / number</th>
              <th>Category</th>
              <th>Operator</th>
              <th>Verification</th>
              <th>Active</th>
              <th>Last checked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr key={h._id}>
                <td>
                  <b>{h.name}</b>
                  <small>{h.number}</small>
                </td>
                <td>{h.category?.name || "—"}</td>
                <td>{h.operator}</td>
                <td>
                  <Status verified={h.isVerified} />
                </td>
                <td>
                  <span
                    className={`status ${h.isActive ? "verified" : "unverified"}`}
                  >
                    {h.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {h.lastVerifiedAt
                    ? new Date(h.lastVerifiedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <div className="table-actions">
                    <Link aria-label="View listing" to={`/helplines/${h._id}`}>
                      <Eye size={15} />
                    </Link>
                    <button aria-label="Edit listing" onClick={() => edit(h)}>
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={h.isVerified ? "Unverify" : "Verify"}
                      title={h.isVerified ? "Unverify" : "Verify"}
                      onClick={() => toggle(h)}
                    >
                      <ShieldCheck size={15} />
                    </button>
                    <button
                      aria-label="Deactivate listing"
                      onClick={() => remove(h)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <Empty
            title="No helplines yet"
            text="Add a sourced service listing to get started."
          />
        )}
      </div>
      {form && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setForm(null);
          }}
        >
          <form className="admin-modal form-stack" onSubmit={save}>
            <div className="modal-title">
              <div>
                <div className="eyebrow">DIRECTORY MANAGEMENT</div>
                <h2>{form._id ? "Edit helpline" : "Add a helpline"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setForm(null)}
              >
                ×
              </button>
            </div>
            {error && <Notice>{error}</Notice>}
            <div className="form-grid">
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Number
                <input
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </label>
              <label>
                Category
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {cats.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Operator
                <input
                  required
                  value={form.operator}
                  onChange={(e) =>
                    setForm({ ...form, operator: e.target.value })
                  }
                />
              </label>
              <label>
                Government body
                <input
                  value={form.governmentBody}
                  onChange={(e) =>
                    setForm({ ...form, governmentBody: e.target.value })
                  }
                />
              </label>
              <label>
                Availability
                <input
                  value={form.availability}
                  onChange={(e) =>
                    setForm({ ...form, availability: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Short description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Purpose *
                <textarea
                  required
                  value={form.purpose}
                  onChange={(e) =>
                    setForm({ ...form, purpose: e.target.value })
                  }
                />
              </label>
              <label>
                Official website
                <input
                  type="url"
                  placeholder="https://"
                  value={form.officialWebsite}
                  onChange={(e) =>
                    setForm({ ...form, officialWebsite: e.target.value })
                  }
                />
              </label>
              <label>
                Source URL
                <input
                  type="url"
                  placeholder="https://"
                  value={form.sourceUrl}
                  onChange={(e) =>
                    setForm({ ...form, sourceUrl: e.target.value })
                  }
                />
              </label>
              <label>
                Last verified
                <input
                  type="date"
                  value={form.lastVerifiedAt}
                  onChange={(e) =>
                    setForm({ ...form, lastVerifiedAt: e.target.value })
                  }
                />
              </label>
              <label>
                Eligibility
                <input
                  value={form.eligibility}
                  onChange={(e) =>
                    setForm({ ...form, eligibility: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Services provided <small>One service per line</small>
                <textarea
                  value={form.services}
                  onChange={(e) =>
                    setForm({ ...form, services: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Contact channels <small>One per line: channel | contact | URL (URL optional)</small>
                <textarea
                  value={form.contactChannels}
                  onChange={(e) =>
                    setForm({ ...form, contactChannels: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Additional sources <small>One per line: label | HTTPS URL</small>
                <textarea
                  value={form.additionalSources}
                  onChange={(e) =>
                    setForm({ ...form, additionalSources: e.target.value })
                  }
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.isTollFree}
                  onChange={(e) =>
                    setForm({ ...form, isTollFree: e.target.checked })
                  }
                />{" "}
                Toll-free
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) =>
                    setForm({ ...form, isVerified: e.target.checked })
                  }
                />{" "}
                Mark as verified
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />{" "}
                Active listing
              </label>
            </div>
            <p className="modal-hint">
              <ShieldCheck size={15} /> Only mark a listing verified after
              checking its official source.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
              <button disabled={saving} className="button button-primary">
                {saving ? "Saving…" : "Save listing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
export function AdminCategories() {
  const [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [form, setForm] = useState(null);
  async function load() {
    try {
      const r = await api.get("/categories", { params: { all: true } });
      setItems(r.data);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function edit(x) {
    setForm(
      x ? { ...x } : { name: "", description: "", icon: "◈", isActive: true },
    );
  }
  async function save(e) {
    e.preventDefault();
    try {
      if (form._id) await api.put(`/categories/${form._id}`, form);
      else await api.post("/categories", form);
      setForm(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function deactivate(c) {
    if (!confirm(`Deactivate category “${c.name}”?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <AdminShell>
      <div className="admin-toolbar">
        <div>
          <h2>Categories</h2>
          <p>Active categories are available as directory filters.</p>
        </div>
        <button className="button button-primary" onClick={() => edit(null)}>
          <Plus size={16} /> Add category
        </button>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="admin-card-list">
        {items.map((c) => (
          <div className="admin-list-row" key={c._id}>
            <span className="category-icon category-icon-0">
              {c.icon || "◈"}
            </span>
            <div>
              <b>{c.name}</b>
              <small>
                {c.description || "No description"} ·{" "}
                {c.isActive ? "Active" : "Inactive"}
              </small>
            </div>
            <button className="button button-quiet" onClick={() => edit(c)}>
              Edit
            </button>
            <button
              className="icon-button"
              onClick={() => deactivate(c)}
              aria-label="Deactivate category"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {!items.length && <Empty title="No categories" />}
      </div>
      {form && (
        <div className="modal-backdrop">
          <form className="small-modal form-stack" onSubmit={save}>
            <h2>{form._id ? "Edit category" : "New category"}</h2>
            {error && <Notice>{error}</Notice>}
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label>
              Icon character
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />{" "}
              Active
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
              <button className="button button-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
export function AdminUsers() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  async function load() {
    try {
      const r = await api.get("/admin/users", { params: { search } });
      setItems(r.data);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [search]);
  async function update(u, patch) {
    try {
      await api.put(`/admin/users/${u._id}`, patch);
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <AdminShell>
      <div className="admin-toolbar">
        <label className="input-search">
          <Search />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span>{items.length} accounts</span>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id}>
                <td>
                  <b>{u.name}</b>
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    aria-label={`Role for ${u.name}`}
                    value={u.role}
                    onChange={(e) => update(u, { role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span
                    className={`status ${u.isActive ? "verified" : "unverified"}`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="button button-quiet"
                    onClick={() => update(u, { isActive: !u.isActive })}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <Empty title="No accounts found" />}
      </div>
    </AdminShell>
  );
}
export function AdminConversations() {
  const [items, setItems] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/conversations")
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <AdminShell>
      {error && <Notice>{error}</Notice>}
      <div className="conversation-list">
        {items.map((c) => (
          <div className="conversation-row" key={c._id}>
            <span className="conversation-avatar">
              <MessagesSquare />
            </span>
            <span className="conversation-content">
              <b>{c.participants.map((p) => p.name).join(" · ")}</b>
              <span>{c.lastMessage || "No messages yet"}</span>
            </span>
            <Link className="text-link" to={`/chat/${c._id}`}>
              View messages <ArrowRight size={15} />
            </Link>
            <button
              className="icon-button danger-text"
              onClick={async () => {
                if (!confirm("Delete this conversation and its messages?"))
                  return;
                try {
                  await api.delete(`/conversations/${c._id}`);
                  setItems((old) => old.filter((x) => x._id !== c._id));
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {!items.length && !error && <Empty title="No conversations" />}
      </div>
    </AdminShell>
  );
}

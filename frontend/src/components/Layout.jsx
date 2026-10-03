import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function Layout() {
  const { user, logout } = useAuth(),
    [open, setOpen] = useState(false),
    navigate = useNavigate();
  function signOut() {
    logout();
    setOpen(false);
    navigate("/");
  }
  return (
    <>
      <div className="topline">
        <span>Public service information, made easier to find</span>
        <span className="topline-right">
          <Shield size={13} />
          Check each listing's source before relying on it
        </span>
      </div>
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <span />
          </span>
          <span>
            Government <b>Help Hub</b>
            <small>PUBLIC SERVICE DIRECTORY</small>
          </span>
        </Link>
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={`main-nav ${open ? "nav-open" : ""}`}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/helplines">Helplines</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/chat">
            <MessageCircle size={16} /> Chat
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <button className="nav-login" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Sign in
              </Link>
              <Link
                to="/register"
                className="button button-primary button-small"
              >
                Create account <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-main">
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">
              <span />
            </span>
            <span>
              Government <b>Help Hub</b>
              <small>PUBLIC SERVICE DIRECTORY</small>
            </span>
          </Link>
          <p>
            A clearer path to the public services you need.
            <br />
            Always confirm critical details with official sources.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Government Help Hub</span>
          <div>
            <Link to="/helplines">Directory</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/chat">Contact & chat</Link>
          </div>
          <span>Information may change. Verify with the provider.</span>
        </div>
      </footer>
    </>
  );
}

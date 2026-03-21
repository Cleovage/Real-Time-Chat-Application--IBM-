import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <span className="logo-icon">💬</span>
        <span>ChatApp</span>
      </Link>

      {/* Desktop links */}
      <div className="navbar-links desktop-links">
        {user ? (
          <>
            <div className="navbar-user">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
            <Link to="/rooms">Rooms</Link>
            <Link to="/create-room">Create Room</Link>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger button */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        id="hamburger-btn"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        {user ? (
          <>
            <div className="mobile-user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
            <Link to="/rooms" onClick={closeMenu}>💬 Chat Rooms</Link>
            <Link to="/create-room" onClick={closeMenu}>✨ Create Room</Link>
            <button className="btn-logout mobile-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="mobile-signup" onClick={closeMenu}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

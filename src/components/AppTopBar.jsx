const logoSimple = new URL("../../Logo Simple.jpeg", import.meta.url).href;

export default function AppTopBar({ navigate, session, logout }) {
  return (
    <header className="topbar">
      <div className="container topbar-content">
        <button type="button" className="brand" style={{ cursor: "pointer", background: "none", border: "none", color: "inherit" }} onClick={() => navigate("/")}>
          <img src={logoSimple} alt="Logo Dakinis" className="brand-icon" />
          <span>Dakinis One</span>
        </button>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {session?.user?.email ? (
            <>
              <span className="lead" style={{ fontSize: "0.85rem", maxWidth: "28ch", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session.user.email}
              </span>
              <button type="button" className="btn btn-outline" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="btn btn-outline" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                Login
              </a>
              <a href="/#demo" className="btn btn-outline">
                Solicitar demo
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

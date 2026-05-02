/** Navegación lateral clickeable para maquetas de panel */
export default function MockupSidebarNav({ tabs, activeId, onSelect }) {
  return (
    <nav className="mockup-sidebar-nav" aria-label="Secciones del panel">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`mockup-nav-btn${activeId === id ? " active" : ""}`}
          onClick={() => onSelect(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

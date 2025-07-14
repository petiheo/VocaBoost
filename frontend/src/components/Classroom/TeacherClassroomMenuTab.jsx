const tabs = [
  { name: "Assignments", active: false },
  { name: "Statistics", active: false },
  { name: "Students", active: true },
];

export default function SubMenuTabs() {
  return (
    <div className="sub-menu-tabs">
      <div className="tab-list">
        {tabs.map((tab, idx) => (
          <div
            key={idx}
            className={`tab ${tab.active ? "active" : ""}`}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
}

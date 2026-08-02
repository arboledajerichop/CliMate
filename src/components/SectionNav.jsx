function SectionNav({ showPagasa }) {
  return (
    <nav className="section-nav" aria-label="Weather dashboard sections">
      <span>Jump to</span>
      <a href="#today">Today</a>
      <a href="#motion">Day in motion</a>
      {showPagasa && <a href="#pagasa">PAGASA</a>}
      <a href="#forecast">Forecasts</a>
    </nav>
  );
}

export default SectionNav;

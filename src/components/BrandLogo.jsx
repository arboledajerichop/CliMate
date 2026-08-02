function BrandLogo({ className = "" }) {
  return (
    <svg
      className={`climate-logo ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="CliMate logo"
    >
      <rect className="climate-logo__sky" x="2" y="2" width="60" height="60" rx="19" />

      <g className="climate-logo__sun" aria-hidden="true">
        <path d="M44 10v4M44 32v4M32 23h-4M60 23h-4M35.5 14.5l-2.8-2.8M55.3 34.3l-2.8-2.8M52.5 14.5l2.8-2.8" />
        <circle cx="44" cy="23" r="8.5" />
      </g>

      <path
        className="climate-logo__cloud-shadow"
        d="M13 46.5c0-5.3 4.1-9.5 9.3-9.8 2-6.9 8.2-11.7 15.5-11.7 8.2 0 15 6.1 16 14.1 4.1.7 7.2 4.2 7.2 8.5 0 4.8-3.9 8.7-8.7 8.7H22.8C17.4 56.3 13 51.9 13 46.5Z"
      />
      <path
        className="climate-logo__cloud"
        d="M9 43.5c0-5 3.8-9 8.7-9.4 1.8-6.4 7.7-10.9 14.5-10.9 7.7 0 14 5.7 14.9 13.2 3.9.6 6.8 3.9 6.8 7.9 0 4.5-3.6 8.1-8.1 8.1H18.2C13.1 52.4 9 48.4 9 43.5Z"
      />
      <path className="climate-logo__check" d="M22.5 42.1l5.1 5.1 10.6-11" />
      <path className="climate-logo__breeze" d="M43.8 47.2h5.1" />
    </svg>
  );
}

export default BrandLogo;

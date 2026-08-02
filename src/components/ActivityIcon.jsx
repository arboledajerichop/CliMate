function ActivityIcon({ type }) {
  const common = {
    className: "activity-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (type === "bus") {
    return (
      <svg {...common}>
        <rect x="4" y="3.5" width="16" height="15" rx="2.5" />
        <path d="M7 7h4m2 0h4M4 13h16M7 18.5v1.5m10-1.5v1.5" />
        <circle cx="7.5" cy="16" r="1" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="16" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "dumbbell") {
    return (
      <svg {...common}>
        <path d="M3 10v4m3-6v8m12-8v8m3-6v4M6 12h12" />
      </svg>
    );
  }

  if (type === "basin") {
    return (
      <svg {...common}>
        <path d="M4 10h16l-1.1 7.1a2.2 2.2 0 0 1-2.2 1.9H7.3a2.2 2.2 0 0 1-2.2-1.9L4 10Z" />
        <path d="M6 13c1.2-.8 2.4-.8 3.6 0s2.4.8 3.6 0 2.4-.8 3.6 0" />
        <path d="M9 10V6.8l3-1.8 3 1.8V10" />
      </svg>
    );
  }

  if (type === "bicycle") {
    return (
      <svg {...common}>
        <circle cx="6" cy="16.5" r="3.5" />
        <circle cx="18" cy="16.5" r="3.5" />
        <path d="m6 16.5 4-7h3l5 7m-8-7 4 7H6m6-9h3" />
      </svg>
    );
  }

  if (type === "trees") {
    return (
      <svg {...common}>
        <path d="M8 19v-4m8 4v-5" />
        <path d="M8 4 3.5 12h9L8 4Zm8 2-4 8h8l-4-8Z" />
        <path d="M3 20h18" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M13 3.8a1 1 0 0 0-2 0v5.3l-7.7 4.6a1 1 0 0 0-.5.9v1.2l8.2-2.5v5.2l-2.3 1.6V21l3.3-1 3.3 1v-.9L13 18.5v-5.2l8.2 2.5v-1.2a1 1 0 0 0-.5-.9L13 9.1V3.8Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export default ActivityIcon;

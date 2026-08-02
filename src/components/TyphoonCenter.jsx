function formatFetched(dateTime) {
  if (!dateTime) return "Update time unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateTime));
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="pagasa-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TyphoonCenter({ data, loading, error, isPhilippines, onRetry }) {
  if (!isPhilippines) return null;

  const bulletins = data?.bulletins || [];
  const hasActiveStorm = bulletins.length > 0;

  return (
    <section
      className={`typhoon-center ${hasActiveStorm ? "has-active-storm" : ""}`}
      id="pagasa"
      aria-labelledby="typhoon-heading"
      aria-busy={loading}
    >
      <div className="typhoon-heading">
        <span className="typhoon-radar" aria-hidden="true"><i /></span>
        <div>
          <span className="eyebrow">Official Philippine bulletins</span>
          <h2 id="typhoon-heading">PAGASA Typhoon Center</h2>
          <p>Current tropical-cyclone bulletins read directly from PAGASA's official public pages.</p>
        </div>
        <span className={`alert-status ${hasActiveStorm ? "is-active" : ""}`}>
          {loading
            ? "Checking"
            : data?.stale
              ? "Cached update"
              : hasActiveStorm
                ? `${bulletins.length} active`
                : "Monitoring"}
        </span>
      </div>

      {loading && !data && (
        <div className="pagasa-loading" role="status">
          <span aria-hidden="true" />
          Checking the latest PAGASA bulletin…
        </div>
      )}

      {error && !data && (
        <div className="no-typhoon-alert is-unavailable" role="status">
          <strong>PAGASA could not be reached right now.</strong>
          <p>{error} Use the official bulletin button below to check directly.</p>
          <button type="button" onClick={onRetry} disabled={loading}>
            Try PAGASA again
          </button>
        </div>
      )}

      {data && (data.partial || data.stale) && (
        <div className="pagasa-service-note" role="status">
          <strong>{data.stale ? "Showing the latest saved official bulletin." : "One PAGASA source is temporarily unavailable."}</strong>
          <span>
            {data.stale
              ? "Check the official PAGASA link for the newest update while CliMate reconnects."
              : "Available official bulletin information is still shown below."}
          </span>
          <button type="button" onClick={onRetry} disabled={loading}>
            {loading ? "Checking…" : "Refresh"}
          </button>
        </div>
      )}

      {!loading && !error && data && !hasActiveStorm && (
        <div className="no-typhoon-alert">
          <strong>No active PAGASA tropical-cyclone bulletin was found.</strong>
          <div className="pagasa-status-grid">
            {data.pages?.map((page) => (
              <div key={page.scope}>
                <span>{page.label}</span>
                <p>{page.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasActiveStorm && (
        <div className="pagasa-bulletin-list">
          {bulletins.map((bulletin) => (
            <article className="pagasa-bulletin" key={bulletin.id}>
              <div className="pagasa-bulletin-top">
                <div>
                  <span className="bulletin-scope">{bulletin.scope_label}</span>
                  <h3>{bulletin.title}</h3>
                  <p>{bulletin.summary}</p>
                </div>
                {bulletin.wind_signal && (
                  <span className="tcws-badge">TCWS #{bulletin.wind_signal}</span>
                )}
              </div>

              <div className="pagasa-detail-grid">
                <Detail label="Issued" value={bulletin.issued_at} />
                <Detail label="Location of center" value={bulletin.location} />
                <Detail label="Movement" value={bulletin.movement} />
                <Detail label="Strength" value={bulletin.strength} />
              </div>

              <details className="pagasa-complete">
                <summary>
                  <span>Complete official report</span>
                  <small>Affected areas, outlook, forecast track, and source files</small>
                </summary>
                <div className="pagasa-complete-content">
                  {bulletin.affected_areas && (
                    <div className="pagasa-affected">
                      <span>Affected areas</span>
                      <p>{bulletin.affected_areas}</p>
                    </div>
                  )}

                  {bulletin.track_outlook?.length > 0 && (
                    <div className="pagasa-outlook">
                      <h4>Track and intensity outlook</h4>
                      {bulletin.track_outlook.map((item) => <p key={item}>{item}</p>)}
                    </div>
                  )}

                  <div className="pagasa-track-grid">
                    {bulletin.track_image_url && (
                      <a href={bulletin.track_image_url} target="_blank" rel="noreferrer" className="track-image-link">
                        <img src={bulletin.track_image_url} alt={`Official PAGASA forecast track for ${bulletin.title}`} loading="lazy" />
                        <span>Open official track image</span>
                      </a>
                    )}

                    {bulletin.forecast_positions?.length > 0 && (
                      <div className="forecast-position-list">
                        <h4>Forecast positions</h4>
                        <ol>
                          {bulletin.forecast_positions.slice(0, 5).map((position) => (
                            <li key={position}>{position}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  <div className="pagasa-actions">
                    {bulletin.bulletin_url && (
                      <a href={bulletin.bulletin_url} target="_blank" rel="noreferrer">Read official PDF ↗</a>
                    )}
                    <a href={bulletin.source_url} target="_blank" rel="noreferrer">View on PAGASA</a>
                    {bulletin.signals_image_url && (
                      <a href={bulletin.signals_image_url} target="_blank" rel="noreferrer">View signal areas</a>
                    )}
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      )}

      <div className="typhoon-footer">
        <div>
          <p>Storm positions are official estimates—not GPS tracking. Always follow local authorities and evacuation instructions.</p>
          {data?.fetched_at && <small>Bulletin pages checked {formatFetched(data.fetched_at)}</small>}
        </div>
        <div className="typhoon-footer-links">
          <a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin" target="_blank" rel="noreferrer">Latest PAGASA bulletin</a>
          <a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/tc-threat-potential-forecast" target="_blank" rel="noreferrer">2-week threat potential</a>
        </div>
      </div>
    </section>
  );
}

export default TyphoonCenter;

import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/geocodingApi";

function LocationSearch({ onSelectLocation, disabled }) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);

  useEffect(() => {
    const cleanSearch = searchText.trim();
    if (cleanSearch.length < 2) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      const currentRequest = ++requestId.current;
      setSearching(true);
      setError("");

      try {
        const locations = await searchLocations(cleanSearch);
        if (currentRequest !== requestId.current) return;
        setResults(locations);
        setActiveIndex(-1);
        if (!locations.length) setError("No places found. Try a nearby city.");
      } catch (requestError) {
        if (currentRequest !== requestId.current) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to search right now."
        );
      } finally {
        if (currentRequest === requestId.current) setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  function handleSelect(location) {
    onSelectLocation(location);
    setSearchText("");
    setResults([]);
    setError("");
    setActiveIndex(-1);
  }

  function handleChange(event) {
    const value = event.target.value;
    setSearchText(value);
    if (value.trim().length < 2) {
      requestId.current += 1;
      setResults([]);
      setError("");
      setActiveIndex(-1);
      setSearching(false);
    }
  }

  function handleKeyDown(event) {
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    }
    if (event.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
    }
  }

  return (
    <section className="location-search">
      <div className="search-icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="location-search">
        Search for a city or country
      </label>
      <input
        id="location-search"
        type="search"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls="location-results"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `location-option-${activeIndex}` : undefined}
        value={searchText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search any city or place..."
        autoComplete="off"
        disabled={disabled}
      />
      <span className={`search-status ${searching ? "is-searching" : ""}`}>
        {searching ? "Searching" : "Worldwide"}
      </span>

      {error && <p className="search-error">{error}</p>}

      {results.length > 0 && (
        <ul className="search-results" id="location-results" role="listbox">
          {results.map((location, index) => {
            const secondary = [location.admin1, location.country]
              .filter(Boolean)
              .filter((part, partIndex, parts) => parts.indexOf(part) === partIndex)
              .join(", ");

            return (
              <li key={location.id} role="option" aria-selected={activeIndex === index}>
                <button
                  id={`location-option-${index}`}
                  type="button"
                  className={activeIndex === index ? "is-active" : ""}
                  onClick={() => handleSelect(location)}
                >
                  <span className="result-pin" aria-hidden="true" />
                  <span>
                    <strong>{location.name}</strong>
                    <small>{secondary}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default LocationSearch;

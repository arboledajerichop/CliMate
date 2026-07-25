import { useCallback, useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/geocodingApi";

function LocationSearch({ onSelectLocation, disabled }) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);

  const runSearch = useCallback(async (value) => {
    const cleanSearch = value.trim();

    if (cleanSearch.length < 2) {
      setError("Enter at least two letters.");
      setResults([]);
      return;
    }

    const currentRequest = ++requestId.current;
    setSearching(true);
    setError("");

    try {
      const locations = await searchLocations(cleanSearch);
      if (currentRequest !== requestId.current) return;
      setResults(locations);
      setActiveIndex(-1);
      if (!locations.length) {
        setError("No places found. Try a nearby city or add the country.");
      }
    } catch (requestError) {
      if (currentRequest !== requestId.current) return;
      setResults([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to search right now."
      );
    } finally {
      if (currentRequest === requestId.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const cleanSearch = searchText.trim();
    if (cleanSearch.length < 2) return undefined;

    const timer = window.setTimeout(() => runSearch(cleanSearch), 500);
    return () => window.clearTimeout(timer);
  }, [runSearch, searchText]);

  function handleSubmit(event) {
    event.preventDefault();
    runSearch(searchText);
  }

  function handleSelect(location) {
    requestId.current += 1;
    onSelectLocation(location);
    setSearchText("");
    setResults([]);
    setError("");
    setActiveIndex(-1);
    setSearching(false);
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
    if (event.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

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
  }

  return (
    <section className="location-search">
      <form className="location-search-form" onSubmit={handleSubmit}>
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
          aria-activedescendant={
            activeIndex >= 0 ? `location-option-${activeIndex}` : undefined
          }
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Try Tokyo, Paris, New York..."
          autoComplete="off"
          disabled={disabled}
        />
        <button
          className="search-submit"
          type="submit"
          disabled={disabled || searching || searchText.trim().length < 2}
        >
          {searching ? <span className="button-spinner" aria-label="Searching" /> : "Search"}
        </button>
      </form>

      {error && <p className="search-error" role="alert">{error}</p>}

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

function SavedLocations({ favourites, recent, currentLocation, onSelect, onToggleFavourite }) {
  const isFavourite = favourites.some(
    (item) => item.latitude === currentLocation?.latitude && item.longitude === currentLocation?.longitude
  );
  const visibleRecent = recent.filter(
    (item) => !favourites.some((favourite) => favourite.latitude === item.latitude && favourite.longitude === item.longitude)
  ).slice(0, 3);

  return (
    <section className="saved-locations" aria-label="Saved and recent places">
      <button
        type="button"
        className={`save-current ${isFavourite ? "is-saved" : ""}`}
        onClick={onToggleFavourite}
        disabled={!currentLocation}
        aria-pressed={isFavourite}
      >
        <span aria-hidden="true">{isFavourite ? "★" : "☆"}</span>
        {isFavourite ? "Saved" : "Save this place"}
      </button>
      {[...favourites, ...visibleRecent].slice(0, 5).map((location) => (
        <button key={`${location.latitude}-${location.longitude}`} type="button" onClick={() => onSelect(location)}>
          {location.name}
        </button>
      ))}
    </section>
  );
}

export default SavedLocations;

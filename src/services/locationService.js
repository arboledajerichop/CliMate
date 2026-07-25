export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("Location services are not supported by this browser.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },

      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                "Location permission was denied. Please allow location access or search for a city manually."
              )
            );
            break;

          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                "Your current location could not be determined."
              )
            );
            break;

          case error.TIMEOUT:
            reject(
              new Error(
                "The location request took too long."
              )
            );
            break;

          default:
            reject(
              new Error(
                "Unable to retrieve your current location."
              )
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export async function getLocationName(latitude, longitude) {
  const parameters = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    localityLanguage: "en",
  });

  const url =
    "https://api.bigdatacloud.net/data/reverse-geocode-client";

  const response = await fetch(`${url}?${parameters}`);

  if (!response.ok) {
    return "Current Location";
  }

  const data = await response.json();

  console.log("Reverse geocoding response:", data);

  const place =
    data.locality ||
    data.city ||
    data.principalSubdivision ||
    "Current Location";

  const country = cleanCountryName(
    data.countryName || data.countryCode
  );

  return buildLocationName(place, country);
}

function buildLocationName(place, country) {
  const parts = [place, country]
    .map((part) => part?.trim())
    .filter(Boolean);

  return [...new Set(parts)].join(", ");
}

function cleanCountryName(countryName) {
  if (!countryName) {
    return "";
  }

  return countryName
    .replace(/\s*\(the\)\s*/gi, "")
    .trim();
}
let cachedGeoJson = null;
let loadingPromise = null;

export const getPeruGeoJson = async () => {
  if (cachedGeoJson) return cachedGeoJson;
  if (loadingPromise) return await loadingPromise;
  
  loadingPromise = fetch('/peru-departamentos.geojson')
    .then(response => response.json())
    .then(data => {
      cachedGeoJson = data;
      return data;
    })
    .finally(() => {
      loadingPromise = null;
    });
  
  return await loadingPromise;
};
// Mapbox configuration
// You can get a free Mapbox access token from: https://account.mapbox.com/access-tokens/

export const MAPBOX_CONFIG = {
  // Replace this with your own Mapbox access token
  // For development, you can use this demo token, but it has limitations
  ACCESS_TOKEN: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  
  // Map styles
  STYLES: {
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
    LIGHT: 'mapbox://styles/mapbox/light-v11',
    DARK: 'mapbox://styles/mapbox/dark-v11',
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    SATELLITE_STREETS: 'mapbox://styles/mapbox/satellite-streets-v12'
  },
  
  // Default map settings
  DEFAULT_ZOOM: 16,
  DEFAULT_PITCH: 60,
  DEFAULT_BEARING: 0,
  
  // 3D Building settings
  BUILDING_HEIGHT_SCALE: 1.0,
  BUILDING_OPACITY: 0.6,
  
  // Terrain settings
  TERRAIN_EXAGGERATION: 1.5,
  TERRAIN_SOURCE: 'mapbox://mapbox.mapbox-terrain-dem-v1'
};

// Instructions for getting your own Mapbox token:
/*
1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Go to Access Tokens page
4. Create a new token or use the default public token
5. Copy the token and replace the ACCESS_TOKEN above
6. The free tier includes 50,000 map loads per month
*/

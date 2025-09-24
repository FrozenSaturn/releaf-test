import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Environment } from '@react-three/drei';
import { MAPBOX_CONFIG } from '../../config/mapbox';

// Conditionally import Mapbox only for native platforms
let Mapbox = null;
if (Platform.OS !== 'web') {
  try {
    Mapbox = require('@rnmapbox/maps').default;
    if (Mapbox && Mapbox.setAccessToken) {
      Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);
    }
  } catch (error) {
    console.warn('Mapbox not available for this platform:', Platform.OS);
    Mapbox = null;
  }
}


const { width, height } = Dimensions.get('window');

const Map3D = ({ children, initialCamera, onLocationChange }) => {
  const [mapCenter, setMapCenter] = useState(initialCamera?.center || [0, 0]);
  const [mapPitch, setMapPitch] = useState(initialCamera?.pitch || MAPBOX_CONFIG.DEFAULT_PITCH);
  const [mapZoom, setMapZoom] = useState(initialCamera?.zoom || MAPBOX_CONFIG.DEFAULT_ZOOM);
  const cameraRef = useRef();

  const handleCameraChanged = (camera) => {
    if (camera.centerCoordinate) {
      setMapCenter(camera.centerCoordinate);
    }
    if (camera.pitch !== undefined) {
      setMapPitch(camera.pitch);
    }
    if (camera.zoomLevel !== undefined) {
      setMapZoom(camera.zoomLevel);
    }
    
    // Notify parent component of camera changes
    if (onLocationChange) {
      onLocationChange({
        center: camera.centerCoordinate || mapCenter,
        pitch: camera.pitch !== undefined ? camera.pitch : mapPitch,
        zoom: camera.zoomLevel !== undefined ? camera.zoomLevel : mapZoom
      });
    }
  };

  // For web platform, show a simplified version
  if (Platform.OS === 'web' || !Mapbox) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          {/* Simple background for web */}
          <View style={styles.webMapBackground} />
          
          {/* Three.js Canvas for 3D objects */}
          <Canvas camera={{ position: [0, 0, 1000], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="sunset" />
            
            {/* 3D Objects will be rendered here */}
            {children}
            
            {/* Camera controls for 3D navigation */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
            />
          </Canvas>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapbox 3D Map */}
      <Mapbox.MapView
        style={styles.map}
        styleURL={MAPBOX_CONFIG.STYLES.SATELLITE_STREETS}
        onCameraChanged={handleCameraChanged}
        projection="globe"
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={mapCenter}
          zoomLevel={mapZoom}
          pitch={mapPitch}
          animationMode="flyTo"
          animationDuration={1000}
        />
        
        {/* Enable 3D buildings */}
        <Mapbox.FillExtrusionLayer
          id="3d-buildings"
          sourceID="composite"
          sourceLayerID="building"
          filter={['==', 'extrude', 'true']}
          style={{
            fillExtrusionColor: '#aaa',
            fillExtrusionHeight: [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            fillExtrusionBase: [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            fillExtrusionOpacity: MAPBOX_CONFIG.BUILDING_OPACITY
          }}
        />

        {/* Add terrain for more 3D effect */}
        <Mapbox.RasterDemSource
          id="mapbox-dem"
          url={MAPBOX_CONFIG.TERRAIN_SOURCE}
          tileSize={512}
          maxZoomLevel={14}
        />
        
        <Mapbox.Terrain
          sourceID="mapbox-dem"
          exaggeration={MAPBOX_CONFIG.TERRAIN_EXAGGERATION}
        />

        {/* Sky layer for atmospheric effect */}
        <Mapbox.SkyLayer
          id="sky"
          style={{
            skyType: 'atmosphere',
            skyAtmosphereSun: [0.0, 0.0],
            skyAtmosphereSunIntensity: 15
          }}
        />
      </Mapbox.MapView>

      {/* Three.js Overlay for 3D objects */}
      <View style={styles.threeOverlay}>
        <Canvas camera={{ position: [0, 0, 1000], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="sunset" />
          
          {/* 3D Objects will be rendered here */}
          {children}
          
          {/* Camera controls for 3D navigation */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={false}
          />
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  threeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none', // Allow map interaction through overlay
  },
  webFallback: {
    flex: 1,
    position: 'relative',
  },
  webMapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#87CEEB', // Sky blue background
    opacity: 0.3,
  },
});

export default Map3D;
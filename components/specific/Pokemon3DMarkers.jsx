import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Html } from '@react-three/drei';

// 3D Character component (like the player avatar in Pokemon GO)
const PlayerAvatar = ({ position = [0, 0, 0] }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Player body */}
      <Sphere ref={meshRef} args={[0.5, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial attach="material" color="#4CAF50" />
      </Sphere>
      
      {/* Player head */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.8, 0]}>
        <meshStandardMaterial attach="material" color="#FFE0B2" />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.05, 8, 8]} position={[-0.1, 0.9, 0.25]}>
        <meshStandardMaterial attach="material" color="#000" />
      </Sphere>
      <Sphere args={[0.05, 8, 8]} position={[0.1, 0.9, 0.25]}>
        <meshStandardMaterial attach="material" color="#000" />
      </Sphere>
    </group>
  );
};

// 3D Collectible items (like Pokeballs, items, etc.)
const CollectibleItem = ({ position = [0, 0, 0], type = 'pokeball', onCollect }) => {
  const meshRef = useRef();
  const [collected, setCollected] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      // Rotating animation
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const handleClick = () => {
    if (!collected && onCollect) {
      setCollected(true);
      onCollect(type);
    }
  };

  if (collected) return null;

  const renderItem = () => {
    switch (type) {
      case 'pokeball':
        return (
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial attach="material" color="#FF0000" />
          </Sphere>
        );
      case 'gem':
        return (
          <Box args={[0.4, 0.4, 0.4]}>
            <meshStandardMaterial attach="material" color="#9C27B0" emissive="#4A148C" emissiveIntensity={0.3} />
          </Box>
        );
      case 'coin':
        return (
          <Cylinder args={[0.2, 0.2, 0.1, 16]}>
            <meshStandardMaterial attach="material" color="#FFD700" emissive="#B8860B" emissiveIntensity={0.2} />
          </Cylinder>
        );
      default:
        return (
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial attach="material" color="#FF0000" />
          </Sphere>
        );
    }
  };

  return (
    <group position={position} onClick={handleClick}>
      {renderItem()}
      
      {/* Glowing effect */}
      <Html distanceFactor={10}>
        <div style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          position: 'absolute',
          top: '-30px',
          left: '-30px',
          pointerEvents: 'none'
        }} />
      </Html>
    </group>
  );
};

// 3D Building markers
const BuildingMarker = ({ position = [0, 0, 0], type = 'gym' }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getBuildingColor = () => {
    switch (type) {
      case 'gym':
        return '#FF6B6B';
      case 'pokestop':
        return '#4ECDC4';
      case 'raid':
        return '#FFE66D';
      default:
        return '#95A5A6';
    }
  };

  return (
    <group position={position}>
      {/* Building base */}
      <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial attach="material" color={getBuildingColor()} />
      </Box>
      
      {/* Building roof */}
      <Cylinder args={[0.7, 0.3, 0.5, 8]} position={[0, 1.25, 0]}>
        <meshStandardMaterial attach="material" color={getBuildingColor()} />
      </Cylinder>
      
      {/* Glowing ring around building */}
      <Html distanceFactor={15}>
        <div style={{
          border: `3px solid ${getBuildingColor()}`,
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          animation: 'pulse 2s infinite',
          pointerEvents: 'none'
        }} />
      </Html>
    </group>
  );
};

// Main component that renders all 3D elements
const Pokemon3DMarkers = ({ userLocation, cameraState }) => {
  const [collectedItems, setCollectedItems] = useState([]);

  const handleItemCollect = (itemType) => {
    setCollectedItems(prev => [...prev, itemType]);
    console.log(`Collected ${itemType}!`);
  };

  // Generate random positions around the user location
  const generateRandomPosition = (offset = 5) => {
    if (!userLocation) return [0, 0, 0];
    
    const lat = userLocation.coords.latitude + (Math.random() - 0.5) * offset / 111; // Rough conversion
    const lng = userLocation.coords.longitude + (Math.random() - 0.5) * offset / (111 * Math.cos(lat * Math.PI / 180));
    
    // Convert to 3D world coordinates (simplified)
    return [
      (lng - userLocation.coords.longitude) * 1000,
      0,
      (lat - userLocation.coords.latitude) * 1000
    ];
  };

  return (
    <>
      {/* Player Avatar at center */}
      <PlayerAvatar position={[0, 0, 0]} />
      
      {/* Collectible Items */}
      {[...Array(5)].map((_, i) => (
        <CollectibleItem
          key={`item-${i}`}
          position={generateRandomPosition(3)}
          type={['pokeball', 'gem', 'coin'][i % 3]}
          onCollect={handleItemCollect}
        />
      ))}
      
      {/* Building Markers */}
      {[...Array(3)].map((_, i) => (
        <BuildingMarker
          key={`building-${i}`}
          position={generateRandomPosition(8)}
          type={['gym', 'pokestop', 'raid'][i % 3]}
        />
      ))}
      
      {/* Distance indicators */}
      <Html position={[0, 3, 0]} distanceFactor={20}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          pointerEvents: 'none'
        }}>
          {cameraState ? `Zoom: ${cameraState.zoom.toFixed(1)}` : '3D Map Active'}
        </div>
      </Html>
    </>
  );
};

export default Pokemon3DMarkers;

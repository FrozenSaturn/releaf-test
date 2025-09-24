import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder } from '@react-three/drei';

const Garbage3D = ({ position = [0, 0, 0], scale = 1, type = 'plastic' }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.05;
      // Slight rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getGarbageColors = (garbageType) => {
    switch (garbageType) {
      case 'plastic':
        return { main: '#FF6B35', secondary: '#FFD23F' };
      case 'paper':
        return { main: '#8B4513', secondary: '#DEB887' };
      case 'metal':
        return { main: '#C0C0C0', secondary: '#708090' };
      case 'glass':
        return { main: '#00CED1', secondary: '#87CEEB' };
      case 'organic':
        return { main: '#8FBC8F', secondary: '#556B2F' };
      default:
        return { main: '#FF6B35', secondary: '#FFD23F' };
    }
  };

  const colors = getGarbageColors(type);

  const renderGarbageType = () => {
    switch (type) {
      case 'plastic':
        return (
          <>
            {/* Plastic bottle */}
            <Cylinder args={[0.1, 0.15, 0.4, 8]} position={[0, 0.2, 0]}>
              <meshStandardMaterial attach="material" color={colors.main} />
            </Cylinder>
            <Cylinder args={[0.08, 0.08, 0.1, 8]} position={[0, 0.45, 0]}>
              <meshStandardMaterial attach="material" color={colors.secondary} />
            </Cylinder>
          </>
        );
      case 'paper':
        return (
          <>
            {/* Paper/cardboard */}
            <Box args={[0.3, 0.05, 0.2]} position={[0, 0.025, 0]}>
              <meshStandardMaterial attach="material" color={colors.main} />
            </Box>
            <Box args={[0.25, 0.05, 0.15]} position={[0, 0.075, 0]}>
              <meshStandardMaterial attach="material" color={colors.secondary} />
            </Box>
          </>
        );
      case 'metal':
        return (
          <>
            {/* Metal can */}
            <Cylinder args={[0.12, 0.12, 0.3, 8]} position={[0, 0.15, 0]}>
              <meshStandardMaterial attach="material" color={colors.main} metalness={0.8} roughness={0.2} />
            </Cylinder>
            <Cylinder args={[0.1, 0.1, 0.05, 8]} position={[0, 0.325, 0]}>
              <meshStandardMaterial attach="material" color={colors.secondary} metalness={0.9} roughness={0.1} />
            </Cylinder>
          </>
        );
      case 'glass':
        return (
          <>
            {/* Glass bottle */}
            <Cylinder args={[0.08, 0.12, 0.5, 8]} position={[0, 0.25, 0]}>
              <meshStandardMaterial attach="material" color={colors.main} transparent opacity={0.7} />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.1, 8]} position={[0, 0.55, 0]}>
              <meshStandardMaterial attach="material" color={colors.secondary} transparent opacity={0.8} />
            </Cylinder>
          </>
        );
      case 'organic':
        return (
          <>
            {/* Organic waste */}
            <Sphere args={[0.15, 8, 6]} position={[0, 0.15, 0]}>
              <meshStandardMaterial attach="material" color={colors.main} />
            </Sphere>
            <Sphere args={[0.1, 8, 6]} position={[0.1, 0.2, 0.05]}>
              <meshStandardMaterial attach="material" color={colors.secondary} />
            </Sphere>
          </>
        );
      default:
        return (
          <Box args={[0.2, 0.2, 0.2]} position={[0, 0.1, 0]}>
            <meshStandardMaterial attach="material" color={colors.main} />
          </Box>
        );
    }
  };

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {renderGarbageType()}
      
      {/* Glow effect for collectibility */}
      <Sphere args={[0.3, 8, 8]} position={[0, 0.3, 0]}>
        <meshStandardMaterial 
          attach="material" 
          color="#FFD700" 
          transparent 
          opacity={0.2}
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  );
};

export default Garbage3D;

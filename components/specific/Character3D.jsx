import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder } from '@react-three/drei';

const Character3D = ({ position = [0, 0, 0], scale = 1 }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Character Body */}
      <group position={[0, 0.5, 0]}>
        {/* Head */}
        <Sphere args={[0.3, 16, 16]} position={[0, 1.2, 0]}>
          <meshStandardMaterial attach="material" color="#FFE0B2" />
        </Sphere>
        
        {/* Eyes */}
        <Sphere args={[0.05, 8, 8]} position={[-0.1, 1.3, 0.25]}>
          <meshStandardMaterial attach="material" color="#000" />
        </Sphere>
        <Sphere args={[0.05, 8, 8]} position={[0.1, 1.3, 0.25]}>
          <meshStandardMaterial attach="material" color="#000" />
        </Sphere>
        
        {/* Smile */}
        <Cylinder args={[0.08, 0.08, 0.02, 8]} position={[0, 1.15, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial attach="material" color="#000" />
        </Cylinder>
        
        {/* Body */}
        <Box args={[0.4, 0.8, 0.2]} position={[0, 0.6, 0]}>
          <meshStandardMaterial attach="material" color="#4CAF50" />
        </Box>
        
        {/* Arms */}
        <Box args={[0.15, 0.6, 0.15]} position={[-0.4, 0.6, 0]}>
          <meshStandardMaterial attach="material" color="#FFE0B2" />
        </Box>
        <Box args={[0.15, 0.6, 0.15]} position={[0.4, 0.6, 0]}>
          <meshStandardMaterial attach="material" color="#FFE0B2" />
        </Box>
        
        {/* Legs */}
        <Box args={[0.15, 0.6, 0.15]} position={[-0.15, -0.1, 0]}>
          <meshStandardMaterial attach="material" color="#2196F3" />
        </Box>
        <Box args={[0.15, 0.6, 0.15]} position={[0.15, -0.1, 0]}>
          <meshStandardMaterial attach="material" color="#2196F3" />
        </Box>
        
        {/* Hat */}
        <Cylinder args={[0.35, 0.35, 0.2, 8]} position={[0, 1.5, 0]}>
          <meshStandardMaterial attach="material" color="#FF5722" />
        </Cylinder>
        <Box args={[0.1, 0.3, 0.05]} position={[0, 1.65, 0]}>
          <meshStandardMaterial attach="material" color="#FF5722" />
        </Box>
      </group>
      
      {/* Shadow */}
      <Cylinder args={[0.4, 0.6, 0.02, 16]} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial attach="material" color="#000" opacity={0.3} transparent />
      </Cylinder>
    </group>
  );
};

export default Character3D;


import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder } from '@react-three/drei';

const Tree3D = ({ position = [0, 0, 0], scale = 1, type = 'oak' }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying animation
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
    }
  });

  const getTreeColors = (treeType) => {
    switch (treeType) {
      case 'oak':
        return { trunk: '#8B4513', leaves: '#228B22' };
      case 'pine':
        return { trunk: '#654321', leaves: '#006400' };
      case 'cherry':
        return { trunk: '#A0522D', leaves: '#FFB6C1' };
      case 'maple':
        return { trunk: '#8B4513', leaves: '#FF4500' };
      default:
        return { trunk: '#8B4513', leaves: '#228B22' };
    }
  };

  const colors = getTreeColors(type);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tree Trunk */}
      <Cylinder args={[0.1, 0.15, 1.5, 8]} position={[0, 0.75, 0]}>
        <meshStandardMaterial attach="material" color={colors.trunk} />
      </Cylinder>
      
      {/* Tree Leaves - Multiple layers for fullness */}
      <Sphere args={[0.8, 12, 8]} position={[0, 1.8, 0]}>
        <meshStandardMaterial attach="material" color={colors.leaves} />
      </Sphere>
      <Sphere args={[0.6, 12, 8]} position={[0, 2.2, 0]}>
        <meshStandardMaterial attach="material" color={colors.leaves} />
      </Sphere>
      <Sphere args={[0.4, 12, 8]} position={[0, 2.5, 0]}>
        <meshStandardMaterial attach="material" color={colors.leaves} />
      </Sphere>
      
      {/* Tree Base/Shadow */}
      <Cylinder args={[0.3, 0.4, 0.05, 16]} position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial attach="material" color="#000" opacity={0.3} transparent />
      </Cylinder>
    </group>
  );
};

export default Tree3D;

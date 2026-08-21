import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const ParticleSystem = (props) => {
  const ref = useRef();
  const sphere = random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 });

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#38bdf8" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
};

const ThreeBackground = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleSystem />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;

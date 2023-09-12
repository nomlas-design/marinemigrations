import * as THREE from 'three';

function Map({ sizes, texture }) {
  return (
    <mesh>
      <planeGeometry args={[sizes.width, sizes.height]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} />
    </mesh>
  );
}

export default Map;

import * as THREE from 'three';

const Globe = ({ texture }) => {
  texture.offset.x = 0.25;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial side={THREE.DoubleSide} map={texture} />
      </mesh>
    </>
  );
};

export default Globe;

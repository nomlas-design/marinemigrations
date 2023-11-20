import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';

function Map({ sizes, texture }) {
  texture.offset.x = 0;
  texture.needsUpdate = true;

  const handleClick = (event) => {
    if (event.uv) {
      const x = event.uv.x;
      const y = event.uv.y;

      // Format the coordinates
      const coordinateString = `[${x.toFixed(8)}, ${y.toFixed(8)}],`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(coordinateString)
        .then(() => {
          console.log(`Copied to clipboard: ${coordinateString}`);
        })
        .catch((err) => {
          console.error('Error copying text to clipboard', err);
        });
    }
  };

  return (
    <mesh onClick={handleClick}>
      <planeGeometry args={[sizes.width, sizes.height]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} />
    </mesh>
  );
}

export default Map;

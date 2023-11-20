import { useMemo } from 'react';
import * as THREE from 'three';

const Curves = ({ curves, sizes, numPoints }) => {
  const combinedGeometry = useMemo(() => {
    const combinedVertices = [];
    const indices = [];
    let currentIndex = 0;

    curves.forEach((curve) => {
      const curveVertices = curve.getPoints(numPoints);

      for (let vertex of curveVertices) {
        combinedVertices.push(
          vertex.x * sizes.width - sizes.width / 2,
          vertex.y * sizes.height - sizes.height / 2,
          vertex.z
        );
      }

      for (let i = 0; i < curveVertices.length - 1; i++) {
        indices.push(currentIndex, currentIndex + 1);
        currentIndex++;
      }

      currentIndex++;
    });

    const combinedGeometry = new THREE.BufferGeometry();
    combinedGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(combinedVertices, 3)
    );
    combinedGeometry.setIndex(indices);

    return combinedGeometry;
  }, [curves, sizes]);

  return (
    <lineSegments>
      <primitive attach='geometry' object={combinedGeometry} />
      <lineBasicMaterial color='red' />
    </lineSegments>
  );
};

export default Curves;

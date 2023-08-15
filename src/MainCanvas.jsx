import { useEffect, useMemo, useRef, useState } from 'react';
import {
  OrbitControls,
  useTexture,
  CatmullRomLine,
  OrthographicCamera,
  shaderMaterial,
} from '@react-three/drei';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import mapTexture from './assets/map.png';
import { data } from './data/dummydata.js';
import { vertexShader, fragmentShader } from './shaders/shaders';
import * as THREE from 'three';

function MainCanvas() {
  const [progress, setProgress] = useState(0);

  return (
    <Canvas>
      <OrbitControls />
      <OrthographicCamera makeDefault position={[0, 0, 5]} />
      <Map progress={progress} />
    </Canvas>
  );
}

function Map({ progress }) {
  const texture = useTexture(mapTexture);

  const { size } = useThree();

  const sizes = useMemo(() => {
    const aspectRatio = texture.image.width / texture.image.height;
    const width = size.width * 0.8; // 80% of screen width
    const height = width / aspectRatio;
    return { width, height, aspectRatio };
  }, [texture]);

  let curves = [];

  let timeframes = [];

  for (let key in data) {
    const dataset = data[key];
    const paths = dataset.paths;
    const start = dataset.start;
    const end = dataset.end;
    timeframes.push({ start, end });
    let points = [];
    for (let i = 0; i < paths.length; i++) {
      const x = paths[i][0];
      const y = paths[i][1];
      const x_mapped = (x - 0.5) * sizes.width;
      const y_mapped = (y - 0.5) * sizes.height;

      points.push(new THREE.Vector3(x_mapped, y_mapped, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    curves.push(curve);
  }

  function Path({ curve, start, end }) {
    const curveMat = useRef();
    const [progress, setProgress] = useState(0);

    const { viewport } = useThree();

    function calculateCurveDistance(curve, samples) {
      let totalDistance = 0;
      let previousPoint = curve.getPoint(0);

      for (let i = 1; i <= samples; i++) {
        let t = i / samples;
        let currentPoint = curve.getPoint(t);

        totalDistance += currentPoint.distanceTo(previousPoint);
        previousPoint = currentPoint;
      }

      return totalDistance;
    }

    const curveDistance = calculateCurveDistance(curve, 500);

    useEffect(() => {
      curveMat.current.uniforms.uStart.value = start;
      curveMat.current.uniforms.uEnd.value =
        start + (curveDistance / sizes.width) * 0.5;
    }, [start, end]);

    useFrame(({ clock }) => {
      progress <= 2 ? setProgress(progress + 0.001) : setProgress(0);
      curveMat.current.uniforms.uProgress.value = progress;
    });

    const CurveMaterial = shaderMaterial(
      {
        uTime: {
          value: 0,
        },
        uProgress: { value: 0 },
        uStart: { value: start },
        uEnd: { value: start + (curveDistance / 1000) * 0.5 },
        uLength: { value: curveDistance },
      },
      vertexShader,
      fragmentShader
    );

    extend({ CurveMaterial });

    const points = curve.getPoints(128);
    const vertices = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      vertices[index * 3] = point.x;
      vertices[index * 3 + 1] = point.y;
      vertices[index * 3 + 2] = point.z;
    });

    return (
      <mesh>
        <tubeGeometry args={[curve, 128, 1, 5, false]} />
        <curveMaterial
          ref={curveMat}
          side={THREE.DoubleSide}
          transparent={true}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      // <line>
      //   <bufferGeometry attach='geometry'>
      //     <bufferAttribute
      //       attach='attributes-position'
      //       array={vertices}
      //       count={points.length}
      //       itemSize={3}
      //     />
      //   </bufferGeometry>
      //   <lineBasicMaterial
      //     color={0xffffff} // Adjust color as needed
      //     linewidth={1} // Note: linewidth might not work on all platforms due to WebGL limitations
      //     transparent={true}
      //     blending={THREE.AdditiveBlending}
      //   />
      // </line>
    );
  }

  return (
    <mesh>
      <planeGeometry args={[sizes.width, sizes.height]} />
      <meshBasicMaterial map={texture} />
      {curves.map((curve, index) => (
        <Path
          key={index}
          curve={curve}
          timeline={progress}
          start={timeframes[index].start}
          end={timeframes[index].end}
        />
      ))}
    </mesh>
  );
}

export default MainCanvas;

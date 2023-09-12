import { Canvas, useThree, extend, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  OrthographicCamera,
  shaderMaterial,
  useTexture,
  Stats,
  Plane,
} from '@react-three/drei';
import { Leva, useControls } from 'leva';
import Map from './Map.jsx';
import mapTexture from './assets/map2.png';

import { data } from './data/instancedData.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  curveVertexShader,
  curveFragmentShader,
} from './shaders/textureShaders.jsx';

function CanvasContent({ time }) {
  const texture = useTexture(mapTexture);

  const { size } = useThree();

  const sizes = useMemo(() => {
    const aspectRatio = texture.image.width / texture.image.height;
    const width = size.width * 0.8; // 80% of screen width
    const height = width / aspectRatio;
    return { width, height, aspectRatio };
  }, [texture]);

  // Variables for Leva

  const { curvePoints } = useControls({
    curvePoints: {
      value: 1000,
      min: 1,
      max: 1000,
      step: 1,
    },
  });

  const { speed } = useControls({
    speed: {
      value: 0.25,
      min: 0,
      max: 1,
      step: 0.001,
    },
  });

  const { freqMult } = useControls({
    freqMult: {
      value: 10,
      min: 0,
      max: 500,
      step: 1,
    },
  });

  const { osciMag } = useControls({
    osciMag: {
      value: 10,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  const curvesToTexture = (curves, samples) => {
    const width = samples;
    const height = curves.length;

    const data = new Float32Array(width * height * 4);

    curves.forEach((curve, index) => {
      const totalLength = curve.getLength();

      for (let i = 0; i < width; i++) {
        const t = i / (width - 1);
        const point = curve.getPoint(t);
        const baseIndex = (index * width + i) * 4;

        data[baseIndex] = point.x * sizes.width - sizes.width / 2;
        data[baseIndex + 1] = point.y * sizes.height - sizes.height / 2;
        data[baseIndex + 2] = totalLength;
        data[baseIndex + 3] = 0;
      }
    });

    const texture = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    return texture;
  };

  const { curves, curvesTexture } = useMemo(() => {
    const curves = data.paths.map((path) => {
      const start = new THREE.Vector2(
        path.coordinates[0][0],
        path.coordinates[0][1]
      );
      const end = new THREE.Vector2(
        path.coordinates[path.coordinates.length - 1][0],
        path.coordinates[path.coordinates.length - 1][1]
      );
      const distance = start.distanceTo(end);

      const vectors = path.coordinates.map(
        (coord) => new THREE.Vector3(coord[0], coord[1], distance)
      );
      return new THREE.CatmullRomCurve3(vectors);
    });

    const curvesTexture = curvesToTexture(curves, curvePoints);
    return { curves, curvesTexture };
  }, [data]);

  return (
    <>
      <OrbitControls />
      <Map sizes={sizes} texture={texture} />
      <InstancedSpheres
        numPoints={curvePoints}
        speed={speed}
        curvesTexture={curvesTexture}
        time={time}
        freqMult={freqMult}
        osciMag={osciMag}
      />
      <CurvePlaceholders
        numPoints={curvePoints}
        sizes={sizes}
        curves={curves}
      />
      <OrthographicCamera makeDefault position={[0, 0, 5]} />
    </>
  );
}

function InstancedSpheres({
  curvesTexture,
  time,
  numPoints,
  speed,
  freqMult,
  osciMag,
}) {
  const curveMat = useRef();
  const meshRef = useRef();

  let progress = 0;

  useFrame(() => {
    progress += 0.0001;
    curveMat.current.uniforms.uProgress.value = time;
    curveMat.current.uniforms.uOsciMag.value = osciMag;
    curveMat.current.uniforms.uFreqMult.value = freqMult;
    curveMat.current.uniforms.uProgress.value = progress;
    curveMat.current.uniforms.uSpeed.value = speed;
    curveMat.current.uniforms.uNumCurves.value = numPoints;
  });

  const CurveMaterial = shaderMaterial(
    {
      uTexture: curvesTexture,
      uProgress: time,
      uHeight: data.paths.length,
      uNumCurves: numPoints,
      uSpeed: speed,
      uFreqMult: freqMult,
      uOsciMag: osciMag,
    },
    curveVertexShader,
    curveFragmentShader
  );

  extend({ CurveMaterial });

  const pathIds = new Float32Array(data.dots.map((dot) => dot.pathId));
  const startTimes = new Float32Array(data.dots.map((dot) => dot.startTime));

  const geometry = useMemo(() => {
    //sphere geometry
    const geometry = new THREE.PlaneGeometry(4, 12, 1, 12);
    geometry.setAttribute(
      'pathId',
      new THREE.InstancedBufferAttribute(pathIds, 1)
    );
    geometry.setAttribute(
      'startTime',
      new THREE.InstancedBufferAttribute(startTimes, 1)
    );
    return geometry;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[geometry, null, data.dots.length]}>
      <curveMaterial
        ref={curveMat}
        depthTest={false}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        // wireframe={true}
      />
    </instancedMesh>
    // <Plane args={[1000, 1000]}>
    //   <meshBasicMaterial map={curvesTexture} />
    // </Plane>
  );
}

function CurvePlaceholders({ curves, sizes, numPoints }) {
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
}

function InstancedCanvas({ time }) {
  return (
    <Canvas>
      <Stats />
      <CanvasContent time={time} />
    </Canvas>
  );
}

export default InstancedCanvas;

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  OrbitControls,
  useTexture,
  OrthographicCamera,
  shaderMaterial,
  Stats,
} from '@react-three/drei';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { fragmentShader, vertexShader } from './shaders/mapShaders';
import mapTexture from './assets/texturetest.png';
import * as THREE from 'three';

function TextureCanvas() {
  return (
    <>
      <Canvas>
        <OrbitControls />
        <Stats />
        <OrthographicCamera makeDefault position={[0, 0, 5]} />
        <Map />
      </Canvas>
    </>
  );
}

function Map() {
  const texture = useTexture(mapTexture);
  const { size } = useThree();

  const sizes = useMemo(() => {
    const aspectRatio = texture.image.width / texture.image.height;
    const width = size.width * 0.8; // 80% of screen width
    const height = width / aspectRatio;
    return { width, height, aspectRatio };
  }, []);

  const MapMaterial = shaderMaterial(
    { mapTexture: texture },
    vertexShader,
    fragmentShader
  );
  extend({ MapMaterial });

  return (
    <mesh>
      <planeGeometry args={[sizes.width, sizes.height]} />
      <mapMaterial />
    </mesh>
  );
}

export default TextureCanvas;

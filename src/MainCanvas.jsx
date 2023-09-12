import { useEffect, useMemo, useRef, useState } from 'react';
import {
  OrbitControls,
  useTexture,
  OrthographicCamera,
  shaderMaterial,
  Stats,
} from '@react-three/drei';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import mapTexture from './assets/map2.png';
import { data } from './data/dummydata.js';
import {
  vertexShader,
  fragmentShader,
  vertexShaderParticles,
  fragmentShaderParticles,
} from './shaders/shaders';
import * as THREE from 'three';
import { Leva, useControls } from 'leva';

function MainCanvas() {
  return (
    <>
      <Leva />
      <Canvas>
        <OrbitControls />
        <Stats />
        <OrthographicCamera makeDefault position={[0, 0, 5]} />
        <Map />
      </Canvas>
    </>
  );
}

function Map({}) {
  const { gl, camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const texture = useTexture(mapTexture);
  const { size } = useThree();

  const { curvePoints } = useControls({
    curvePoints: {
      value: 40,
      min: 1,
      max: 100,
      step: 1,
    },
  });

  useEffect(() => {
    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectionPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        // Convert intersectionPoint coordinates to the 0-1 range
        const relativeX = (intersectionPoint.x + sizes.width / 2) / sizes.width;
        const relativeY =
          (intersectionPoint.y + sizes.height / 2) / sizes.height;

        console.log('Clicked at:', relativeX, relativeY);
      }
    };

    gl.domElement.addEventListener('click', onClick);
    return () => {
      gl.domElement.removeEventListener('click', onClick);
    };
  }, [gl.domElement, camera, raycaster]);

  const sizes = useMemo(() => {
    const aspectRatio = texture.image.width / texture.image.height;
    const width = size.width * 0.8; // 80% of screen width
    const height = width / aspectRatio;
    return { width, height, aspectRatio };
  }, [texture]);

  const { render: pathRender, paths } = Path({ data, sizes, curvePoints });

  return (
    <mesh>
      <planeGeometry args={[sizes.width, sizes.height]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} />
      <Particles data={data} paths={paths} />
      {pathRender}
    </mesh>
  );
}

function Path({ data, sizes, curvePoints }) {
  const curveMat = useRef();
  const CurveMaterial = shaderMaterial({}, vertexShader, fragmentShader);

  extend({ CurveMaterial });

  const { combinedGeometry, curveData } = useMemo(() => {
    const combinedVertices = [];
    const indices = [];
    let currentIndex = 0;

    const curveData = []; // This will store our paths for particles

    for (let key in data) {
      const paths = data[key].paths;

      const vectors = paths.map(
        (pt) =>
          new THREE.Vector3(
            (pt[0] - 0.5) * sizes.width,
            (pt[1] - 0.5) * sizes.height,
            0
          )
      );

      const curve = new THREE.CatmullRomCurve3(vectors);
      const curveVertices = curve.getPoints(curvePoints);

      curveData.push(curveVertices); // Store the curve data

      for (let vertex of curveVertices) {
        combinedVertices.push(vertex.x, vertex.y, vertex.z);
      }

      for (let i = 0; i < curveVertices.length - 1; i++) {
        indices.push(currentIndex, currentIndex + 1);
        currentIndex++;
      }

      currentIndex++;
    }

    const combinedGeometry = new THREE.BufferGeometry();
    combinedGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(combinedVertices, 3)
    );
    combinedGeometry.setIndex(indices);

    return {
      combinedGeometry,
      curveData, // Return the curve data along with the geometry
    };
  }, [data, sizes, curvePoints]);

  return {
    render: (
      <lineSegments>
        <primitive attach='geometry' object={combinedGeometry} />
        <curveMaterial
          ref={curveMat}
          side={THREE.DoubleSide}
          transparent={true}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    ),
    paths: curveData, // Return the curve data
  };
}

function Particles({ data, paths }) {
  const particlesRef = useRef();
  const particlesMat = useRef();
  const { clock } = useThree();

  const keys = Object.keys(data).map(Number);

  // Flatten your pings and paths arrays since uniforms need flat structures
  const flatPings = keys.flatMap((k) => data[k].pings);
  const flatPaths = paths.flat();

  const ParticlesMaterial = shaderMaterial(
    {
      elapsedTime: clock.elapsedTime,
      pings: flatPings,
      paths: flatPaths,
    },
    vertexShaderParticles,
    fragmentShaderParticles
  );

  extend({ ParticlesMaterial });

  useEffect(() => {
    const positions = new Float32Array(paths.length * 3);
    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }, [paths.length]);

  useFrame(() => {
    particlesMat.current.uniforms.elapsedTime.value =
      clock.getElapsedTime() % 10;
    particlesMat.current.uniforms.needsUpdate = true;
    //particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  console.log(particlesRef);

  return (
    <points ref={particlesRef}>
      <bufferGeometry attach='geometry' />
      <particlesMaterial
        ref={particlesMat}
        attach='material'
        side={THREE.DoubleSide}
        depthTest={false}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default MainCanvas;

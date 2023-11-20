/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const InstancedPlanes = ({
  curvesTexture,
  progressRef,
  numPoints,
  speed,
  freqMult,
  osciMag,
  data,
  mapType,
  fragment,
  vertex,
  sizes,
}) => {
  const curveMat = useRef();
  const meshRef = useRef();

  useFrame(() => {
    curveMat.current.uniforms.uProgress.value = progressRef.current;
    curveMat.current.uniforms.uOsciMag.value = osciMag;
    curveMat.current.uniforms.uFreqMult.value = freqMult;
    curveMat.current.uniforms.uSpeed.value = speed;
    curveMat.current.uniforms.uNumCurves.value = numPoints;
  });

  const CurveMaterial = useMemo(
    () =>
      shaderMaterial(
        {
          uTexture: curvesTexture,
          uProgress: progressRef.current,
          uHeight: data.paths.length,
          uNumCurves: numPoints,
          uSpeed: speed,
          uFreqMult: freqMult,
          uOsciMag: osciMag,
          uResolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
          uSizes: new THREE.Vector2(sizes.width, sizes.height),
        },
        vertex,
        fragment
      ),
    [
      curvesTexture,
      progressRef,
      numPoints,
      speed,
      freqMult,
      osciMag,
      data,
      sizes,
      vertex,
      fragment,
    ]
  );

  extend({ CurveMaterial });

  useEffect(() => {
    const material = new CurveMaterial();
    if (meshRef.current) {
      meshRef.current.material.dispose(); // Dispose of the old material to prevent memory leaks
      meshRef.current.material = material;

      meshRef.current.material.blending = THREE.AdditiveBlending; // Set blending mode
      meshRef.current.material.side = THREE.DoubleSide; // Example of setting another property
      meshRef.current.material.depthTest = true;
      meshRef.current.material.transparent = true;
      meshRef.current.material.depthWrite = false;
      meshRef.current.material.needsUpdate = true; // Important when changing material properties after creation
    }
    curveMat.current = material;

    return () => {
      material.dispose();
    };
  }, [CurveMaterial]);

  const pathIds = new Float32Array(data.dots.map((dot) => dot.pathId));
  const startTimes = new Float32Array(data.dots.map((dot) => dot.startTime));
  const reversed = new Float32Array(data.dots.map((dot) => dot.reversed));

  const geometry = useMemo(() => {
    //sphere geometry
    const geometry = new THREE.PlaneGeometry(1, 4, 1, 12);
    geometry.setAttribute(
      'pathId',
      new THREE.InstancedBufferAttribute(pathIds, 1)
    );
    geometry.setAttribute(
      'startTime',
      new THREE.InstancedBufferAttribute(startTimes, 1)
    );
    geometry.setAttribute(
      'reversed',
      new THREE.InstancedBufferAttribute(reversed, 1)
    );
    return geometry;
  }, []);

  const sphereGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.005, 6, 6);
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
    <>
      {curveMat.current && (
        <instancedMesh
          ref={meshRef}
          args={[
            mapType === 'planar' ? geometry : sphereGeometry,
            null,
            data.dots.length,
          ]}
        >
          <primitive
            object={curveMat.current}
            attach='material'
            depthTest={true}
            transparent={true}
            depthWrite={true}
            blending={THREE.AdditiveBlending}
            doubleSided={true}
          />
        </instancedMesh>
      )}
    </>
  );
};

export default InstancedPlanes;

import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  OrthographicCamera,
  useTexture,
  Stats,
} from '@react-three/drei';
import { useControls } from 'leva';
import mapTexture from './assets/globe.jpg';

import Map from './Map.jsx';
import Globe from './globe/Globe.jsx';
import InstancedPlanes from './instances/InstancedPlanes.jsx';
import Curves from './curves/Curves.jsx';

import { curvesToTexture } from './lib/curvesToTexture';

import RadioSwitch from './RadioSwitch';
import { ReactComponent as FlatIcon } from './assets/icons/icon_flat.svg';
import { ReactComponent as GlobeIcon } from './assets/icons/icon_globe.svg';

import { data } from './data/onePath';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { globeVertex, globeFragment } from './shaders/globeShaders.jsx';
import { planeVertex, planeFragment } from './shaders/planeShaders.jsx';

function CanvasContent({ progressRef, mapType, sidebarUniforms }) {
  const texture = useTexture(mapTexture);

  const { size } = useThree();
  const { viewport } = useThree();

  const sizes = useMemo(() => {
    const aspectRatio = texture.image.width / texture.image.height;
    const width = size.width * 0.8; // 80% of screen width
    const height = width / aspectRatio;
    return { width, height, aspectRatio };
  }, [texture, size.width, size.height]);

  const { curves, curvesTexture } = useMemo(() => {
    const curves = data.paths.flatMap((path) => {
      let segments = []; // Array to hold separate segments of the path.
      let currentSegment = []; // Current segment being processed.

      path.coordinates.forEach((coord, index) => {
        // Add current coordinate to the segment.
        currentSegment.push(new THREE.Vector3(coord[0], coord[1], 0));

        // Check if the current coordinate is at the boundary and should wrap.
        if (
          coord[0] === 0 ||
          coord[0] === 1 ||
          coord[1] === 0 ||
          coord[1] === 1
        ) {
          // If it's not the last coordinate, then wrap to the other side.
          if (index < path.coordinates.length - 1) {
            // Add a flag to the current coordinate to indicate it's a boundary.
            currentSegment.push(new THREE.Vector3(coord[0], coord[1], -0.01));
            // End the current segment at the boundary.
            segments.push(new THREE.CatmullRomCurve3([...currentSegment]));
            currentSegment = []; // Clear current segment.

            // Determine the opposite boundary value to start a new segment.
            let wrapX = coord[0] === 0 ? 1 : coord[0] === 1 ? 0 : coord[0];
            let wrapY = coord[1] === 0 ? 1 : coord[1] === 1 ? 0 : coord[1];

            // If wrapping on the x-axis, start at x=1 or x=0.
            if (coord[0] === 0 || coord[0] === 1) {
              currentSegment.push(new THREE.Vector3(wrapX, coord[1], 0));
            }

            // If wrapping on the y-axis, start at y=1 or y=0.
            if (coord[1] === 0 || coord[1] === 1) {
              currentSegment.push(new THREE.Vector3(coord[0], wrapY, 0));
            }
          }
        }
      });

      // Add the last processed segment if it contains any points.
      if (currentSegment.length > 0) {
        segments.push(new THREE.CatmullRomCurve3(currentSegment));
      }

      return segments; // Return the array of segments for this path.
    });

    const curvesTexture = curvesToTexture(curves, sidebarUniforms.curvePoints);

    return { curves, curvesTexture };
  }, [data, sidebarUniforms.curvePoints]);

  return (
    <mesh scale={viewport.height / 3}>
      {mapType === 'planar' ? (
        <>
          <Map sizes={sizes} texture={texture} />
          <OrbitControls />

          <OrthographicCamera makeDefault position={[0, 0, 5]} />
        </>
      ) : (
        <>
          <OrbitControls />
          <Globe
            texture={texture}
            curvesTexture={curvesTexture}
            progressRef={progressRef}
          />
        </>
      )}
      <InstancedPlanes
        numPoints={sidebarUniforms.curvePoints}
        sizes={sizes}
        speed={sidebarUniforms.particleSpeed}
        curvesTexture={curvesTexture}
        progressRef={progressRef}
        freqMult={10}
        osciMag={10}
        data={data}
        fragment={mapType === 'planar' ? planeFragment : globeFragment}
        vertex={mapType === 'planar' ? planeVertex : globeVertex}
        mapType={mapType}
      />
      {/* <Curves
        numPoints={sidebarUniforms.curvePoints}
        sizes={sizes}
        curves={curves}
      /> */}
    </mesh>
  );
}

function InstancedCanvas({ progressRef, sidebarUniforms }) {
  const [map, setMap] = useState('planar');
  return (
    <>
      <RadioSwitch
        name='map-type'
        callback={(value) => {
          setMap(value);
        }}
        defaultIndex={0}
        controlRef={useRef()}
        segments={[
          {
            label: 'Planar',
            value: 'planar',
            ref: useRef(),
            icon: <FlatIcon />,
          },
          {
            label: 'Globe',
            value: 'globe',
            ref: useRef(),
            icon: <GlobeIcon />,
          },
        ]}
      />
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <Stats className='stats' />
        <CanvasContent
          progressRef={progressRef}
          mapType={map}
          sidebarUniforms={sidebarUniforms}
        />
      </Canvas>
    </>
  );
}

export default InstancedCanvas;

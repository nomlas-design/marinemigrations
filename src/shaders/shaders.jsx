const fragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uProgress;
uniform float uStart;
uniform float uEnd;
void main() {

    // float mid = ((uEnd - uStart) / 2.0) + uStart;
    
    // float beforeMid = step(uProgress, mid);

    // float alphaIncrease = smoothstep(uStart, mid, uProgress) * step(vUv.x, (uProgress - uStart) / (mid - uStart));
    // // hide ends
    // float alphaDecrease = 1.0 - step(vUv.x, (uProgress - mid) / (uEnd - mid));

    // float alpha = beforeMid * alphaIncrease + (1.0 - beforeMid) * alphaDecrease;

    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uTime;
void main() {
  // vUv = uv;
  // vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderParticles = /* glsl */ `
void main() {
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
`;

const vertexShaderParticles = /* glsl */ `
#define MAX_PINGS 10
#define MAX_PATHS 40
uniform float elapsedTime;                  // Current elapsed time.
uniform float pings[MAX_PINGS];             // Array of ping times.
uniform vec3 paths[MAX_PATHS];              // Array of path positions.
const float deltaTime = 0.5;                // Static duration to traverse between two path points.

void main() {
    float t = 0.0;                          // Initialize t as 0. This represents the progress between two path points.
    
    // Loop through pings to determine the current segment based on elapsed time.
    for (int i = 0; i < MAX_PINGS; i++) {
        if (elapsedTime > pings[i] && elapsedTime <= pings[i] + deltaTime) {
            // Compute progress (0 to 1) within the current segment.
            t = (elapsedTime - pings[i]) / deltaTime;
            break;
        }
    }
    
    // Determine indices in the paths array based on t.
    int startIndex = int(t * float(MAX_PATHS - 1));
    int endIndex = int(t * float(MAX_PATHS));
    
    // Ensure that the indices are within bounds.
    startIndex = min(startIndex, MAX_PATHS - 2);
    endIndex = min(endIndex, MAX_PATHS - 1);
    
    // Get start and end positions based on indices.
    vec3 startPosition = paths[startIndex];
    vec3 endPosition = paths[endIndex];
    
    // Interpolate between start and end positions based on t.
    vec3 currentPosition = mix(startPosition, endPosition, fract(t * float(MAX_PATHS - 1)));

    
    // Compute the final vertex position.
      gl_PointSize = 10.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(currentPosition, 1.0);
}
`;

export {
  vertexShader,
  fragmentShader,
  vertexShaderParticles,
  fragmentShaderParticles,
};

const fragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uProgress;
uniform float uStart;
uniform float uEnd;
void main() {

    float mid = ((uEnd - uStart) / 2.0) + uStart;
    
    float beforeMid = step(uProgress, mid);

    float alphaIncrease = smoothstep(uStart, mid, uProgress) * step(vUv.x, (uProgress - uStart) / (mid - uStart));
    // hide ends
    float alphaDecrease = 1.0 - step(vUv.x, (uProgress - mid) / (uEnd - mid));

    float alpha = beforeMid * alphaIncrease + (1.0 - beforeMid) * alphaDecrease;

    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), alpha);
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uTime;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export { vertexShader, fragmentShader };

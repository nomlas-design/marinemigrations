const fragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uRandom;
uniform float uTimeline;
void main() {
  float hideCorners = smoothstep(1., 0.95, vUv.x);
  float hideCorners1 = smoothstep(0., 0.05, vUv.x);
  vec3 color = vec3(0.3, 0.5, 1.);
  vec3 finalColour = mix(color, color*0.05, vProgress);
  if (uTimeline < 0.5) {
    finalColour = vec3(1., 0, 0);
  }
  gl_FragColor = vec4(finalColour, hideCorners*hideCorners1);
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying float vProgress;
uniform float uTime;
uniform float uRandom;
void main() {
  vUv = uv;
  vPosition = position;
  vProgress = smoothstep(-1., 1., sin(vUv.x * -8. + uTime*3. + 0.3*100.));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export { vertexShader, fragmentShader };

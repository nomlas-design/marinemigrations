const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D mapTexture;
varying vec2 vUv;
void main() {
  vec4 texColor = texture2D(mapTexture, vUv);

if(texture2D(mapTexture, vUv).r > 0.5) { // You may need to adjust this threshold
    discard; 
}
  gl_FragColor = vec4(1., 0., 0., 1.);
}
`;

export { vertexShader, fragmentShader };

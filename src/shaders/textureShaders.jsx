const curveVertexShader = /* glsl */ `

precision highp float;

uniform float uProgress;
uniform sampler2D uTexture;
uniform float uHeight;
uniform float uNumCurves;
uniform float uSpeed;
uniform float uFreqMult;
uniform float uOsciMag;

attribute float pathId;
attribute float startTime;

varying vec2 vUv;
varying float vStartTime;
varying float vEffectiveProgress;

void main() {
    vUv = uv;
    vStartTime = startTime;

    // vEffectiveProgress = uProgress - startTime;
    float modifiedProgress = max(0.0, uProgress - startTime);
  
    // Find the row of the texture that contains the curve we're interested in.
    float curve = ((pathId) - 1.) / uHeight;
    float curveLength = texture2D(uTexture, vec2(1.0, curve)).b;

    // Adjust the speed of the animation based on the length of the curve
    float speed = curveLength * 0.05;
    float newProgress = modifiedProgress * uSpeed * 10. * curveLength;

    vEffectiveProgress = newProgress;

    // Find the column of the texture that contains the curve we're interested in.
    float currentColumn = floor(newProgress * (uNumCurves - 1.0)); // -1 because we start from 0

    // Take a sample of the next point in the curve to find the position of the curve at the current progress.
    vec2 pos1 = texture2D(uTexture, vec2(currentColumn / uNumCurves, curve)).rg;
    vec2 pos2 = texture2D(uTexture, vec2((currentColumn + 2.0) / uNumCurves, curve)).rg;
    vec2 pos = mix(pos1, pos2, vec2(1.));

    // Sample the two points to get nomralize the direction of the curve and calculate the rotated position
    vec2 direction = normalize(pos2 - pos1);

    float random = fract(sin(startTime * 78.233 + startTime) * 43758.5453123);

    vec2 oscillation = vec2(uOsciMag * sin(uFreqMult * modifiedProgress * random), uOsciMag * sin(uFreqMult * modifiedProgress * random));
    
    vec2 rotatedPosition = vec2(
     position.x * direction.y + position.y * direction.x,
     position.y * direction.y - position.x * direction.x);
     


    vec2 finalPos = vec2(rotatedPosition + oscillation + pos);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 0.0, 1.0);
}
`;

const curveFragmentShader = /* glsl */ `

  precision highp float;
  varying float vStartTime;
  varying float vEffectiveProgress;
  varying vec2 vUv;
  uniform float uProgress;

  void main() {

    // floor vEffective progress as 0 or 1
    float displayFragment = step(0.001, vEffectiveProgress) * step(vEffectiveProgress, 1.0);

    if (displayFragment == 0.0) {
      discard;
    }

    vec2 colour = vec2(vUv.y);

    float opacity = vUv.y;

    gl_FragColor = vec4(colour, 1., opacity); // red color with fading transparency
    }
`;

export { curveFragmentShader, curveVertexShader };

const planeVertex = /* glsl */ `

precision highp float;

uniform float uProgress;
uniform sampler2D uTexture;
uniform float uHeight;
uniform float uNumCurves;
uniform float uSpeed;
uniform float uFreqMult;
uniform float uOsciMag;
uniform vec2 uSizes;

attribute float pathId;
attribute float startTime;
attribute float reversed;

varying vec2 vUv;
varying float vStartTime;
varying float vEffectiveProgress;
varying vec2 vPosition;
varying float vHeight;
varying float vPathId;
varying float vReversed;

vec2 getPosition(float column, float uNumCurves, vec2 uSizes, float curve, sampler2D uTexture) {
    vec2 texturePos = texture2D(uTexture, vec2(column / uNumCurves, curve)).rg;
    return texturePos * uSizes - (uSizes / 2.0);
}

void main() {
    vUv = uv;
    vStartTime = startTime;
    vHeight = uHeight;
    vPathId = pathId;
    vReversed = reversed;

    // vEffectiveProgress = uProgress - startTime;
    float modifiedProgress = max(0.0, uProgress - startTime);
  
    // Find the row of the texture that contains the curve we're interested in.
    float curve = ((pathId) - 1.) / uHeight;
    float curveLength = texture2D(uTexture, vec2(1.0, curve)).b;

    // Adjust the speed of the animation based on the length of the curve
    float speed = curveLength * 0.05;
    float newProgress = modifiedProgress * uSpeed * 10. / curveLength;

    vEffectiveProgress = newProgress;

    // Find the column of the texture that contains the curve we're interested in.
    float currentColumn;
    if (reversed != 0.0) {
        currentColumn = (uNumCurves - 1.0) - floor(newProgress * (uNumCurves - 1.0));
    } else {
        currentColumn = floor(newProgress * (uNumCurves - 1.0));
    }

    // Take a sample of the next point in the curve to find the position of the curve at the current progress.
    vec2 pos1 = getPosition(currentColumn, uNumCurves, uSizes, curve, uTexture);
    vec2 pos2 = getPosition(currentColumn + 2.0, uNumCurves, uSizes, curve, uTexture);
    vec2 pos = mix(pos1, pos2, vec2(1.));

    // Sample the two points to get nomralize the direction of the curve and calculate the rotated position
    vec2 direction = normalize(pos2 - pos1);

    float random = fract(sin(startTime * 78.233 + startTime) * 43758.5453123);
    
    float randomSign = sign(fract(sin(dot(vec2(startTime, startTime), vec2(12.9898, 78.233))) * 43758.5453) - 0.5);

    vec2 rotatedPosition = vec2(
     position.x * direction.y + position.y * direction.x,
     position.y * direction.y - position.x * direction.x);

     float curveCenter = 0.5;

    // Calculate distance from the center of the curve
    float distFromCenter = abs(newProgress - curveCenter);

    // Calculate radial displacement based on distance from the center
    // The 'balloonFactor' controls the amount of ballooning
    float balloonFactor = 1.0 - smoothstep(0.0, 0.6, distFromCenter); // Adjust 0.3 to control the width of the ballooning effect
    balloonFactor *= 10.0; // Scaling factor for the displacement

    // Calculate radial direction (perpendicular to the curve direction)
    vec2 radialDir = vec2(-direction.y, direction.x);

    // Apply the radial displacement
    vec2 balloonDisplacement = balloonFactor * radialDir * random * randomSign;

    vec2 finalPos = vec2(rotatedPosition +  pos + balloonDisplacement);

    vPosition = finalPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 0.0, 1.0);
}
`;

const planeFragment = /* glsl */ `

  precision highp float;
  varying float vStartTime;
  varying float vEffectiveProgress;
  varying vec2 vUv;
  varying vec2 vPosition;
  varying float vHeight;
  varying float vPathId;
  varying float vReversed;

  uniform float uProgress;
  uniform vec2 uResolution;

  float calcDistance(vec2 uv) {
    vec2 normalised = abs(uv * 2.0 - 1.0);
    vec2 delta = max(normalised, 0.);
    return length(delta);
  }

  vec3 calculateColor(float pathId) {
      // Example: generate a color based on sine functions
      float r = abs(sin(pathId));
      float g = abs(sin(pathId + 1.57)); // offset for green
      float b = abs(sin(pathId + 3.14)); // offset for blue
      return vec3(r, g, b);
  }

  void main() {

    // floor vEffective progress as 0 or 1
    float displayFragment = step(0.001, vEffectiveProgress) * step(vEffectiveProgress, 1.0);

    if (displayFragment == 0.0) {
      discard;
    }

    float uRadius = 1.;
    
    float dist = calcDistance(vUv);

    // If the fragment is close to any of the corners and outside the radius, discard it
    if (dist > uRadius && ((vReversed == 1.0 && vUv.y < 0.5) || (vReversed != 1.0 && vUv.y > 0.5))) {
        discard;
    }

    float firstIndex = vPathId / vHeight;

    vec3 colour = calculateColor(vPathId);

    gl_FragColor = vec4(colour, 1.0);
    }
`;

export { planeVertex, planeFragment };

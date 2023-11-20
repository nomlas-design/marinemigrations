const trailVertex = /* glsl */ `

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

varying vec2 vUv;
varying float vStartTime;
varying float vEffectiveProgress;
varying vec2 vPosition;

const float PI = 3.1415926535897932384626433832795;


vec3 mapPathToSphere(vec2 pathCoords, float uSphereRadius) {

    float lon = pathCoords.x * 360. - 180.;
    float lat = pathCoords.y * 180. - 90.;

    float lonRad = lon * (PI / 180.);
    float latRad = lat * (PI / 180.);

    return vec3(
      uSphereRadius * cos(latRad) * sin(lonRad),
      uSphereRadius * sin(latRad),
      uSphereRadius * cos(latRad) * cos(lonRad)
    );
}

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
    float newProgress = modifiedProgress * uSpeed * 10. / curveLength;
    vEffectiveProgress = newProgress;

    // Find the column of the texture that contains the curve we're interested in.
    float currentColumn = floor(newProgress * (uNumCurves - 1.0)); // -1 because we start from 0

    // Take a sample of the next point in the curve to find the position of the curve at the current progress.
    vec2 pos1 = texture2D(uTexture, vec2(currentColumn - 10.0 / uNumCurves, curve)).rg;
    vec2 pos2 = texture2D(uTexture, vec2((currentColumn) / uNumCurves, curve)).rg;
    vec2 pos = mix(pos1, pos2, vec2(1.));

    // Sample the two points to get nomralize the direction of the curve and calculate the rotated position

      // Map the 2D position to angles for spherical coordinates
    float uSphereRadius = 1.;
    float phi = pos.x * 2.0 * 3.14159265359; // Longitude (0 to 2π)
    float theta = pos.y * 3.14159265359; // Latitude (0 to π)

    // Convert spherical coordinates to Cartesian coordinates for 3D position
    vec3 spherePosition = mapPathToSphere(pos, 1.);



    gl_Position = projectionMatrix * modelViewMatrix * vec4(spherePosition + position, 1.0);
}
`;

const trailFragment = /* glsl */ `

  precision highp float;
  varying float vStartTime;
  varying float vEffectiveProgress;
  varying vec2 vUv;
  uniform float uProgress;
  uniform vec2 uResolution;
  varying vec2 vPosition;

  float calcDistance(vec2 uv) {
    vec2 normalised = abs(uv * 2.0 - 1.0);
    vec2 delta = max(normalised, 0.);
    return length(delta);
}

  void main() {

    // floor vEffective progress as 0 or 1
    float displayFragment = step(0.001, vEffectiveProgress) * step(vEffectiveProgress, 1.0);

    if (displayFragment == 0.0) {
      discard;
    }

    gl_FragColor = vec4(1., 1., 0, 1.);

    }
`;

export { trailFragment, trailVertex };

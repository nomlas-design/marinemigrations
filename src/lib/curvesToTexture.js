import * as THREE from 'three';

function isSegmented(curve, index, curves) {
  // Determine if a curve is segmented based on your criteria,
  // for example, if the z coordinate of the last point is -0.01.
  // Make sure to check that 'index + 1' is within 'curves' bounds.
  return (
    curve.points[curve.points.length - 1].z === -0.01 &&
    index + 1 < curves.length
  );
}
const calculateProportions = (numbers, width) => {
  // Calculate the total sum of the numbers
  const totalSum = numbers.reduce((sum, num) => sum + num, 0);

  // Calculate the raw proportions
  const rawProportions = numbers.map((num) => (num / totalSum) * width);

  // Convert raw proportions to whole numbers
  let wholeProportions = rawProportions.map((proportion) =>
    Math.round(proportion)
  );

  // Check if the sum of whole proportions matches the width due to rounding
  let currentWidth = wholeProportions.reduce((sum, num) => sum + num, 0);

  // Distribute/collect the rounding differences
  while (currentWidth !== width) {
    // Calculate the error for each rounded proportion
    let errors = rawProportions.map((prop, index) => ({
      index: index,
      error: prop - wholeProportions[index],
    }));

    // Sort by error magnitude
    errors.sort((a, b) => Math.abs(b.error) - Math.abs(a.error));

    // Adjust the biggest error proportion by 1
    if (currentWidth < width) {
      wholeProportions[errors[0].index] += 1; // If less, increment the largest error
      currentWidth += 1;
    } else {
      wholeProportions[errors[0].index] -= 1; // If more, decrement the largest error
      currentWidth -= 1;
    }
  }

  return wholeProportions;
};

const curvesToTexture = (curves, samples) => {
  const width = samples;
  const height = curves.length; // This might need to change depending on how you define 'height' for multiple segments.

  const data = new Float32Array(width * height * 4);

  let dataIndex = 0; // Use an independent index to keep track of data array position.

  for (let i = 0; i < curves.length; i++) {
    let curve = curves[i];
    let segmentLengths = [curve.getLength()];
    let segments = 1;

    // Collect lengths of subsequent curves if they are part of the same segment.
    while (isSegmented(curve, i + segments - 1, curves)) {
      curve = curves[i + segments];
      segmentLengths.push(curve.getLength());
      segments++;
    }

    // Calculate the proportions of the segments based on their lengths.
    const proportions = calculateProportions(segmentLengths, width);

    const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
    // Iterate over each segment and assign points based on calculated proportions.
    for (let j = 0; j < segments; j++) {
      curve = curves[i + j];
      for (let k = 0; k < proportions[j]; k++) {
        const t = k / Math.max(1, proportions[j] - 1); // Prevent division by zero.
        const point = curve.getPointAt(t);
        const baseIndex = (dataIndex + k) * 4;

        data[baseIndex] = point.x;
        data[baseIndex + 1] = point.y;
        // Store the 'totalLength' or any other data you might need in the shader.
        data[baseIndex + 2] = totalLength;
        data[baseIndex + 3] = 0; // Alpha channel or additional data.
      }
      dataIndex += proportions[j]; // Move data index forward based on the proportion used.
    }

    // Skip the number of segments added minus one since the loop will increment 'i' anyway.
    i += segments - 1;
  }

  const texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  console.log(texture);
  return texture;
};

export { curvesToTexture };

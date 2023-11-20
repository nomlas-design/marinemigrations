export const data = {
  paths: [
    {
      id: 1,
      coordinates: [
        [0.25, 0.5],
        [0.3, 0.75],
        [0.25, 1],
      ],
    },
    {
      id: 2,
      coordinates: [
        [0.25, 0.0],
        [0.65, 0.25],
        [0.75, 0.5],
        [1, 0.5],
      ],
    },
    {
      id: 3,
      coordinates: [
        [0.25, 0.5],
        [0.5, 0.75],
        [0.75, 0.5],
        [1, 0.5],
      ],
    },
    {
      id: 4,
      coordinates: [
        [0.45, 0.5],
        [0.35, 0.75],
        [0.75, 0.5],
        [1, 0.5],
      ],
    },
  ],
  dots: [
    { pathId: 3, startTime: 0.5 },
    { pathId: 2, startTime: 0.5 },
    { pathId: 4, startTime: 0 },
    { pathId: 1, startTime: 0 },
  ],
};

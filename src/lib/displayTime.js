const displayTime = (start, end, current) => {
  const range = end - start;
  const time = current * range + start;

  return time.toLocaleString('en-US').split('.')[0];
};

const currentTime = (start, end, current) => {
  const range = end - start;
  const time = current * range + start;

  return time;
};

export { displayTime, currentTime };

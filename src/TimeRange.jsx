const TimeRange = ({ start, end, onChange }) => {
  const handleStartChange = (e) => {
    if (Number(e.target.value) > end) {
      onChange(e.target.value, end);
    } else if (Number(e.target.value) === '') {
      onChange(0, end);
    } else if (Number(e.target.value) < end && Number(e.target.value)) {
      onChange(end - 1, end);
    }
  };

  const handleEndChange = (e) => {
    if (Number(e.target.value) < start) {
      onChange(start, e.target.value);
    } else if (Number(e.target.value) === '') {
      onChange(start, 0);
    } else if (Number(e.target.value)) {
      onChange(start, e.target.value);
    }
  };

  return (
    <div className='timerange'>
      <div className='timerange__input'>
        <label htmlFor='yearstart'>Year Start</label>
        <input
          id='yearstart'
          type='text'
          value={start}
          onChange={handleStartChange}
        />
      </div>
      <div className='timerange__input'>
        <label htmlFor='yearend'>Year End</label>
        <input
          id='yearend'
          type='text'
          value={end}
          onChange={handleEndChange}
        />
      </div>
    </div>
  );
};

export default TimeRange;

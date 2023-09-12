import { useState } from 'react';

function TimeSlider({ onValueChange }) {
  const [value, setValue] = useState(0);

  const handleChange = (e) => {
    setValue(e.target.value);
    onValueChange(e.target.value);
  };

  return (
    <div className='timeslider'>
      <div className='timeslider__labels'>
        <label>Time</label>
        {value}
        <button
          onClick={() => {
            setValue(0.39587);
            onValueChange(0.39587);
          }}
        >
          Test
        </button>
      </div>
      <input
        type='range'
        min='0'
        max='1'
        step='0.000001'
        value={value}
        onChange={handleChange}
        id='timeslider-input'
      />
    </div>
  );
}

export default TimeSlider;

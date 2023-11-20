import { useEffect } from 'react';

function VariableSlider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  name,
  disabled,
}) {
  const handleRangeChange = (e) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className='variable-slider'>
      <label htmlFor={name}>{label}</label>
      <span>
        <input
          className='variable-slider__range'
          style={{
            background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${
              (value / max) * 100
            }%, var(--buttonHover) ${
              (value / max) * 100
            }%, var(--buttonHover) 100%)`,
          }}
          type='range'
          name={name}
          id={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          disabled={disabled}
        />
        <input
          className='variable-slider__text'
          type='text'
          value={value}
          disabled
        />
      </span>
    </div>
  );
}

export default VariableSlider;

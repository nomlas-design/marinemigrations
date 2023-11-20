import { ReactComponent as Logo } from './assets/logos/logo.svg';
import { useState, useEffect } from 'react';
import VariableSlider from './VariableSlider';
import TimeRange from './TimeRange';

const Sidebar = ({ onValuesChange }) => {
  const [sliderValues, setSliderValues] = useState({
    curvePoints: 2500,
    particleSpeed: 0.5,
    progressSpeed: 20,
    timeStart: 250000000,
    timeEnd: 0,
  });

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(sliderValues);
    }
  }, [sliderValues, onValuesChange]);

  const handleSliderChange = (name, value) => {
    setSliderValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleTimeChange = (start, end) => {
    handleSliderChange('timeStart', Number(start));
    handleSliderChange('timeEnd', Number(end));
  };

  return (
    <div className='sidebar'>
      <div className='sidebar__head'>
        <div className='sidebar__logo'>
          <Logo />
        </div>
      </div>
      <div className='sidebar__body'>
        <div className='sidebar__section'>
          <TimeRange
            start={sliderValues.timeStart}
            end={sliderValues.timeEnd}
            onChange={handleTimeChange}
          />
          <VariableSlider
            label='Curve Points'
            name='curvePoints'
            min={1}
            max={5000}
            value={sliderValues.curvePoints}
            step={1}
            onChange={(value) => handleSliderChange('curvePoints', value)}
          />
          <VariableSlider
            label='Progress Speed'
            name='progressSpeed'
            min={1}
            max={60}
            value={sliderValues.progressSpeed}
            step={1}
            onChange={(value) => handleSliderChange('progressSpeed', value)}
          />
          <VariableSlider
            label='Particle Speed'
            name='particleSpeed'
            min={0.01}
            max={5}
            value={sliderValues.particleSpeed}
            step={0.01}
            onChange={(value) => handleSliderChange('particleSpeed', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

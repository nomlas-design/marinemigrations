import { useRef, useState, useEffect } from 'react';
import { ReactComponent as PlayIcon } from './assets/icons/icon_play.svg';

const RadioSwitch = ({
  name,
  segments,
  callback,
  defaultIndex = 0,
  controlRef,
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const componentReady = useRef();

  useEffect(() => {
    const activeSegmentRef = segments[activeIndex].ref;
    const { offsetWidth, offsetLeft } = activeSegmentRef.current;
    const { style } = controlRef.current;

    style.setProperty('--highlight-width', `${offsetWidth}px`);
    style.setProperty('--highlight-x-pos', `${offsetLeft}px`);
  }, [activeIndex, callback, segments]);

  useEffect(() => {
    componentReady.current = true;
  }, []);

  const onInputChange = (value, index) => {
    setActiveIndex(index);
    callback(value, index);
  };

  return (
    <div className='radioswitch' ref={controlRef}>
      <div
        className={`radioswitch__controls ${
          componentReady.current ? 'ready' : 'idle'
        }`}
      >
        {segments.map((item, i) => (
          <div
            key={item.value}
            className={`switch ${i === activeIndex ? 'active' : 'inactive'}`}
            ref={item.ref}
          >
            <input
              type='radio'
              value={item.value}
              id={item.label}
              name={name}
              onChange={() => onInputChange(item.value, i)}
              checked={i === activeIndex}
            />
            <label htmlFor={item.label}>
              {item.icon}
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioSwitch;

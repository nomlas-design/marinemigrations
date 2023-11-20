import { useState, useRef, useEffect, useCallback } from 'react';
import { displayTime, currentTime } from './lib/displayTime';
import { ReactComponent as PlayIcon } from './assets/icons/icon_play.svg';
import { ReactComponent as PauseIcon } from './assets/icons/icon_pause.svg';
import { ReactComponent as ReplayIcon } from './assets/icons/icon_replay.svg';

function useAnimationFrame(callback) {
  const requestRef = useRef();
  const lastTimeRef = useRef();

  const animate = useCallback(
    (time) => {
      if (lastTimeRef.current != null) {
        const deltaTime = (time - lastTimeRef.current) / 1000;
        callback(deltaTime);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
}

function CanvasControls({
  onProgressChange,
  progressRef,
  progressSpeed,
  timeStart,
  timeEnd,
}) {
  const [time, setTime] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(
    displayTime(timeStart, timeEnd, time)
  );
  const timeRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [percentage, setPercentage] = useState(0);

  const tooltipRef = useRef(null);

  useEffect(() => {
    setDisplayedTime(displayTime(timeStart, timeEnd, time));
    console.log(tooltipContent);
  }, [timeStart, timeEnd, time]);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.target.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      setPercentage(percentage);
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 20,
      });
      console.log(percentage, timeStart, timeEnd, time);
      setTooltipContent(
        ((timeStart - timeEnd) * (1 - percentage) + timeEnd)
          .toLocaleString('en-US')
          .split('.')[0] + ' BC'
      );
    },
    [timeStart, timeEnd]
  );

  useEffect(() => {
    const inputElement = document.querySelector('.controls__range__input');
    inputElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      inputElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    timeRef.current = progressRef.current;
  }, [progressRef]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--progressValue',
      time * 100 + '%'
    );
  }, [time]);

  const handleMouseEnter = () => setTooltipVisible(true);
  const handleMouseLeave = () => setTooltipVisible(false);

  const throttledUpdateTime = useCallback(
    (newTime) => {
      onProgressChange(newTime);
      if (Math.abs(newTime - time) > 0.0001) {
        setTime(newTime);
      }
    },
    [time, onProgressChange]
  );

  const handleChange = (e) => {
    throttledUpdateTime(Number(e.target.value));
    timeRef.current = Number(e.target.value);
  };

  const handlePlayerChange = () => {
    if (time >= 1) {
      throttledUpdateTime(0);
      timeRef.current = 0;
    } else {
      setIsAnimating(!isAnimating);
    }
  };

  const handleResetChange = () => {
    throttledUpdateTime(0);
    timeRef.current = 0;
  };

  useAnimationFrame((deltaTime) => {
    if (isAnimating) {
      const newTime = Math.min(
        timeRef.current + (deltaTime * progressSpeed) / 1000,
        1
      );
      timeRef.current = newTime; // Update ref immediately
      throttledUpdateTime(newTime); // Update state in a throttled manner

      if (newTime >= 1) {
        setIsAnimating(false);
      }
    }
  });

  return (
    <div className='controls'>
      <div className='controls__range'>
        <input
          type='range'
          min='0'
          max='1'
          step='0.001'
          value={time}
          onChange={handleChange}
          className='controls__range__input'
          data-tooltip={displayedTime}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {tooltipVisible && percentage >= 0 && percentage <= 1 && (
          <div
            ref={tooltipRef}
            className='tooltip'
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${-34}px`,
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
      <div className='controls__row'>
        <div className='controls__row__item'>
          {time < 1 && (
            <button className='btn btn--controls' onClick={handlePlayerChange}>
              {isAnimating ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
          {time > 0 && (
            <button className='btn btn--controls' onClick={handleResetChange}>
              <ReplayIcon />
            </button>
          )}
        </div>
        {displayedTime + ' BC'}
      </div>
    </div>
  );
}

export default CanvasControls;

import useLocalStorage from 'use-local-storage';
import { useState, useCallback, useRef } from 'react';
import RadioSwitch from './RadioSwitch';
import CanvasControls from './CanvasControls';
import InstancedCanvas from './InstancedCanvas';
import Sidebar from './Sidebar';

import { ReactComponent as FlatIcon } from './assets/icons/icon_flat.svg';
import { ReactComponent as GlobeIcon } from './assets/icons/icon_globe.svg';

function App() {
  const [sidebarValues, setSidebarValues] = useState({
    curvePoints: 2500,
    particleSpeed: 10,
    progressSpeed: 20,
    timeStart: 250000000,
    timeEnd: 0,
  });

  const progressRef = useRef(0);
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage(
    'theme',
    defaultDark ? 'dark' : 'light'
  );

  const handleProgressChange = useCallback((value) => {
    progressRef.current = value;
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSidebarValuesChange = (newValues) => {
    setSidebarValues(newValues);
  };

  return (
    <div className='app' data-theme={theme}>
      <main className='main'>
        <Sidebar onValuesChange={handleSidebarValuesChange} />
        <div className='canvas_wrap'>
          <InstancedCanvas
            progressRef={progressRef}
            sidebarUniforms={sidebarValues}
          />
          <CanvasControls
            onProgressChange={handleProgressChange}
            progressRef={progressRef}
            progressSpeed={sidebarValues.progressSpeed}
            timeStart={sidebarValues.timeStart}
            timeEnd={sidebarValues.timeEnd}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

import useLocalStorage from 'use-local-storage';
import { useState } from 'react';
import Layout from './Layout';
import TimeSlider from './TimeSlider';
import InstancedCanvas from './InstancedCanvas';

function App() {
  const [time, setTime] = useState(0);
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage(
    'theme',
    defaultDark ? 'dark' : 'light'
  );

  const handleTimeChange = (value) => {
    setTime(value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className='app' data-theme={theme}>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <InstancedCanvas time={time} />
        <TimeSlider onValueChange={handleTimeChange} />
      </Layout>
    </div>
  );
}

export default App;

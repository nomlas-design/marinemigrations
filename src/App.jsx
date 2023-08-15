import useLocalStorage from 'use-local-storage';
import { useState } from 'react';
import Layout from './Layout';
import MainCanvas from './MainCanvas';

function App() {
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage(
    'theme',
    defaultDark ? 'dark' : 'light'
  );

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className='app' data-theme={theme}>
      <Layout toggleTheme={toggleTheme}>
        <MainCanvas />
      </Layout>
    </div>
  );
}

export default App;

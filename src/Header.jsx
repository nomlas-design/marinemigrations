import { ReactComponent as DarkIcon } from './assets/icons/dark.svg';
import { ReactComponent as LightIcon } from './assets/icons/light.svg';

function Header({ theme, toggleTheme }) {
  return (
    <header>
      <div>
        <h1>MarineMigrations</h1>
        <span>v0.0.3</span>
      </div>
      <button onClick={toggleTheme} type='button'>
        {theme === 'light' ? <DarkIcon /> : <LightIcon />}
      </button>
    </header>
  );
}

export default Header;

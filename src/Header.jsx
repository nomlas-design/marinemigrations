function Header({ toggleTheme }) {
  return (
    <header>
      <h1>MarineMigrations</h1>
      <button onClick={toggleTheme} type='button'>
        Toggle Theme
      </button>
    </header>
  );
}

export default Header;

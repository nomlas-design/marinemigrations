import Header from './Header';
import Footer from './Footer';

function Layout({ children, theme, toggleTheme }) {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className='Layout__main'>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;

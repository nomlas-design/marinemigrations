import Header from './Header';
import Footer from './Footer';

function Layout({ children, toggleTheme }) {
  return (
    <>
      <Header toggleTheme={toggleTheme} />
      <main className='Layout__main'>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;

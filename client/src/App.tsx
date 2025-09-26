
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import SignUp from './pages/SignUpPage';
import SignIn from './pages/SignInPage';
import Navbar from './components/layout/Navbar';
import { JSX, useEffect, useState } from 'react';
import Design from './pages/Design';
import Project from './pages/Project';

function App(): JSX.Element {
  const location = useLocation();
  const [shouldRenderNav, setShouldRenderNav] = useState<boolean>(false);

  useEffect(() => {
    const routesNotIncludeNavbar = ['/sign-in', '/sign-up', '/designs', '/projects'];
    if (routesNotIncludeNavbar.some((route) => location.pathname.includes(route))) {
      setShouldRenderNav(false);
    } else {
      setShouldRenderNav(true);
    }
  }, [location.pathname]);

  return (
    <main>
      {shouldRenderNav && <Navbar />}
      <Toaster duration={1500} position="bottom-right" richColors theme='light' />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/designs/:id" element={<Design />} />
        <Route path="/projects/:id" element={<Project />} />
      </Routes>
    </main>
  );
}

export default App;
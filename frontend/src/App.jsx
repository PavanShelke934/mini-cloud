import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Home from './pages/Home';
import Files from './pages/Files';
import PublicShare from './pages/PublicShare';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

// A component to handle root level redirects and OAuth token parsing
const RootHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RootHandler checking URL:', location.search);
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      console.log('Found token in URL, storing in localStorage');
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      toast.success('Logged in with Google successfully!');
      // After storing, redirect to home and clear the URL parameters
      navigate('/home', { replace: true });
    } else {
      // If no token, just normal redirect
      navigate('/home', { replace: true });
    }
  }, [location, navigate]);

  // Render nothing, it just redirects
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ToastContainer theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/share/:token" element={<PublicShare />} />
          
          <Route path="/home" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          
          <Route path="/files" element={
            <PrivateRoute>
              <Files />
            </PrivateRoute>
          } />

          {/* Root route handles token extraction */}
          <Route path="/" element={<RootHandler />} />
          
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

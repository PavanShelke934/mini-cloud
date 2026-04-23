import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Home from './pages/Home';
import Files from './pages/Files';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ToastContainer theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

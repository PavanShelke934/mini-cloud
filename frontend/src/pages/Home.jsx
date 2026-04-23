import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Home as HomeIcon, Folder, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import FileList from '../components/FileList';
import api from '../utils/api';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecentFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/files');
      setFiles(response.data.slice(0, 5)); // Last 5 files
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load recent files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <Cloud size={28} />
          <span>Aura Cloud</span>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <a className="nav-item active" onClick={() => navigate('/home')}>
                <HomeIcon size={20} />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a className="nav-item" onClick={() => navigate('/files')}>
                <Folder size={20} />
                <span>Files</span>
              </a>
            </li>
            <li style={{ marginTop: 'auto' }}>
              <a className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                <LogOut size={20} />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1 className="title-lg">Dashboard</h1>
          <p className="subtitle">Welcome to your secure digital archive</p>
        </header>

        <section>
          <UploadArea onUploadSuccess={fetchRecentFiles} />
        </section>

        <section>
          <h2 className="title-lg" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Recent Uploads
          </h2>
          
          {error && <div className="notification error">{error}</div>}
          
          {loading ? (
            <p className="subtitle">Loading...</p>
          ) : (
            <FileList files={files} onFileDeleted={fetchRecentFiles} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;

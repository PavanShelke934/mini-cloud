import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Home, Folder, Cloud } from 'lucide-react';
import UploadArea from './UploadArea';
import FileList from './FileList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load your archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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
              <a 
                className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                <Home size={20} />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Folder size={20} />
                <span>Files</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1 className="title-lg">The Atelier</h1>
          <p className="subtitle">Your secure digital archive</p>
        </header>

        <section>
          <UploadArea onUploadSuccess={fetchFiles} />
        </section>

        <section>
          <h2 className="title-lg" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Recent Curator Items
          </h2>
          
          {error && <div className="notification error">{error}</div>}
          
          {loading ? (
            <p className="subtitle">Loading your gallery...</p>
          ) : (
            <FileList files={files} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

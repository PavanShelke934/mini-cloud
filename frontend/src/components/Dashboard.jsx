import React, { useState, useEffect, useCallback } from 'react';
import { Home, Folder, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadArea from './UploadArea';
import FileList from './FileList';
import Analytics from './Analytics';
import api from '../utils/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/files');
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
        <header className="mb-6">
          <h1 className="title-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Aura Dashboard
          </h1>
          <p className="subtitle">Secure, fast, and elegant cloud storage.</p>
        </header>

        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Analytics files={files} />
            <section className="mt-8">
              <UploadArea onUploadSuccess={fetchFiles} />
            </section>
          </motion.div>
        )}

        {activeTab === 'files' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-6">
              <UploadArea onUploadSuccess={fetchFiles} />
            </section>

            <section>
              {error && <div className="notification error">{error}</div>}
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <FileList files={files} onFileDeleted={fetchFiles} />
              )}
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

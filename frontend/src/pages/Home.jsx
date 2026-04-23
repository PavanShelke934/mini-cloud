import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Home as HomeIcon, Folder, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import FileList from '../components/FileList';
import Layout from '../components/Layout';
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
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to your secure digital archive</p>
      </header>

      <section>
        <UploadArea onUploadSuccess={fetchRecentFiles} />
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Uploads
        </h2>
        
        {error && <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>}
        
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          <FileList files={files} onFileDeleted={fetchRecentFiles} />
        )}
      </section>
    </Layout>
  );
};

export default Home;

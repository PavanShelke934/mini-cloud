import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Cloud, Download, File, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const PublicShare = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileMetadata = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/public/${token}`);
        setFile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load file information.');
      } finally {
        setLoading(false);
      }
    };

    fetchFileMetadata();
  }, [token]);

  const handleDownload = () => {
    window.location.href = `http://localhost:5000/api/public/${token}?download=true`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'spin 1s linear infinite' }}><Cloud size={48} color="var(--primary)" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <AlertCircle size={64} color="var(--error)" style={{ marginBottom: '1rem' }} />
        <h2 className="title-lg" style={{ color: 'var(--error)' }}>Oops!</h2>
        <p className="subtitle">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl w-full max-w-md shadow-xl text-center border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <Cloud size={48} className="text-blue-600 dark:text-blue-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shared File</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Someone shared a file with you via Aura Cloud.</p>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center mb-8 transition-colors duration-300">
          <File size={40} className="text-gray-700 dark:text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 break-all mb-2">
            {file.originalName}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {formatBytes(file.size)}
          </p>
        </div>

        <button 
          onClick={handleDownload} 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold transition-colors duration-300"
        >
          <Download size={20} /> Download File
        </button>
      </div>
    </div>
  );
};

export default PublicShare;

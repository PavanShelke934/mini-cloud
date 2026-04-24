import React, { useState, useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const PreviewModal = ({ isOpen, onClose, file }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    } else {
      setContent(null);
      setError(null);
    }
    
    return () => {
      if (content && typeof content === 'string' && content.startsWith('blob:')) {
        URL.revokeObjectURL(content);
      }
    };
  }, [isOpen, file]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the decrypted content from the backend
      const response = await api.get(`/files/download/${file._id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      
      if (file.mimeType.startsWith('text/')) {
        const text = await blob.text();
        setContent(text);
      } else {
        setContent(url);
      }
    } catch (err) {
      console.error('Failed to load preview', err);
      setError('Could not load file preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (content && typeof content === 'string' && content.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = content;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } else {
       // fallback if text
       const blob = new Blob([content], { type: file.mimeType });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', file.originalName);
       document.body.appendChild(link);
       link.click();
       link.parentNode.removeChild(link);
       URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;
    if (!content) return null;

    if (file.mimeType.startsWith('image/')) {
      return <img src={content} alt={file.originalName} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg" />;
    } else if (file.mimeType.startsWith('text/')) {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[70vh] border border-gray-200 dark:border-gray-700">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content}</pre>
        </div>
      );
    } else if (file.mimeType === 'application/pdf') {
      return <iframe src={content} className="w-full h-[70vh] rounded-lg border-0" title={file.originalName} />;
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <FileText size={64} className="text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">No preview available for this file type.</p>
          <button onClick={handleDownload} className="btn-primary">Download to view</button>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && file && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 truncate">
                <FileText className="text-blue-500" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{file.originalName}</h3>
                {file.isEncrypted !== false && <span title="End-to-End Encrypted">🔒</span>}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;

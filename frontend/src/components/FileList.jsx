import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, Share2, Copy, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const FileList = ({ files, onFileDeleted }) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [shareModal, setShareModal] = useState({ isOpen: false, file: null, token: null });

  if (!files || files.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 mt-4">No files found. Upload some assets to get started.</p>;
  }

  const handleDownload = async (fileId, fileName) => {
    try {
      setDownloadingId(fileId);
      const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error', err);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      toast.success('File deleted successfully');
      if (onFileDeleted) onFileDeleted();
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete file');
    }
  };

  const handleView = async (fileId, mimeType, fileName) => {
    if (mimeType.startsWith('image/')) {
      try {
        const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const newWindow = window.open();
        newWindow.document.write(`<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;height:100vh;"><img src="${url}" style="max-width:100%;max-height:100%;" /></body>`);
      } catch (err) {
        toast.error('Failed to preview image');
      }
    } else {
      toast.info(`Cannot preview ${fileName}. Please download to view.`);
      toast.info(`Cannot preview ${fileName}. Please download to view.`);
    }
  };

  const handleShare = async (file) => {
    try {
      const response = await api.post(`/files/${file._id}/share`);
      setShareModal({ isOpen: true, file, token: response.data.shareToken });
    } catch (err) {
      console.error('Share error', err);
      toast.error('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${shareModal.token}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {files.map((file) => (
        <div key={file._id} className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs">{file.originalName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-2">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.uploadDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" 
              onClick={() => handleView(file._id, file.mimeType, file.originalName)}
              title="View"
            >
              <Eye size={20} />
            </button>
            <button 
              className={`p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 ${downloadingId === file._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleDownload(file._id, file.originalName)}
              title="Download"
              disabled={downloadingId === file._id}
            >
              <Download size={20} />
            </button>
            <button 
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
              onClick={() => handleShare(file)}
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button 
              className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300" 
              onClick={() => handleDelete(file._id)}
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}

      {shareModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-[90%] max-w-md relative shadow-2xl border border-gray-100 dark:border-gray-700">
            <button onClick={() => setShareModal({ isOpen: false, file: null, token: null })} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Share File</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Anyone with this link can view and download <strong className="text-gray-700 dark:text-gray-300">{shareModal.file.originalName}</strong>.</p>
            
            <div className="flex items-center bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/share/${shareModal.token}`} 
                className="flex-1 bg-transparent border-none text-gray-900 dark:text-gray-100 outline-none px-2"
              />
              <button onClick={copyShareLink} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 ml-2">
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;

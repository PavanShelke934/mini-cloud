import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
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

  if (!files || files.length === 0) {
    return <p className="subtitle" style={{ marginTop: '1rem' }}>No files found. Upload some assets to get started.</p>;
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
    }
  };

  return (
    <div className="file-list-container">
      {files.map((file) => (
        <div key={file._id} className="file-item">
          <div className="file-info">
            <FileText className="file-icon" size={24} />
            <div>
              <div className="file-name">{file.originalName}</div>
              <div className="file-meta">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.uploadDate)}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-icon" 
              onClick={() => handleView(file._id, file.mimeType, file.originalName)}
              title="View"
            >
              <Eye size={20} />
            </button>
            <button 
              className="btn-icon" 
              onClick={() => handleDownload(file._id, file.originalName)}
              title="Download"
              disabled={downloadingId === file._id}
              style={{ opacity: downloadingId === file._id ? 0.5 : 1 }}
            >
              <Download size={20} />
            </button>
            <button 
              className="btn-icon" 
              onClick={() => handleDelete(file._id)}
              title="Delete"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;

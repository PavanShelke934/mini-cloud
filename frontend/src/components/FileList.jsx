import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, Share2, Copy, X, LayoutGrid, List, MoreVertical, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PreviewModal from './PreviewModal';
import { motion } from 'framer-motion';

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
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeMenu, setActiveMenu] = useState(null);

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-200 border-dashed dark:border-gray-700">
        <FileText size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No files found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload some assets to get started.</p>
      </div>
    );
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
      setActiveMenu(null);
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
    } finally {
      setActiveMenu(null);
    }
  };

  const handleShare = async (file) => {
    try {
      const response = await api.post(`/files/${file._id}/share`);
      setShareModal({ isOpen: true, file, token: response.data.shareToken });
    } catch (err) {
      console.error('Share error', err);
      toast.error('Failed to generate share link');
    } finally {
      setActiveMenu(null);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${shareModal.token}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Files</h2>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={file._id} 
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => setPreviewFile(file)}
                >
                  <FileText className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === file._id ? null : file._id)}
                    className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenu === file._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                      <button onClick={() => { setPreviewFile(file); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Eye size={16}/> Preview</button>
                      <button onClick={() => handleDownload(file._id, file.originalName)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Download size={16}/> Download</button>
                      <button onClick={() => handleShare(file)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Share2 size={16}/> Share</button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button onClick={() => handleDelete(file._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={16}/> Delete</button>
                    </div>
                  )}
                </div>
              </div>
              
              <div 
                className="cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  {file.isEncrypted !== false && <Lock size={14} className="text-gray-400 flex-shrink-0" title="Encrypted" />}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(file.uploadDate)}</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Modified</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {files.map((file) => (
                <tr key={file._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPreviewFile(file)}>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{file.originalName}</span>
                        {file.isEncrypted !== false && <Lock size={14} className="text-gray-400" title="Encrypted" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(file.uploadDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(file.size)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewFile(file)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Eye size={18} /></button>
                      <button onClick={() => handleDownload(file._id, file.originalName)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Download size={18} /></button>
                      <button onClick={() => handleShare(file)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Share2 size={18} /></button>
                      <button onClick={() => handleDelete(file._id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PreviewModal 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        file={previewFile} 
      />

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

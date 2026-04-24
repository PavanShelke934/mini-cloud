import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, CheckCircle, AlertCircle, Lock, Unlock } from 'lucide-react';
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

const UploadArea = ({ onUploadSuccess, currentFolderId = null }) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isEncrypted, setIsEncrypted] = useState(true);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const newUploads = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' // uploading, success, error
    }));

    setUploadingFiles(prev => [...newUploads, ...prev]);

    for (const uploadItem of newUploads) {
      const formData = new FormData();
      formData.append('files', uploadItem.file);
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      formData.append('isEncrypted', isEncrypted);

      try {
        await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev => prev.map(f => 
              f.id === uploadItem.id ? { ...f, progress: percentCompleted } : f
            ));
          }
        });

        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadItem.id ? { ...f, status: 'success' } : f
        ));
        toast.success(`Uploaded ${uploadItem.file.name}`);
        if (onUploadSuccess) onUploadSuccess();
      } catch (error) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadItem.id ? { ...f, status: 'error' } : f
        ));
        toast.error(`Failed to upload ${uploadItem.file.name}`);
      }
    }
  }, [onUploadSuccess, currentFolderId, isEncrypted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  return (
    <div className="mb-8">
      <div 
        {...getRootProps()} 
        className={`upload-zone flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={48} className={`mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">or click to browse from your computer</p>
        
        {/* Encryption Toggle inside upload area to keep it localized */}
        <div 
          className="mt-4 flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 p-2 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEncrypted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEncrypted ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {isEncrypted ? <Lock size={16} className="text-blue-600 dark:text-blue-400" /> : <Unlock size={16} className="text-gray-500" />}
            <span>Encrypt before upload</span>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <h4 className="text-gray-800 dark:text-gray-200 font-medium">Transfers</h4>
          {uploadingFiles.map(fileObj => (
            <div key={fileObj.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
              <File size={24} className="text-gray-400 dark:text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                    {fileObj.file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {fileObj.status === 'uploading' ? `${fileObj.progress}%` : fileObj.status === 'success' ? 'Complete' : 'Failed'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${fileObj.status === 'error' ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                    style={{ width: `${fileObj.progress}%` }}
                  ></div>
                </div>
              </div>
              <div>
                {fileObj.status === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {fileObj.status === 'error' && <AlertCircle size={20} className="text-red-500" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadArea;

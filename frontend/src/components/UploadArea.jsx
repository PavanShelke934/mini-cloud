import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const UploadArea = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0]; // Upload one by one for now
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      setUploading(false);
      setProgress(100);
      toast.success('File uploaded successfully!');
      onUploadSuccess();
      
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
      setError('Upload failed. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="upload-container">
      <div 
        {...getRootProps()} 
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="upload-icon" />
        <div>
          <h3 className="title-lg" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            Drop new assets
          </h3>
          <p className="subtitle">
            {isDragActive ? "Drop the files here..." : "Tap to browse or drop files into your gallery"}
          </p>
        </div>
      </div>

      {error && <div className="notification error" style={{ marginTop: '1rem' }}>{error}</div>}

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;

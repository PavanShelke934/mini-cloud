import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HardDrive, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3d89ff', '#10b981', '#f59e0b', '#8b5cf6'];

const Analytics = ({ files }) => {
  // Calculate total storage used
  const totalStorage = files.reduce((acc, file) => acc + file.size, 0);
  const totalStorageGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);
  const maxStorageGB = 15; // Assuming 15GB max
  const storagePercentage = Math.min((totalStorageGB / maxStorageGB) * 100, 100);

  // Group files by type
  const fileTypes = files.reduce((acc, file) => {
    let type = 'Others';
    if (file.mimeType.startsWith('image/')) type = 'Images';
    else if (file.mimeType === 'application/pdf') type = 'PDFs';
    else if (file.mimeType.startsWith('video/')) type = 'Videos';
    
    if (!acc[type]) acc[type] = 0;
    acc[type] += 1;
    return acc;
  }, {});

  const data = Object.keys(fileTypes).map(key => ({ name: key, value: fileTypes[key] }));

  // Recent Activity (last 3 files uploaded)
  const recentFiles = [...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 3);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Top Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Storage Used</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatBytes(totalStorage)}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <HardDrive className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{totalStorageGB} GB of {maxStorageGB} GB</p>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Files</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{files.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <FileText className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Last Upload</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
                {recentFiles.length > 0 ? recentFiles[0].originalName : 'None'}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <Upload className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
          </div>
          {recentFiles.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {new Date(recentFiles[0].uploadDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </motion.div>

      {/* Charts & Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="col-span-1 md:col-span-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm flex flex-col items-center"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 self-start">File Types</h3>
        {data.length > 0 ? (
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
              {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p>No files yet</p>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="col-span-1 md:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentFiles.length > 0 ? recentFiles.map((file, i) => (
            <div key={file._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
              <div className={`p-2 rounded-full ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                <Upload size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Uploaded {file.originalName}</p>
                <p className="text-xs text-gray-500">{new Date(file.uploadDate).toLocaleString()}</p>
              </div>
            </div>
          )) : (
             <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;

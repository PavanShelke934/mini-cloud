import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Home as HomeIcon, Folder, LogOut, Search, Filter, Plus, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileList from '../components/FileList';
import UploadArea from '../components/UploadArea';
import Layout from '../components/Layout';
import api from '../utils/api';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [folderPath, setFolderPath] = useState([]); // Array of { id, name }
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('date_desc');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Folders
      const folderRes = await api.get('/folders', {
        params: { parentFolder: currentFolder ? currentFolder.id : '' }
      });
      setFolders(folderRes.data);

      // Fetch Files
      const fileRes = await api.get('/files', {
        params: { 
          folderId: currentFolder ? currentFolder.id : 'root',
          search,
          type: typeFilter,
          sort: sortFilter
        }
      });
      setFiles(fileRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Failed to load files and folders.');
    } finally {
      setLoading(false);
    }
  }, [currentFolder, search, typeFilter, sortFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', {
        name: newFolderName,
        parentFolder: currentFolder ? currentFolder.id : null
      });
      setNewFolderName('');
      setNewFolderModal(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError('Failed to create folder');
    }
  };

  const openFolder = (folder) => {
    setCurrentFolder({ id: folder._id, name: folder.name });
    setFolderPath([...folderPath, { id: folder._id, name: folder.name }]);
  };

  const navigateToFolder = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      const selected = folderPath[index];
      setCurrentFolder(selected);
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Files</h1>
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className={`cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors ${currentFolder === null ? 'font-semibold text-gray-900 dark:text-gray-200' : ''}`} onClick={() => navigateToFolder(-1)}>Root</span>
              {folderPath.map((f, i) => (
                <React.Fragment key={f.id}>
                  <ChevronRight size={16} />
                  <span 
                    className={`cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors ${i === folderPath.length - 1 ? 'font-semibold text-gray-900 dark:text-gray-200' : ''}`}
                    onClick={() => navigateToFolder(i)}
                  >
                    {f.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 w-32 md:w-48"
              />
            </div>

            <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <Filter size={18} className="text-gray-400 mr-2" />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 cursor-pointer">
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <button onClick={() => setNewFolderModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm">
              <Plus size={18} /> New Folder
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <UploadArea onUploadSuccess={fetchItems} currentFolderId={currentFolder ? currentFolder.id : null} />

          {error && <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>}
          
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : (
            <>
              {folders.length > 0 && !search && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Folders</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folders.map(folder => (
                      <div 
                        key={folder._id} 
                        onClick={() => openFolder(folder)}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 group"
                      >
                        <Folder size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Files</h3>
                <FileList files={files} onFileDeleted={fetchItems} />
              </div>
            </>
          )}
        </section>

        {newFolderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-[90%] max-w-md relative shadow-2xl border border-gray-100 dark:border-gray-700">
              <button onClick={() => setNewFolderModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Folder</h3>
              <input 
                type="text" 
                placeholder="Folder name" 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleCreateFolder} className="w-full flex justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                Create Folder
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Files;

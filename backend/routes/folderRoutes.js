const express = require('express');
const Folder = require('../models/Folder');
const File = require('../models/File');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/folders - Create folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentFolder } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = new Folder({
      name,
      userId: req.user.id,
      parentFolder: parentFolder || null
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// GET /api/folders - List folders
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolder } = req.query;
    
    const query = { userId: req.user.id };
    if (parentFolder) {
      query.parentFolder = parentFolder;
    } else {
      query.parentFolder = null; // Default to root
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.status(200).json(folders);
  } catch (error) {
    console.error('Folder fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

module.exports = router;

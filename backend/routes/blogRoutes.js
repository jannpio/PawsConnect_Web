const express = require('express');
const Blog = require('../models/Blog');  // Import Blog model
const router = express.Router();

// POST route to create a blog
router.post('/api/blog', async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and Content are required.' });
    }

    const newBlog = new Blog({ title, content, tags });
    await newBlog.save();

    res.status(201).json(newBlog); // Send the created blog back to frontend
  } catch (err) {
    console.error('Error posting blog:', err);
    res.status(500).json({ error: 'Failed to post blog' });
  }
});

// GET route to fetch all blogs
router.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch all blogs
    res.json(blogs); // Send the list of blogs to frontend
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

module.exports = router;

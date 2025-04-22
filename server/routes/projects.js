const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

// @route   GET api/projects
// @desc    Get all projects for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find projects where user is owner or collaborator
    const projects = await Project.find({
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is owner or collaborator
    const isOwner = project.user.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );
    
    if (!isOwner && !isCollaborator && !project.isPublic) {
      return res.status(401).json({ msg: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('baseUrl', 'Base URL is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, baseUrl, environment, isPublic } = req.body;

      // Create new project
      const newProject = new Project({
        name,
        description,
        baseUrl,
        environment: environment || 'development',
        isPublic: isPublic || false,
        user: req.user.id
      });

      const project = await newProject.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is owner
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this project' });
    }

    const { name, description, baseUrl, environment, isPublic } = req.body;

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (baseUrl) project.baseUrl = baseUrl;
    if (environment) project.environment = environment;
    if (isPublic !== undefined) project.isPublic = isPublic;
    
    project.updatedAt = Date.now();

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is owner
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this project' });
    }

    await project.remove();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/projects/:id/collaborators
// @desc    Add collaborator to project
// @access  Private
router.post(
  '/:id/collaborators',
  [
    auth,
    [
      check('email', 'Email is required').isEmail(),
      check('role', 'Role is required').isIn(['viewer', 'editor', 'admin'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ msg: 'Project not found' });
      }

      // Check if user is owner
      if (project.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to add collaborators' });
      }

      const { email, role } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user is already a collaborator
      if (project.collaborators.some(collab => collab.user.toString() === user.id)) {
        return res.status(400).json({ msg: 'User is already a collaborator' });
      }

      // Add collaborator
      project.collaborators.push({ user: user.id, role });
      project.updatedAt = Date.now();

      await project.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Project not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 
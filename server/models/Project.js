const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  baseUrl: {
    type: String,
    required: true
  },
  environment: {
    type: String,
    enum: ['development', 'testing', 'production'],
    default: 'development'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['viewer', 'editor', 'admin'],
        default: 'viewer'
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema); 
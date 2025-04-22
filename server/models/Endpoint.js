const mongoose = require('mongoose');

const EndpointSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  path: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    required: true
  },
  headers: [
    {
      key: String,
      value: String,
      description: String
    }
  ],
  queryParams: [
    {
      key: String,
      value: String,
      description: String
    }
  ],
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  responseSchema: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Endpoint', EndpointSchema); 
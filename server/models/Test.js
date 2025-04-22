const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  endpoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Endpoint',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  requestHeaders: [
    {
      key: String,
      value: String
    }
  ],
  requestParams: [
    {
      key: String,
      value: String
    }
  ],
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  expectedStatus: {
    type: Number
  },
  expectedResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  assertions: [
    {
      path: String,
      operator: {
        type: String,
        enum: ['equals', 'contains', 'exists', 'notExists', 'greaterThan', 'lessThan']
      },
      value: mongoose.Schema.Types.Mixed
    }
  ],
  lastRun: {
    timestamp: Date,
    status: {
      type: String,
      enum: ['passed', 'failed', 'error']
    },
    responseTime: Number,
    responseStatus: Number,
    responseBody: mongoose.Schema.Types.Mixed,
    error: String
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

module.exports = mongoose.model('Test', TestSchema); 
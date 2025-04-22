# API Forge

API Forge is a comprehensive platform for API testing, documentation, and collaboration. It helps developers design, test, and document APIs with an intuitive interface.

![API Forge Screenshot](https://via.placeholder.com/800x450?text=API+Forge+Screenshot)

## Features

- **API Testing**: Create and run tests against your APIs
- **Documentation**: Automatically generate documentation from your API definitions
- **Team Collaboration**: Share projects with team members
- **Environment Management**: Test across different environments (development, testing, production)
- **Request Builder**: Intuitive interface for building API requests
- **Response Validation**: Validate API responses with assertions
- **History Tracking**: Track changes to your APIs over time

## Technology Stack

- **Frontend**: React, Material-UI, React Query
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/api-forge.git
   cd api-forge
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/api-forge
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Docker Setup

You can also run API Forge using Docker: 

```
docker-compose up -d
```

This will start both the API server and the MongoDB database.

## Project Structure

api-forge/
├── client/ # React frontend
│ ├── public/ # Static files
│ └── src/ # React source code
│ ├── components/ # Reusable components
│ ├── context/ # React context providers
│ ├── pages/ # Page components
│ └── utils/ # Utility functions
├── server/ # Express backend
│ ├── config/ # Configuration files
│ ├── middleware/ # Express middleware
│ ├── models/ # Mongoose models
│ └── routes/ # API routes
└── .env # Environment variables


## API Documentation

API documentation is available at `/api-docs` when the server is running. This documentation is generated using Swagger and provides detailed information about all available endpoints.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://mui.com/)
- [React Query](https://react-query.tanstack.com/)
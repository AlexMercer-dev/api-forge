import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PrivateRoute from './components/routing/PrivateRoute';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import EndpointDetail from './pages/EndpointDetail';
import TestRunner from './pages/TestRunner';
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient();

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/projects" element={
                  <PrivateRoute>
                    <ProjectList />
                  </PrivateRoute>
                } />
                <Route path="/projects/:id" element={
                  <PrivateRoute>
                    <ProjectDetail />
                  </PrivateRoute>
                } />
                <Route path="/projects/:projectId/endpoints/:endpointId" element={
                  <PrivateRoute>
                    <EndpointDetail />
                  </PrivateRoute>
                } />
                <Route path="/projects/:projectId/endpoints/:endpointId/tests/:testId" element={
                  <PrivateRoute>
                    <TestRunner />
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 
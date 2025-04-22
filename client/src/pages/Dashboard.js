import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: projects, isLoading, error, refetch } = useQuery(
    'projects',
    async () => {
      if (!isAuthenticated) return [];
      const res = await axios.get('/api/projects');
      return res.data;
    },
    {
      enabled: isAuthenticated,
      staleTime: 60000
    }
  );

  const { data: stats } = useQuery(
    'stats',
    async () => {
      if (!isAuthenticated) return null;
      // In a real app, you would have an endpoint for stats
      // This is just a placeholder
      return {
        totalProjects: projects?.length || 0,
        totalEndpoints: 0,
        totalTests: 0,
        successRate: 0
      };
    },
    {
      enabled: isAuthenticated && !!projects,
      staleTime: 60000
    }
  );

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to API Forge
        </Typography>
        <Typography variant="body1" paragraph>
          The complete platform for API testing and documentation
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mx: 1 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mx: 1 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">
          Error loading projects: {error.message}
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
        >
          New Project
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Projects</Typography>
              <Typography variant="h3">{stats.totalProjects}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Endpoints</Typography>
              <Typography variant="h3">{stats.totalEndpoints}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Tests</Typography>
              <Typography variant="h3">{stats.totalTests}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Success Rate</Typography>
              <Typography variant="h3">{stats.successRate}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Projects
      </Typography>

      {projects && projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.slice(0, 4).map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || 'No description'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    Base URL: {project.baseUrl}
                  </Typography>
                  <Typography variant="body2">
                    Environment: {project.environment}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">
            You don't have any projects yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
            sx={{ mt: 2 }}
          >
            Create Your First Project
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 
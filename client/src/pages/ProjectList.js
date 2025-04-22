import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      baseUrl: '',
      environment: 'development',
      isPublic: false
    }
  });

  // Fetch projects
  const { data: projects, isLoading, refetch } = useQuery(
    'projects',
    async () => {
      const res = await axios.get('/api/projects');
      return res.data;
    },
    {
      onError: (err) => {
        setError(`Failed to load projects: ${err.message}`);
      }
    }
  );

  // Create project mutation
  const createProject = useMutation(
    (projectData) => axios.post('/api/projects', projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        handleCloseNewDialog();
        setError(null);
      },
      onError: (err) => {
        setError(`Failed to create project: ${err.response?.data?.msg || err.message}`);
      }
    }
  );

  // Delete project mutation
  const deleteProject = useMutation(
    (projectId) => axios.delete(`/api/projects/${projectId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        handleCloseDeleteDialog();
        setError(null);
      },
      onError: (err) => {
        setError(`Failed to delete project: ${err.response?.data?.msg || err.message}`);
      }
    }
  );

  const handleOpenNewDialog = () => {
    reset();
    setOpenNewDialog(true);
  };

  const handleCloseNewDialog = () => {
    setOpenNewDialog(false);
  };

  const handleOpenDeleteDialog = (project) => {
    setSelectedProject(project);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProject(null);
  };

  const onSubmitNewProject = (data) => {
    createProject.mutate(data);
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      deleteProject.mutate(selectedProject._id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {projects && projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div">
                      {project.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/projects/${project._id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(project)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
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
                  <Typography variant="body2">
                    Public: {project.isPublic ? 'Yes' : 'No'}
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
            onClick={handleOpenNewDialog}
            sx={{ mt: 2 }}
          >
            Create Your First Project
          </Button>
        </Box>
      )}

      {/* New Project Dialog */}
      <Dialog open={openNewDialog} onClose={handleCloseNewDialog}>
        <DialogTitle>Create New Project</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitNewProject)}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please fill in the details for your new API project.
            </DialogContentText>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Project name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  label="Project Name"
                  fullWidth
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="baseUrl"
              control={control}
              rules={{ required: 'Base URL is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Base URL"
                  placeholder="https://api.example.com"
                  fullWidth
                  variant="outlined"
                  error={!!errors.baseUrl}
                  helperText={errors.baseUrl?.message}
                />
              )}
            />
            <Controller
              name="environment"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="dense">
                  <InputLabel>Environment</InputLabel>
                  <Select {...field} label="Environment">
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="testing">Testing</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createProject.isLoading}
            >
              {createProject.isLoading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{selectedProject?.name}"? 
            This action cannot be undone and will delete all associated endpoints and tests.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteProject} 
            color="error" 
            variant="contained"
            disabled={deleteProject.isLoading}
          >
            {deleteProject.isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList; 
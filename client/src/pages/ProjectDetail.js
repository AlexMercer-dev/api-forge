import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openNewEndpointDialog, setOpenNewEndpointDialog] = useState(false);
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      path: '',
      method: 'GET'
    }
  });

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', id],
    async () => {
      const res = await axios.get(`/api/projects/${id}`);
      return res.data;
    },
    {
      onError: (err) => {
        setError(`Failed to load project: ${err.message}`);
      }
    }
  );

  // Fetch endpoints for this project
  const { data: endpoints, isLoading: endpointsLoading } = useQuery(
    ['endpoints', id],
    async () => {
      const res = await axios.get(`/api/endpoints?project=${id}`);
      return res.data;
    },
    {
      onError: (err) => {
        setError(`Failed to load endpoints: ${err.message}`);
      }
    }
  );

  // Create endpoint mutation
  const createEndpoint = useMutation(
    (endpointData) => axios.post('/api/endpoints', { ...endpointData, project: id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['endpoints', id]);
        handleCloseNewEndpointDialog();
        setError(null);
      },
      onError: (err) => {
        setError(`Failed to create endpoint: ${err.response?.data?.msg || err.message}`);
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenNewEndpointDialog = () => {
    reset();
    setOpenNewEndpointDialog(true);
  };

  const handleCloseNewEndpointDialog = () => {
    setOpenNewEndpointDialog(false);
  };

  const onSubmitNewEndpoint = (data) => {
    createEndpoint.mutate(data);
  };

  if (projectLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Project not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{project.name}</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Edit Project
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {project.description || 'No description'}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip label={`Environment: ${project.environment}`} />
          <Chip label={`Base URL: ${project.baseUrl}`} />
          <Chip label={project.isPublic ? 'Public' : 'Private'} color={project.isPublic ? 'success' : 'default'} />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Endpoints" />
          <Tab label="Documentation" />
          <Tab label="Settings" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">API Endpoints</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNewEndpointDialog}
            >
              Add Endpoint
            </Button>
          </Box>
          
          {endpointsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : endpoints && endpoints.length > 0 ? (
            <Grid container spacing={3}>
              {endpoints.map((endpoint) => (
                <Grid item xs={12} sm={6} md={4} key={endpoint._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div">
                          {endpoint.name}
                        </Typography>
                        <Chip 
                          label={endpoint.method} 
                          color={
                            endpoint.method === 'GET' ? 'success' :
                            endpoint.method === 'POST' ? 'info' :
                            endpoint.method === 'PUT' ? 'warning' :
                            endpoint.method === 'DELETE' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {endpoint.description || 'No description'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        Path: {endpoint.path}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<CodeIcon />}
                        onClick={() => navigate(`/projects/${id}/endpoints/${endpoint._id}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => navigate(`/projects/${id}/endpoints/${endpoint._id}/test`)}
                      >
                        Test
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No endpoints defined for this project yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewEndpointDialog}
                sx={{ mt: 2 }}
              >
                Add Your First Endpoint
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            API Documentation
          </Typography>
          <Typography variant="body1">
            Documentation features coming soon. You'll be able to generate and customize API documentation based on your endpoints and tests.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Project Settings
          </Typography>
          <Typography variant="body1">
            Additional project settings and configuration options will be available here.
          </Typography>
        </TabPanel>
      </Paper>

      {/* New Endpoint Dialog */}
      <Dialog open={openNewEndpointDialog} onClose={handleCloseNewEndpointDialog}>
        <DialogTitle>Add New Endpoint</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitNewEndpoint)}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Define a new API endpoint for your project.
            </DialogContentText>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Endpoint name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  label="Endpoint Name"
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
              name="path"
              control={control}
              rules={{ required: 'Path is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Path"
                  placeholder="/users"
                  fullWidth
                  variant="outlined"
                  error={!!errors.path}
                  helperText={errors.path?.message}
                />
              )}
            />
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="dense">
                  <InputLabel>HTTP Method</InputLabel>
                  <Select {...field} label="HTTP Method">
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
                    <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                    <MenuItem value="HEAD">HEAD</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewEndpointDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createEndpoint.isLoading}
            >
              {createEndpoint.isLoading ? <CircularProgress size={24} /> : 'Add Endpoint'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail; 
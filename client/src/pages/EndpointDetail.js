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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@monaco-editor/react';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`endpoint-tabpanel-${index}`}
      aria-labelledby={`endpoint-tab-${index}`}
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

const EndpointDetail = () => {
  const { projectId, endpointId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openNewTestDialog, setOpenNewTestDialog] = useState(false);
  const [error, setError] = useState(null);
  const [requestBody, setRequestBody] = useState('{}');
  const [responseSchema, setResponseSchema] = useState('{}');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  // Fetch endpoint details
  const { data: endpoint, isLoading: endpointLoading } = useQuery(
    ['endpoint', endpointId],
    async () => {
      const res = await axios.get(`/api/endpoints/${endpointId}`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        if (data.requestBody) {
          setRequestBody(JSON.stringify(data.requestBody, null, 2));
        }
        if (data.responseSchema) {
          setResponseSchema(JSON.stringify(data.responseSchema, null, 2));
        }
      },
      onError: (err) => {
        setError(`Failed to load endpoint: ${err.message}`);
      }
    }
  );

  // Fetch tests for this endpoint
  const { data: tests, isLoading: testsLoading } = useQuery(
    ['tests', endpointId],
    async () => {
      const res = await axios.get(`/api/tests?endpoint=${endpointId}`);
      return res.data;
    },
    {
      onError: (err) => {
        setError(`Failed to load tests: ${err.message}`);
      }
    }
  );

  // Update endpoint mutation
  const updateEndpoint = useMutation(
    (endpointData) => axios.put(`/api/endpoints/${endpointId}`, endpointData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['endpoint', endpointId]);
        setError(null);
      },
      onError: (err) => {
        setError(`Failed to update endpoint: ${err.response?.data?.msg || err.message}`);
      }
    }
  );

  // Create test mutation
  const createTest = useMutation(
    (testData) => axios.post('/api/tests', testData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tests', endpointId]);
        handleCloseNewTestDialog();
        setError(null);
      },
      onError: (err) => {
        setError(`Failed to create test: ${err.response?.data?.msg || err.message}`);
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenNewTestDialog = () => {
    reset();
    setOpenNewTestDialog(true);
  };

  const handleCloseNewTestDialog = () => {
    setOpenNewTestDialog(false);
  };

  const onSubmitNewTest = (data) => {
    createTest.mutate({
      ...data,
      endpoint: endpointId
    });
  };

  const handleSaveEndpoint = () => {
    try {
      const parsedRequestBody = requestBody ? JSON.parse(requestBody) : {};
      const parsedResponseSchema = responseSchema ? JSON.parse(responseSchema) : {};
      
      updateEndpoint.mutate({
        requestBody: parsedRequestBody,
        responseSchema: parsedResponseSchema
      });
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  if (endpointLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!endpoint) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Endpoint not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/projects/${projectId}`)}
          sx={{ mt: 2 }}
        >
          Back to Project
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Back to Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">{endpoint.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={endpoint.method} 
              color={
                endpoint.method === 'GET' ? 'success' :
                endpoint.method === 'POST' ? 'primary' :
                endpoint.method === 'PUT' ? 'warning' :
                endpoint.method === 'DELETE' ? 'error' : 'default'
              }
              sx={{ mr: 1 }}
            />
            <Typography variant="body1">{endpoint.path}</Typography>
          </Box>
          {endpoint.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {endpoint.description}
            </Typography>
          )}
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate(`/projects/${projectId}/endpoints/${endpointId}/test`)}
            sx={{ mr: 1 }}
          >
            Test Endpoint
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${projectId}/endpoints/${endpointId}/edit`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="endpoint tabs">
          <Tab label="Details" />
          <Tab label="Tests" />
          <Tab label="Documentation" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Request Body Schema
              </Typography>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                <Editor
                  height="300px"
                  language="json"
                  value={requestBody}
                  onChange={setRequestBody}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Response Schema
              </Typography>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                <Editor
                  height="300px"
                  language="json"
                  value={responseSchema}
                  onChange={setResponseSchema}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEndpoint}
                  disabled={updateEndpoint.isLoading}
                >
                  {updateEndpoint.isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Tests</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNewTestDialog}
            >
              New Test
            </Button>
          </Box>

          {testsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : tests && tests.length > 0 ? (
            <List>
              {tests.map((test) => (
                <ListItem
                  key={test._id}
                  button
                  onClick={() => navigate(`/projects/${projectId}/endpoints/${endpointId}/tests/${test._id}`)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    bgcolor: test.lastRun?.status === 'passed' ? 'success.50' : 
                             test.lastRun?.status === 'failed' ? 'error.50' : 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={test.name}
                    secondary={test.description || 'No description'}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Run Test">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${projectId}/endpoints/${endpointId}/tests/${test._id}`);
                        }}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No tests created for this endpoint yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewTestDialog}
                sx={{ mt: 2 }}
              >
                Create Your First Test
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Documentation
          </Typography>
          <Typography variant="body1">
            Documentation for this endpoint will be generated automatically based on the schema and tests.
          </Typography>
        </TabPanel>
      </Paper>

      {/* New Test Dialog */}
      <Dialog open={openNewTestDialog} onClose={handleCloseNewTestDialog}>
        <DialogTitle>Create New Test</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitNewTest)}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Create a new test case for this endpoint.
            </DialogContentText>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Test name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  label="Test Name"
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewTestDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createTest.isLoading}
            >
              {createTest.isLoading ? <CircularProgress size={24} /> : 'Create Test'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EndpointDetail; 
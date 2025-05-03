const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;

app.use(bodyParser.json());

let simulationStatus = "NOT_STARTED";
let simulationProgress = 0;
let simulationErrorMessage = null;
let projectDirectory = null;
let simulationConfig = {};

app.post('/project', (req, res) => {
  const { projectDir } = req.body;
  console.log('POST /project received:', req.body);

  if (!projectDir || typeof projectDir !== 'string') {
    return res.status(400).json({ error: 'Validation Error: projectDir (string) is required.' });
  }
  projectDirectory = projectDir;
  console.log('Project directory set to:', projectDirectory);
  res.status(200).json({ message: `Project directory set to ${projectDir}` });
});

app.get('/simulation/status', (req, res) => {
  console.log('GET /simulation/status requested');
  res.status(200).json({
    status: simulationStatus,
    progress: simulationProgress,
    errorMessage: simulationErrorMessage
  });
});

app.post('/config', (req, res) => {
  const { params } = req.body;
  console.log('POST /config received:', req.body);

  if (!params || typeof params !== 'object') {
    return res.status(400).json({ error: 'Validation Error: params (object) is required.' });
  }
  simulationConfig = { ...simulationConfig, ...params };
  console.log('Simulation config updated:', simulationConfig);
  res.status(200).json({ message: 'Configuration updated successfully.', currentConfig: simulationConfig });
});

app.post('/simulation/start', (req, res) => {
  console.log('POST /simulation/start requested');
  if (simulationStatus === "RUNNING") {
    return res.status(409).json({ message: 'Simulation is already running.' });
  }
  simulationStatus = "RUNNING";
  simulationProgress = 0;
  simulationErrorMessage = null;
  console.log('Simulation started');
  const interval = setInterval(() => {
    if (simulationStatus === "RUNNING") {
      simulationProgress += 10;
      if (simulationProgress >= 100) {
        simulationProgress = 100;
        simulationStatus = "COMPLETED";
        console.log('Simulation completed');
        clearInterval(interval);
      }
    } else {
      clearInterval(interval);
    }
  }, 1000);

  res.status(200).json({ message: 'Simulation started.' });
});

app.post('/simulation/stop', (req, res) => {
  console.log('POST /simulation/stop requested');
  if (simulationStatus === "RUNNING") {
    simulationStatus = "STOPPED";
    simulationErrorMessage = null;
    console.log('Simulation stopped');
    res.status(200).json({ message: 'Simulation stopped.' });
  } else {
    res.status(200).json({ message: 'Simulation was not running.' });
  }
});

app.get('/simulation/statistics', (req, res) => {
  console.log('GET /simulation/statistics requested');
  res.status(200).json({
    message: "Statistics endpoint (mocked).",
    data: {
      elapsedTime: simulationStatus === "COMPLETED" || simulationStatus === "STOPPED" ? '10 seconds' : 'N/A',
      iterations: 1,
    }
  });
});


app.listen(port, () => {
  console.log(`Mock SmartSim API server listening at http://localhost:${port}`);
});
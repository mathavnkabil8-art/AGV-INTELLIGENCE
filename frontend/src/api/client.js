/**
 * Central API Client for AGV Intelligence Platform.
 * Provides resilient communication, timeout handling, and typed error responses.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(errorData.detail || errorData.message || 'API request failed', response.status, errorData);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out', 408, null);
    }
    throw err;
  }
}

export const apiClient = {
  // Health & Diagnostics
  checkHealth: () => request('/health'),

  // Warehouse Digital Twin
  getWarehouseLayout: () => request('/warehouse/layout'),
  getWarehouseConfig: () => request('/warehouse/config'),
  updateWarehouseConfig: (payload) =>
    request('/warehouse/config', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleObstacle: (x, y) =>
    request('/warehouse/obstacle/toggle', {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    }),
  addObstacle: (x, y) =>
    request('/warehouse/obstacle/add', {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    }),
  removeObstacle: (x, y) =>
    request('/warehouse/obstacle/remove', {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    }),

  // Simulation Controls & Fleet Execution
  getSimulationState: () => request('/simulation/state'),
  startSimulation: () => request('/simulation/start', { method: 'POST' }),
  pauseSimulation: () => request('/simulation/pause', { method: 'POST' }),
  stepSimulation: () => request('/simulation/step', { method: 'POST' }),
  resetSimulation: () => request('/simulation/reset', { method: 'POST' }),
  setSimulationSpeed: (speed_ms) =>
    request('/simulation/speed', {
      method: 'POST',
      body: JSON.stringify({ speed_ms }),
    }),

  // Dynamic Fleet Operations
  setRobotDestination: (robotId, x, y) =>
    request(`/simulation/robot/${robotId}/destination`, {
      method: 'POST',
      body: JSON.stringify({ x, y }),
    }),
  addRobot: (payload = {}) =>
    request('/simulation/robot/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removeRobot: (robotId) =>
    request(`/simulation/robot/${robotId}`, {
      method: 'DELETE',
    }),

  // Discrete Mathematics Algorithms
  getGridGraph: () => request('/algorithms/grid-graph'),
  calculateGridPath: (payload) =>
    request('/algorithms/grid-graph/path', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  computeRookPolynomial: (payload) =>
    request('/algorithms/rook-polynomial', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  computeGeneratingFunction: (payload) =>
    request('/algorithms/generating-function', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  computeBackupEnergyDistribution: (payload) =>
    request('/algorithms/backup-energy-distribution', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getConflictGraph: (strategy = 'largest_first') =>
    request(`/algorithms/conflict-graph?strategy=${encodeURIComponent(strategy)}`),
  evaluateCustomConflictGraph: (payload) =>
    request('/algorithms/conflict-graph/custom', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkDeadlocks: () => request('/algorithms/deadlock-check'),
  optimizeCharging: () => request('/algorithms/optimize-charging'),

  // Phase 7: Integrated Controller & Deadlock Recovery
  runIntegratedOptimization: (payload = {}) =>
    request('/algorithms/integrated-optimization', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  injectIntentionalDeadlock: () =>
    request('/simulation/deadlock/intentional', {
      method: 'POST',
    }),
  recoverDeadlock: () =>
    request('/simulation/deadlock/recover', {
      method: 'POST',
    }),

  // Phase 8: Experimental Analytics & Performance Evaluation
  getExperiments: () => request('/experiments'),
  getExperimentEvaluation: (experimentId) => request(`/experiments/${experimentId}`),
  getExperimentCsvUrl: (experimentId) => `${API_BASE_URL}/experiments/${experimentId}/csv`,
  getExperimentJsonUrl: (experimentId) => `${API_BASE_URL}/experiments/${experimentId}/json`,
};

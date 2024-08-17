import express from 'express';
import promClient from 'prom-client';

// Create a new Prometheus Registry
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });

// Express server
const app = express();
const port = 6000;

const gauge = new promClient.Gauge({
  name: `my_gauge`,
  help: 'my_gauge_help',
});
registry.registerMetric(gauge);

const histogram = new promClient.Histogram({
  name: 'my_histogram',
  help: 'my_histogram_help',
  buckets: [0.1, 5, 15, 50, 100, 500],
});
registry.registerMetric(histogram);

// Endpoint to update the gauge value
app.get('/update-gauge/:value', (req, res) => {
  // Create a Gauge metric
  const value = parseFloat(req.params.value);
  gauge.set(value);
  histogram.observe(10);

  res.send(`Gauge updated to ${value}`);
});

// Endpoint to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
    const metricsString = await registry.metrics();
    res.end(metricsString);
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
import express from 'express';
import promClient from 'prom-client';

// Create a new Prometheus Registry
const registry = new promClient.Registry();
// promClient.collectDefaultMetrics({ register: registry });

// Express server
const app = express();
const port = 6000;

const gauge = new promClient.Gauge({
    name: `my_test1`,
    help: 'my_test1_help',
    // labelNames: ['test1'],
    // aggregator: 'sum'
  });
registry.registerMetric(gauge);

const accountCounter = new promClient.Counter({
    name: `core_api_missing_dumpster_delivery_on`,
    help: 'core_api_missing_dumpster_delivery_on',
    labelNames: ['account_number']
    // labelNames: ['test1', 'test2'],
    // aggregator: 'sum'
  });
registry.registerMetric(accountCounter);

const histogram = new promClient.Histogram({
    name: 'my_histogram',
    help: 'my_histogram_help',
    buckets: [0.1, 5, 15, 50, 100, 500],
});

registry.registerMetric(histogram);

accountCounter.labels('222302').inc(1);
accountCounter.labels('230230').inc(1);

// Endpoint to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
    const metricsString = await registry.metrics();
    res.end(metricsString);
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
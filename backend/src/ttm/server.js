const express = require("express");

const app = express();
const PORT = process.env.PORT || 9105;

app.use(express.json());

const deployments = new Map();

function now() {
  return new Date().toISOString();
}

function calculateTimeToMarket(record) {
  if (!record.commit_time || !record.production_ready_time) {
    return null;
  }

  const commitTime = new Date(record.commit_time).getTime();
  const productionReadyTime = new Date(
    record.production_ready_time
  ).getTime();

  if (
    Number.isNaN(commitTime) ||
    Number.isNaN(productionReadyTime) ||
    productionReadyTime < commitTime
  ) {
    return null;
  }

  return Math.round((productionReadyTime - commitTime) / 1000);
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "shopkartx-ttm",
    timestamp: now(),
  });
});

app.post("/events", (req, res) => {
  const {
    deployment_id,
    commit_sha,
    commit_time,
    event,
    event_time,
  } = req.body;

  if (!deployment_id) {
    return res.status(400).json({
      error: "deployment_id is required",
    });
  }

  const existing = deployments.get(deployment_id) || {
    deployment_id,
  };

  const updated = {
    ...existing,
    commit_sha: commit_sha || existing.commit_sha || null,
    commit_time: commit_time || existing.commit_time || null,
    [event || "unknown_event"]: event_time || now(),
    updated_at: now(),
  };

  updated.production_ready_time =
    updated.production_ready_time || null;

  updated.time_to_market_seconds =
    calculateTimeToMarket(updated);

  deployments.set(deployment_id, updated);

  return res.status(201).json({
    message: "TTM event recorded",
    deployment: updated,
  });
});

app.get("/deployments", (req, res) => {
  res.json({
    count: deployments.size,
    deployments: Array.from(deployments.values()),
  });
});

app.get("/deployments/:deploymentId", (req, res) => {
  const deployment = deployments.get(req.params.deploymentId);

  if (!deployment) {
    return res.status(404).json({
      error: "Deployment not found",
    });
  }

  res.json(deployment);
});

app.get("/metrics", (req, res) => {
  let totalTTM = 0;
  let measuredDeployments = 0;
  let fastestTTM = null;
  let slowestTTM = null;

  for (const deployment of deployments.values()) {
    const ttm = deployment.time_to_market_seconds;

    if (typeof ttm !== "number") {
      continue;
    }

    measuredDeployments += 1;
    totalTTM += ttm;

    if (fastestTTM === null || ttm < fastestTTM) {
      fastestTTM = ttm;
    }

    if (slowestTTM === null || ttm > slowestTTM) {
      slowestTTM = ttm;
    }
  }

  const averageTTM =
    measuredDeployments > 0
      ? Math.round(totalTTM / measuredDeployments)
      : null;

  res.json({
    service: "shopkartx-ttm",
    measured_deployments: measuredDeployments,
    average_time_to_market_seconds: averageTTM,
    fastest_time_to_market_seconds: fastestTTM,
    slowest_time_to_market_seconds: slowestTTM,
    timestamp: now(),
  });
});

app.listen(PORT, () => {
  console.log(
    `ShopKartX TTM service running on port ${PORT}`
  );
});

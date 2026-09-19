const http = require('http');

const PORT = Number(process.env.PORT || 9105);

const deployments = new Map();

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });

  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getOrCreateDeployment(deploymentId) {
  if (!deployments.has(deploymentId)) {
    deployments.set(deploymentId, {
      deploymentId,
      buildStartedAt: null,
      commitTime: null,
      productionReadyAt: null,
      events: [],
    });
  }

  return deployments.get(deploymentId);
}

function calculateTtm(deployment) {
  if (!deployment.buildStartedAt || !deployment.productionReadyAt) {
    return null;
  }

  const start = new Date(deployment.buildStartedAt).getTime();
  const ready = new Date(deployment.productionReadyAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(ready)) {
    return null;
  }

  const milliseconds = ready - start;

  return {
    milliseconds,
    seconds: Number((milliseconds / 1000).toFixed(3)),
    minutes: Number((milliseconds / 60000).toFixed(3)),
  };
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'shopkartx-ttm',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && url.pathname === '/events') {
    try {
      const payload = await readJsonBody(req);

      const deploymentId = payload.deploymentId;

      if (!deploymentId) {
        return sendJson(res, 400, {
          error: 'deploymentId is required',
        });
      }

      const event = payload.event;

      if (!event) {
        return sendJson(res, 400, {
          error: 'event is required',
        });
      }

      const deployment = getOrCreateDeployment(deploymentId);

      const timestamp = payload.timestamp || new Date().toISOString();

      const eventRecord = {
        event,
        timestamp,
        source: payload.source || 'unknown',
        commitSha: payload.commitSha || null,
        commitTime: payload.commitTime || null,
      };

      deployment.events.push(eventRecord);

      if (event === 'build_started') {
        deployment.buildStartedAt = timestamp;
        deployment.commitTime = payload.commitTime || null;
      }

      if (event === 'production_ready') {
        deployment.productionReadyAt = timestamp;
      }

      const ttm = calculateTtm(deployment);

      return sendJson(res, 201, {
        message: 'Event recorded',
        deployment,
        ttm,
      });
    } catch (error) {
      return sendJson(res, 400, {
        error: error.message,
      });
    }
  }

  const deploymentMatch = url.pathname.match(
    /^\/deployments\/([^/]+)$/
  );

  if (req.method === 'GET' && deploymentMatch) {
    const deploymentId = decodeURIComponent(deploymentMatch[1]);

    const deployment = deployments.get(deploymentId);

    if (!deployment) {
      return sendJson(res, 404, {
        error: 'Deployment not found',
        deploymentId,
      });
    }

    return sendJson(res, 200, {
      deployment,
      ttm: calculateTtm(deployment),
    });
  }

  if (req.method === 'GET' && url.pathname === '/deployments') {
    const allDeployments = Array.from(deployments.values()).map(
      (deployment) => ({
        ...deployment,
        ttm: calculateTtm(deployment),
      })
    );

    return sendJson(res, 200, {
      count: allDeployments.length,
      deployments: allDeployments,
    });
  }

  return sendJson(res, 404, {
    error: 'Route not found',
    path: url.pathname,
  });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error('Unhandled request error:', error);

    sendJson(res, 500, {
      error: 'Internal server error',
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ShopKartX TTM service running on port ${PORT}`);
});

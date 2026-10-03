/**
 * ColdChain Guardian — C++ Backend Integration Test
 * Verifies HTTP Socket Server communication with backend.cpp
 */

import http from 'http';

const HOST = 'localhost';
const PORT = 8080;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get(
      {
        host: HOST,
        port: PORT,
        path: path,
        headers: { Accept: 'application/json' },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          const latencyMs = Date.now() - start;
          try {
            const parsed = JSON.parse(rawData);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsed,
              latencyMs,
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              rawBody: rawData,
              error: 'JSON parse error: ' + e.message,
              latencyMs,
            });
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Connection timed out after 5000ms'));
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  ColdChain Guardian — C++ Backend Verification');
  console.log('  Target: http://' + HOST + ':' + PORT + ' (backend.cpp)');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalCount = 3;

  // Test 1: Baseline Telemetry (GET /)
  process.stdout.write('1. Testing Baseline Telemetry [GET /] ... ');
  try {
    const res = await makeRequest('/');
    if (
      res.statusCode === 200 &&
      res.body &&
      typeof res.body.temperature === 'number' &&
      (res.body.status === 'SAFE' || res.body.status === 'DANGER')
    ) {
      console.log('PASS (' + res.latencyMs + 'ms)');
      console.log('   Response: temp=' + res.body.temperature.toFixed(2) + '°C, status="' + res.body.status + '"\n');
      passedCount++;
    } else {
      console.log('FAIL');
      console.log('   Unexpected response:', res.body || res.rawBody, '\n');
    }
  } catch (err) {
    console.log('FAIL (' + err.message + ')\n');
    console.log('   Make sure backend.exe is running on port 8080.\n');
  }

  // Test 2: Trigger Breakdown Excursion (GET /trigger)
  process.stdout.write('2. Testing Hardware Breakdown Trigger [GET /trigger] ... ');
  try {
    const res = await makeRequest('/trigger');
    if (
      res.statusCode === 200 &&
      res.body &&
      res.body.status === 'DANGER' &&
      res.body.temperature >= 11.5
    ) {
      console.log('PASS (' + res.latencyMs + 'ms)');
      console.log('   Breakdown confirmed: temp=' + res.body.temperature.toFixed(2) + '°C (>=12.0°C), status="' + res.body.status + '"\n');
      passedCount++;
    } else {
      console.log('FAIL');
      console.log('   Expected status="DANGER" and temp >= 12.0°C. Got:', res.body, '\n');
    }
  } catch (err) {
    console.log('FAIL (' + err.message + ')\n');
  }

  // Test 3: Reset Cooler Recovery (GET /reset)
  process.stdout.write('3. Testing Cooler Reset & Recovery [GET /reset] ... ');
  try {
    const res = await makeRequest('/reset');
    if (
      res.statusCode === 200 &&
      res.body &&
      res.body.status === 'SAFE' &&
      res.body.temperature <= 9.0
    ) {
      console.log('PASS (' + res.latencyMs + 'ms)');
      console.log('   Cooler recovered: temp=' + res.body.temperature.toFixed(2) + '°C (2.0°C-8.0°C), status="' + res.body.status + '"\n');
      passedCount++;
    } else {
      console.log('FAIL');
      console.log('   Expected status="SAFE" and temp <= 8.0°C. Got:', res.body, '\n');
    }
  } catch (err) {
    console.log('FAIL (' + err.message + ')\n');
  }

  console.log('----------------------------------------------------');
  if (passedCount === totalCount) {
    console.log('SUCCESS: All ' + totalCount + ' C++ backend integration tests passed! (100%)\n');
    process.exit(0);
  } else {
    console.error('FAILURE: ' + (totalCount - passedCount) + ' of ' + totalCount + ' tests failed.\n');
    process.exit(1);
  }
}

runTests();

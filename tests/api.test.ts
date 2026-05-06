import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /health returns 200", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "Cloud Cost Intelligence Dashboard");
});

test("GET /api/costs returns an array", async () => {
  const response = await request(app).get("/api/costs");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length >= 1);
});

test("POST /api/analyze/costs returns score and status", async () => {
  const response = await request(app).post("/api/analyze/costs").send({
    accountName: "Northstar Production",
    service: "Kubernetes",
    monthlyCost: 18240,
    previousMonthlyCost: 12110,
    budget: 14000,
    environment: "production",
    utilizationRate: 0.41,
    costPerCustomer: 18.2,
    costPerDeployment: 456,
    costPerThousandRequests: 108,
    tagged: true,
  });

  assert.equal(response.status, 200);
  assert.equal(typeof response.body.score, "number");
  assert.equal(typeof response.body.status, "string");
});

test("GET /api/anomalies returns an array", async () => {
  const response = await request(app).get("/api/anomalies");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test("POST /api/analyze/recommendation returns recommendation output", async () => {
  const response = await request(app).post("/api/analyze/recommendation").send({
    accountName: "Northstar Production",
    service: "Kubernetes",
    monthlyCost: 18240,
    previousMonthlyCost: 12110,
    budget: 14000,
    environment: "production",
    utilizationRate: 0.41,
    costPerCustomer: 18.2,
    costPerDeployment: 456,
    costPerThousandRequests: 108,
    tagged: true,
  });

  assert.equal(response.status, 200);
  assert.equal(typeof response.body.estimatedMonthlySavings, "number");
  assert.equal(typeof response.body.recommendedNextAction, "string");
});

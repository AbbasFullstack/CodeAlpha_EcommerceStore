const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../server");

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  return { response, body };
};

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint returns a successful API response", async () => {
  const { response, body } = await request("/api/health");
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.message, "E-commerce API is running");
});

test("unknown API routes return 404 JSON", async () => {
  const { response, body } = await request("/api/does-not-exist");
  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.message, "Route not found");
});

test("protected profile route rejects unauthenticated requests", async () => {
  const { response, body } = await request("/api/auth/profile");
  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.message, "Authentication required");
});

test("cart route rejects unauthenticated requests", async () => {
  const { response, body } = await request("/api/cart");
  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.message, "Authentication required");
});

test("order creation rejects unauthenticated requests", async () => {
  const { response, body } = await request("/api/orders", { method: "POST", body: "{}" });
  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.message, "Authentication required");
});

test("registration validates missing required fields", async () => {
  const { response, body } = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.message, "Validation failed");
  assert.ok(Array.isArray(body.errors));
  assert.ok(body.errors.some((error) => error.field === "name"));
  assert.ok(body.errors.some((error) => error.field === "email"));
  assert.ok(body.errors.some((error) => error.field === "password"));
});

test("login validates invalid email format", async () => {
  const { response, body } = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "not-an-email", password: "secret123" }),
  });
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.message, "Validation failed");
});

test("product detail route rejects malformed product IDs", async () => {
  const { response, body } = await request("/api/products/not-a-valid-id");
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.message, "Invalid product ID");
});

test("static frontend is served", async () => {
  const { response, body } = await request("/");
  assert.equal(response.status, 200);
  assert.equal(typeof body.raw, "string");
  assert.match(body.raw, /ShopEase/);
  assert.match(body.raw, /productsGrid/);
});

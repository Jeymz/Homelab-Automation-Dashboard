/* eslint-env jest */
/* eslint-disable no-undef */
process.env.GITLAB_API_URL = 'http://example.com';
process.env.GITLAB_TOKEN = 'dummy';
const request = require('supertest');
const app = require('../src/server');

describe('Server startup', () => {
  test('GET / responds with HTML dashboard', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Homelab Automation Dashboard');
  });

  test('GET /main.js serves frontend script', async () => {
    const res = await request(app).get('/main.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/javascript/);
  });

  test('GET /index.css serves frontend styles', async () => {
    const res = await request(app).get('/index.css');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/css/);
  });
});

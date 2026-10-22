import request from 'supertest';
import { expect } from 'chai';
import { ExpressServer } from '../../src/express_server';

describe('Pruebas de integración: API REST', () => {
  let app: any;

  before(() => {
    const server = new ExpressServer();
    app = server.app;
  });

  it('GET /ping debe responder 200 con "pong"', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('pong');
  });

  it('POST /api/users/login con un correo no registrado debe responder 404', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'noexiste@pms.local', password: 'X' });
    expect(res.status).to.equal(404);
  });

  it('GET /api/projects sin encabezado Authorization debe responder 401', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).to.equal(401);
  });

  it('POST /api/projects sin encabezado Authorization debe responder 401', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Proyecto sin token' });
    expect(res.status).to.equal(401);
  });

  it('GET /api/roles sin encabezado Authorization debe responder 401', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).to.equal(401);
  });
});

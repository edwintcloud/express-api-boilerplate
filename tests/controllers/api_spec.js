const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();

// setup chai to use http assertion
chai.use(chaiHttp);

describe('API', () => {

  // GET INDEX TEST
  it('should respond with a json message at / GET', async () => {
    const res = await chai.request(server).get(`/`);
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.property('message');
  });

  // GET INVALID ROUTE TEST
  it('should respond with a json error message at /invalidpath GET', async () => {
    const res = await chai.request(server).get(`/testing123`);
    res.should.have.status(404);
    res.should.be.json;
    res.body.should.have.property('message');
  });
});

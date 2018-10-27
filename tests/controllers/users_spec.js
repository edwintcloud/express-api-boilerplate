const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const { user } = require('../../models');

// setup chai to use http assertion
chai.use(chaiHttp);

// create our testUser
const testUser = {
  username: 'chaiTestUser',
  password: 'testpassword',
  email: 'test@test.com'
};

describe('Users', () => {

  // delete test user after each test
  afterEach(async () => {
    await user.deleteMany({ username: 'chaiTestUser' });
  })

  // READ ALL TEST
  it('should index all users at /users GET', async () => {
    const res = await chai.request(server).get(`/users`);
    res.should.have.status(200);
    res.should.be.json;
  });

  // READ BY QUERY TEST
  it('should index a single user at /users?_id= GET', async () => {
    const newUser = await user.create(testUser);
    const res = await chai.request(server).get(`/users?_id=${newUser._id}`);
    res.should.have.status(200);
    res.should.be.json;
  });

  // CREATE/REGISTER ONE TEST
  it('should create a new user and set session at /users POST', async () => {
    const res = await chai.request(server).post(`/users`).send(testUser);
    res.should.have.status(201);
    res.should.be.json;
    res.body.should.have.keys(['username', 'email', '_id', 'role', 'createdAt', 'updatedAt']);
    res.should.have.cookie('connect.sid');
  });

  // UPDATE ONE TEST
  it('should update a single user and respond with updated user at /users?_id= PUT', async () => {
    const newUser = await user.create(testUser);
    const updates = {
      role: 3
    };
    const res = await chai.request(server).put(`/users?_id=${newUser._id}`).send(updates);
    res.should.have.status(200);
    res.should.be.json;
    res.body.role.should.equal(3);
  });

  // DELETE ONE TEST
  it('should delete a single user at /users?_id= DELETE', async () => {
    const newUser = await user.create(testUser);
    const res = await chai.request(server).delete(`/users?_id=${newUser._id}`);
    res.should.have.status(200);
    res.should.be.json;
  });

  // LOGIN TEST
  it('should login a single user by setting the session at /users/login POST', async () => {
    const newUser = await user.create(testUser);
    const res = await chai.request(server).post(`/users/login`).send(testUser);
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.keys(['username', 'email', '_id', 'role', 'createdAt', 'updatedAt']);
    res.should.have.cookie('connect.sid');
  });


  // LOGOUT TEST
  it('should logout a single user by destroying the session at /users/logout POST', async () => {
    const agent = chai.request.agent(server);
    const newUser = await user.create(testUser);
    await agent.post(`/users/login`).send(testUser);
    const res = await agent.post(`/users/logout`);
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.property('message');
    res.should.not.have.cookie('connect.sid');
    agent.close();
  });

  // DELETE LOGGED IN USER TEST
  it('should delete currently logged in user and logout at /users/delete DELETE', async () => {
    const agent = chai.request.agent(server);
    const newUser = await user.create(testUser);
    await agent.post(`/users/login`).send(testUser);
    const res = await agent.delete(`/users/delete`);
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.property('message');
    res.should.not.have.cookie('connect.sid');
    agent.close();
  });

  // UPDATE LOGGED IN USER TEST
  it('should update currently logged in user at /users/update PUT', async () => {
    const agent = chai.request.agent(server);
    const newUser = await user.create(testUser);
    const updates = {
      email: 'updated'
    };
    await agent.post(`/users/login`).send(testUser);
    const res = await agent.put(`/users/update`).send(updates);
    res.should.have.status(200);
    res.should.be.json;
    res.body.email.should.equal('updated');
    agent.close();
  });

  // GET CURRENTLY LOGGED IN USER TEST
  it('should return currently logged in user at /users/current GET', async () => {
    const agent = chai.request.agent(server);
    const newUser = await user.create(testUser);
    await agent.post(`/users/login`).send(testUser);
    const res = await agent.get(`/users/current`);
    res.should.have.status(200);
    res.should.be.json;
    res.body.should.have.keys(['username', 'email', '_id', 'role', 'createdAt', 'updatedAt']);
    agent.close();
  });

});

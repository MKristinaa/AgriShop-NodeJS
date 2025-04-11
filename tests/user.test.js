const request = require('supertest');
const app = require('../server'); 
const mongoose = require('mongoose');
const User = require('../models/user'); 
const bcrypt = require('bcryptjs'); 

describe('Login User', () => {
  let user;

  beforeAll(async () => {

    await mongoose.connect(process.env.DB_LOCAL_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
    user = new User({
      name: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      password: 'test123', 
      isVerified: true,
      role: 'user',
      avatar: { public_id: 'sample_id', url: 'http://example.com/avatar.jpg' }
    });
  
    await user.save(); 
  });

  afterAll(async () => {

    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should login successfully with correct credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'test123',
    };

    const response = await request(app)
      .post('/api/login') 
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token'); 
    expect(typeof response.body.token).toBe('string');
  });

  it('should fail login with wrong credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword', 
    };

    const response = await request(app)
      .post('/api/login')
      .send(loginData);

    expect(response.status).toBe(400);  
    expect(response.body).toHaveProperty('message', 'Email or password is not valid');
  });

  it('should fail login if user is not verified', async () => {
    const unverifiedUser = new User({
      name: 'Unverified',
      lastname: 'User',
      email: 'unverified@example.com',
      password: 'test123',
      isVerified: false,
      role: 'user', 
      avatar: { public_id: 'sample_id', url: 'http://example.com/avatar.jpg' } 
    });

    unverifiedUser.password = await bcrypt.hash(unverifiedUser.password, 10);
    await unverifiedUser.save();

    const loginData = {
      email: 'unverified@example.com',
      password: 'test123',
    };

    const response = await request(app)
      .post('/api/login')
      .send(loginData);

    expect(response.status).toBe(400);  
    expect(response.body).toHaveProperty('message', 'Your account is not verified. Please verify your email before logging in.');
  });
  
});

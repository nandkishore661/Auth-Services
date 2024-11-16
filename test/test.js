// test/auth.test.js
const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');
const User = require('../models/user'); // Adjust the path as needed
const app = require('../app'); // Adjust if app.js exports the app

describe('Auth Routes', () => {
    before(async () => {
        // Check if already connected
        if (mongoose.connection.readyState === 0) {
            // Connect to the database before running tests
            await mongoose.connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }
    });

    after(async () => {
        // Drop the test database and close the connection after tests
        // await mongoose.connection.db.dropDatabase();
        // await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: 'customer',
                    address: '123 Main St',
                    contact_details: '123-456-7890',
                });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.message, 'User  registered successfully');
        });

        it('should not register a user with an existing email', async () => {
            await request(app)
                .post('/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'jane@example.com', // Same email as before
                    password: 'password123',
                    role: 'customer',
                });

            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: 'customer',
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.message, 'User already exists');
        });
    });

    describe('POST /auth/login', () => {
        before(async () => {
            // Register the user before testing login
            await request(app)
                .post('/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: 'customer',
                    address: '123 Main St',
                    contact_details: '123-456-7890',
                });
        });

        it('should log in an existing user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'jane@example.com',
                    password: 'password123',
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.token); // Check if token exists
        });

        it('should not log in with invalid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'jane@example.com',
                    password: 'wrongpassword',
                });

            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.message, 'Invalid credentials');
        });
    });

    describe('GET /user/profile', () => {
        let token;

        before(async () => {
            // Log in to get a token for the profile request
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'jane@example.com',
                    password: 'password123',
                });

            token = res.body.token;
        });

        it('should return user profile', async () => {
            const res = await request(app)
                .get('/user/profile')
                .set('Authorization', `Bearer ${token}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.email, 'jane@example.com');
        });
    });

    describe('PUT /user/profile', () => {
        let token;

        before(async () => {
            // Log in to get a token for the profile request
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'jane@example.com',
                    password: 'password123',
                });

            token = res.body.token;
        });

        it('should update user profile', async () => {
            const res = await request(app)
                .put('/user/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address: '456 New St',
                    contact_details: '987-654-3210',
 });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Profile updated successfully');
            assert.strictEqual(res.body.user.address, '456 New St');
        });

        it('should not update profile without token', async () => {
            const res = await request(app)
                .put('/user/profile')
                .send({
                    address: '789 Another St',
                });

            assert.strictEqual(res.status, 401);
        });
    });
});
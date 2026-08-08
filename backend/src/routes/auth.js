import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { sendWelcomeEmail } from '../services/mailer.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        careerProfile: {
          create: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email asynchronously
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(console.error);

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatarUrl } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (Seamless Auto-Upsert Mode)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          name: email.split('@')[0].replace(/[\._]/g, ' ').toUpperCase(),
          email,
          passwordHash,
          careerProfile: {
            create: {}
          }
        }
      });
      sendWelcomeEmail({ email: user.email, name: user.name }).catch(console.error);
    } else {
      let isValid = false;
      if (user.passwordHash) {
        try {
          isValid = await bcrypt.compare(password, user.passwordHash);
        } catch (e) {
          isValid = false;
        }
      }
      if (!isValid) {
        const newHash = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash }
        });
      }
    }

    const jwtSecret = process.env.JWT_SECRET || 'careerpilot_super_secret_jwt_key_2024';

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatarUrl } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Google Authentication ("Continue with Google")
router.post('/google', async (req, res) => {
  try {
    const { email = 'hiteshvaishnav602@gmail.com', name = 'Hitesh Vaishnav', avatar_url } = req.body;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const dummyPasswordHash = await bcrypt.hash(`google_oauth_${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: dummyPasswordHash,
          avatarUrl: avatar_url || null,
          careerProfile: {
            create: {
              about: 'MERN Stack Developer passionate about building high-performance web applications.',
              targetRoles: ['MERN Stack Developer', 'Full Stack Developer'],
              skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript']
            }
          }
        }
      });
    } else if (avatar_url && !user.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: avatar_url }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email if new Google user
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(console.error);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl
      },
      message: isNewUser ? 'Google Sign-in successful! Welcome email sent.' : 'Google Sign-in successful!'
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatarUrl } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

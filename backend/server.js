const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const queriesRoutes = require('./routes/queries');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const schemaRoutes = require('./routes/schema');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const dbManagerRoutes = require('./routes/dbmanager');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queries', queriesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dbmanager', dbManagerRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('AI SQL Assistant API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

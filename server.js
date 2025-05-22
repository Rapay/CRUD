const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const alunoRoutes = require('./routes/alunoRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const aulaRoutes = require('./routes/aulaRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alunos', alunoRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/aulas', aulaRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.sync();
        console.log('Database synchronized successfully');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
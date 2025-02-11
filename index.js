import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sequelize from './config/database.js';
import Student from './models/Students.js';
import Attendance from './models/Attendance.js';
import attendanceRoutes from './routes/attandanceRoutes.js';

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', attendanceRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


async function initializeDatabase() {
    try {
        await sequelize.sync({ force: true });

        const demoStudents = ['Siva', 'Rajesh', 'Ashok', 'Sai', 'Haritha', 'Ranu', 'Priya', 'Kumar', 'Ravi', 'Deepa'];
        await Student.bulkCreate(demoStudents.map(name => ({ name })));

        console.log('Database initialized with demo students');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}


const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', async () => {
    await initializeDatabase();
    console.log(`Server running on port ${PORT}`);
});

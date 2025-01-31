import express, { urlencoded } from 'express';
import { sequelize, Student, Attendance } from './model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Add these lines




const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
// Sync Database and Create Demo Students
sequelize.sync({ force: true }).then(async () => {
  // Create 20 demo students
  const demoStudents = Array.from({ length: 20 }, (_, i) => ({ 
    name: `Student ${String(i+1).padStart(2, '0')}` 
  }));
  await Student.destroy({ where: {} });
  for (const student of demoStudents) {
    await Student.create(student);
  }
});

// Routes
// Modified index route
app.get('/', async (req, res) => {
    try {
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        
        // Check existing attendance for selected date
        const existingAttendance = await Attendance.findAll({
            where: { date: selectedDate },
            include: [Student]
        });

        const students = await Student.findAll();
        
        // Map existing attendance to student IDs
        const attendanceMap = {};
        existingAttendance.forEach(record => {
            attendanceMap[record.StudentId] = record.status;
        });

        res.render('index', { 
            students,
            selectedDate,
            attendanceMap,
            hasExistingData: existingAttendance.length > 0
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});
app.post('/attendance', async (req, res) => {
    try {
      const { date, attendance } = req.body;
      
      // Validate date exists
      if (!date) throw new Error('No date provided');
  
      const students = await Student.findAll();
      const records = students.map(student => ({
        StudentId: student.id,
        date: new Date(date).toISOString().split('T')[0],
        status: attendance[student.id] || 'Absent' // Default to Absent
      }));
  
      await Attendance.bulkCreate(records, {
        updateOnDuplicate: ['status']
      });
  
      res.redirect('/reports');
    } catch (error) {
      console.error('Attendance Submission Error:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });
  // In reports route
app.get('/reports', async (req, res) => {
    try {
      const attendanceData = await Attendance.findAll({
        include: [Student],
        order: [['date', 'DESC']],
        raw: true
      });
  
      const processedData = attendanceData.map(record => ({
        ...record,
        date: new Date(record.date)
      }));
  
      const reports = {};
      processedData.forEach(record => {
        const dateStr = record.date.toISOString().split('T')[0];
        if (!reports[dateStr]) reports[dateStr] = [];
        reports[dateStr].push({
          student: record['Student.name'],
          status: record.status
        });
      });
  
      res.render('reports', { 
        reports,
        isEmpty: Object.keys(reports).length === 0 // Add this
      });
    } catch (error) {
      console.error('Reports Error:', error);
      res.status(500).send('Error generating reports');
    }
  });

app.listen(3000, () => console.log('Server running on port 3000'));
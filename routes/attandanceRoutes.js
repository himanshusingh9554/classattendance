import { Router } from 'express';
import Student from '../models/Students.js';
import Attendance from '../models/Attendance.js'; 
import { Op } from 'sequelize';

const router = Router();


router.get('/students', async (req, res) => {
    try {
        const students = await Student.findAll({
            order: [['name', 'ASC']]
        });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Error fetching students' });
    }
});


router.get('/attendance/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const attendance = await Attendance.findAll({
            where: { date },
            include: [{
                model: Student,
                attributes: ['id', 'name']
            }]
        });

        if (!attendance.length) {
            return res.json([]); 
        }

        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Error fetching attendance' });
    }
});


router.post('/attendance', async (req, res) => {
    try {
        const { attendance } = req.body;
        
        if (!attendance || attendance.length === 0) {
            return res.status(400).json({ error: 'No attendance data provided' });
        }

        await Attendance.destroy({
            where: { date: attendance[0].date }
        });

        
        await Attendance.bulkCreate(attendance);
        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        res.status(500).json({ error: 'Error submitting attendance' });
    }
});


router.get('/report', async (req, res) => {
    try {
        const students = await Student.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        const report = await Promise.all(students.map(async (student) => {
            const totalDays = await Attendance.count({
                where: { studentId: student.id }
            });

            const presentDays = await Attendance.count({
                where: {
                    studentId: student.id,
                    status: 'present'
                }
            });

            return {
                studentName: student.name,
                presentDays,
                totalDays,
                percentage: totalDays ? Math.round((presentDays / totalDays) * 100) : 0
            };
        }));

        res.json(report);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error generating attendance report' });
    }
});

export default router;

document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'http://localhost:8000/api'; // Backend URL
    const studentList = document.getElementById('student-list');
    const attendanceForm = document.getElementById('attendance-form');
    const dateInput = document.getElementById('attendance-date');
    const searchBtn = document.getElementById('search-btn');
    const fetchReportBtn = document.getElementById('fetch-report');
    const reportSection = document.getElementById('report-section');
    const reportData = document.getElementById('report-data');
    const submitBtn = document.getElementById('submit-btn');
 
    dateInput.valueAsDate = new Date();
  
  
    async function fetchStudents() {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            if (!response.ok) throw new Error('Failed to fetch students');
            const students = await response.json();
  
            studentList.innerHTML = students.map(student => `
                <tr>
                    <td>${student.name}</td>
                    <td>
                        <div class="radio-group">
                            <input type="radio" name="attendance_${student.id}" value="present" id="present_${student.id}" required>
                            <label for="present_${student.id}">Present</label>
                            <input type="radio" name="attendance_${student.id}" value="absent" id="absent_${student.id}">
                            <label for="absent_${student.id}">Absent</label>
                        </div>
                    </td>
                </tr>
            `).join('');
            if (students.length > 0) {
                submitBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Error loading students. Please try again.');
        }
    }
  
    async function searchAttendance() {
        const date = dateInput.value;
        if (!date) {
            alert('Please select a date');
            return;
        }
  
        try {
            document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
  
            const response = await fetch(`${API_BASE_URL}/attendance/${date}`);
            if (!response.ok) throw new Error('Failed to fetch attendance');
            const attendance = await response.json();
  
            if (attendance.length === 0) {
               alert('No attendance records found for this date. You can now mark attendance.');
               document.getElementById('submit-btn').style.display = 'block';
            } else {
                attendance.forEach(record => {
                    const presentRadio = document.getElementById(`present_${record.studentId}`);
                    const absentRadio = document.getElementById(`absent_${record.studentId}`);
                    
                   
                    if (record.status === 'present') {
                        presentRadio.checked = true;
                    } else {
                        absentRadio.checked = true;
                    }
                });
                document.getElementById('submit-btn').style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            alert('Error loading attendance data. Please try again.');
        }
    }
  
   
    async function submitAttendance(e) {
        e.preventDefault();
        const date = dateInput.value;
        if (!date) {
            alert('Please select a date');
            return;
        }
  
        const attendance = [];

        document.querySelectorAll('[name^="attendance_"]').forEach(radio => {
            if (radio.checked) {
                const studentId = parseInt(radio.name.split('_')[1]);
                attendance.push({ 
                    studentId:studentId, status: radio.value, date:date 
                });
        }
    });
  
        if (attendance.length === 0) {
            alert('Please mark attendance for at least one student');
            return;
        }
  
        try {
            const response = await fetch(`${API_BASE_URL}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attendance })
            });
  
            if (!response.ok) throw new Error('Failed to submit attendance');
            alert('Attendance submitted successfully');
            await searchAttendance();
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Error submitting attendance. Please try again.');
        }
    }
  
    async function fetchReport() {
        try {
            const response = await fetch(`${API_BASE_URL}/report`);
            if (!response.ok) throw new Error('Failed to fetch report');
            const report = await response.json();
  
            reportData.innerHTML = report.length ? report.map(record => `
                <tr>
                    <td>${record.studentName}</td>
                    <td>${record.presentDays}/${record.totalDays}</td>
                    <td>${record.percentage}%</td>
                </tr>
            `).join('') : '<tr><td colspan="3">No attendance records found</td></tr>';
  
            reportSection.style.display = 'block';
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Error loading attendance report. Please try again.');
        }
    }
  

    fetchStudents();
    searchBtn.addEventListener('click', searchAttendance);
    attendanceForm.addEventListener('submit', submitAttendance);
    fetchReportBtn.addEventListener('click', fetchReport);
  });
  
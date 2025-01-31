import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'mysql',
    database: 'attendance_system',
    username: 'root', // or 'root'
    password: 'rootnode',
    host: 'localhost',
    port: 3306,
    
  });
// Student Model
export const Student = sequelize.define('Student', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  
  export const Attendance = sequelize.define('Attendance', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get(){
        const rawValue = this.getDataValue('date');
      return new Date(rawValue);
      }
    },
    status: {
      type: DataTypes.ENUM('Present', 'Absent'),
      allowNull: false
    }
  });
  
  Student.hasMany(Attendance, {
    foreignKey: {
      name: 'StudentId',
      allowNull: false // Ensure StudentId is always present
    }
  });
  Attendance.belongsTo(Student, {
    foreignKey: {
      name: 'StudentId',
      allowNull: false
    }
  });
  
  export { sequelize };
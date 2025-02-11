import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student= sequelize.define('Student', {
  id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,

  }, 
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }


});

export default Student;
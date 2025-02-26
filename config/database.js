import { Sequelize } from 'sequelize';
import mysql2 from "mysql2"; 


const sequelize = new Sequelize('attendance_db', 'root', 'rootnode', {
  host: 'localhost',
  dialect: 'mysql',
dialectModule: mysql2

});

export default sequelize;

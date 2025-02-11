import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('attendance_db', 'root', 'rootnode', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;
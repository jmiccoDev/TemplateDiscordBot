const mysql = require('mysql2');
const { host, port, user, password, database } = require('../src/database-config.json');

const connection = mysql.createConnection({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
});

async function connectDatabase() {
  connection.connect((err) => {
    if (err) {
      console.log('Error connecting to database: ' + err.stack);
      return;
    }
    console.log('Connected to database as id ' + connection.threadId);
  });
}

async function makeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
      if (err) {
        console.log('Error making query: ' + err.stack);
        reject(err);
      }
      resolve(result);
    });
  });
}

async function createRecord(table, columns, values) {
  return new Promise((resolve, reject) => {
    const formattedValues = values.map(value => typeof value === 'string' ? `'${value}'` : value);
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${formattedValues.join(', ')})`;
    connection.query(query, (err, result) => {
      if (err) {
        console.log('Error creating record: ' + err.stack);
        reject(err);
      }
      resolve(result);
    });
  });
}

async function updateRecord(table, columns, values, condition) {
  return new Promise((resolve, reject) => {
    const setClause = columns.map(column => `${column} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating record:', err.stack);
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  makeQuery,
  createRecord,
  connectDatabase,
  updateRecord,
};
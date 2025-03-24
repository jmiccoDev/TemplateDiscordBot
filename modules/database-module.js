const mysql = require('mysql2');
const { host, port, user, password, database, ENABLED } = require('../src/database-config.json');

let pool;

if (ENABLED) {
  pool = mysql.createPool({
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

async function connectDatabase() {
  if (!ENABLED) {
    console.log('Database connection is disabled.');
    return;
  }
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error connecting to database: ' + err.stack);
      return;
    }
    console.log('Connected to database as id ' + connection.threadId);
    connection.release();
  });
}

async function makeQuery(query) {
  if (!ENABLED) {
    console.log('Database connection is disabled.');
    return;
  }
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        console.log('Error making query: ' + err.stack);
        reject(err);
      }
      resolve(result);
    });
  });
}

async function createRecord(table, columns, values) {
  if (!ENABLED) {
    console.log('Database connection is disabled.');
    return;
  }
  return new Promise((resolve, reject) => {
    const formattedValues = values.map(value => typeof value === 'string' ? `'${value}'` : value);
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${formattedValues.join(', ')})`;
    pool.query(query, (err, result) => {
      if (err) {
        console.log('Error creating record: ' + err.stack);
        reject(err);
      }
      resolve(result);
    });
  });
}

async function updateRecord(table, columns, values, condition) {
  if (!ENABLED) {
    console.log('Database connection is disabled.');
    return;
  }
  return new Promise((resolve, reject) => {
    const setClause = columns.map(column => `${column} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;
    pool.query(query, values, (err, result) => {
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
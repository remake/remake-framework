const MongoClient = require('mongodb').MongoClient;

let _connection;

async function connect () {
  try {
    return await MongoClient.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
  } catch (err) {
    console.error("Error connecting to MongoDB:");
    console.error(err);
  }
};

function getDbConnection () {
  if (!_connection) {
    _connection = connect();
  }

  return _connection;
};

async function getDb () {
  try {
    const db = (await getDbConnection()).db(process.env.DB_NAME);
    return db;
  } catch (err) {
    console.error("Error connecting to Artisfy database:");
    console.error(err);
  }
}

async function getCollection(collectionName) {
  const db = await getDb();
  try {
    return db.collection(collectionName);
  } catch (err) {
    console.error("Error getting MongoDB collection:");
    console.error(err);
  }
}

module.exports = {
  getDbConnection,
  getDb,
  getCollection
}




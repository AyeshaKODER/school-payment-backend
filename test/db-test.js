// test/db-test.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri =
  'mongodb+srv://iayeshakhan2004_db_user:MyStrongPass123@cluster0.mzmxho9.mongodb.net/school-payment?retryWrites=true&w=majority&appName=Cluster0'


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // Ping the actual database you want to use
    await client.db('school-payment').command({ ping: 1 });
    console.log(' Successfully connected to MongoDB!');
  } catch (err) {
    console.error(' Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

run();

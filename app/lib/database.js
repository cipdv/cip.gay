import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 60000, // Timeout in 60 seconds
  retryWrites: true, // Automatically retry failed write operations
};

if (!URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let client = new MongoClient(URI, options);
let dbConnection;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect();
}
dbConnection = global._mongoClientPromise;

export default dbConnection;

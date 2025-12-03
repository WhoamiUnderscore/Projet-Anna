import mongoose from "mongoose"

const uri = process.env.DB_URI;
const options = {
  dbName: "Site_Art",
  bufferCommands: false,
  serverApi: {
    strict: true,
    version: "1",
    deprecationErrors: true
  }
};

if ( !uri ) {
  throw new Error("ERROR: Veuillez definir votre lien de connection a la base de donnee avant de continuer");
}

let cache = global.mongoose || (
  global.mongoose = {
    conn: null,
    promise: null
  }
);

export default async function connection() {
  if ( cache.conn ) {
    return cache.conn;
  }

  if ( !cache.promise ) {
    cache.promise = mongoose.connect(uri!, options).then((db) => db);

    await mongoose.connection.db?.admin().command({ ping: 1 });
  }

  cache.conn = await cache.promise;

  return cache.conn
}


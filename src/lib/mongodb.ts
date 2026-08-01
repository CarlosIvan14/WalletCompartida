import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Falta la variable de entorno MONGODB_URI. Configúrala en .env.local (desarrollo) o en Vercel (producción)."
    );
  }

  if (process.env.NODE_ENV === "development") {
    // En desarrollo reutilizamos la conexión entre recargas (hot reload).
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

// La conexión se abre de forma perezosa, solo cuando getDb() se invoca en
// tiempo de ejecución (nunca durante `next build`).
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db();
}

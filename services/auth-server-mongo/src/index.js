import mongoConnector from '@hydre/datas-mongo'
import authServer from '@hydre/auth-core'

const { MONGO_URI = 'mongodb://localhost:27017', COLLECTION = 'users', DATABASE = 'authentication', RETRIES = 5 } = process.env

void async function() {
  const { connect, crud } = mongoConnector({ uri: MONGO_URI, collection: COLLECTION, db: DATABASE, maxRetries: RETRIES })
  await connect()
  await authServer(crud)
}()
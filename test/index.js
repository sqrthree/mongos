const mongoose = require('mongoose')
const dotenv = require('dotenv')
const test = require('ava')

const Mongos = require('../dist/index').default

dotenv.config()

const mongoConfig = {
  host: process.env.HOST,
  database: process.env.DB,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
}
const { Schema } = mongoose

const userSchema = new Schema(
  {
    username: String,
    avatar: String,
  },
  {
    timestamps: true,
  }
)

/**
 * Silent log
 */
console.debug = console.info = console.warn = console.error = () => {}

test('should init models on connection', (t) => {
  const mongo = new Mongos(mongoConfig)

  const UserModel = mongo.connection.model('User', userSchema)

  t.is(Object.keys(mongo.connection.models).length, 1)
  t.is(mongo.connection.models.User, UserModel)
})

test('should connect to the MongoDB server automatically', (t) => {
  const mongo = new Mongos(mongoConfig)

  t.is(mongo.connection.readyState, 2)
})

test('should connect to the MongoDB server manually', async (t) => {
  const mongo = new Mongos(mongoConfig, {
    lazyConnect: true,
  })

  t.is(mongo.connection.readyState, 0)

  await mongo.connect()

  t.is(mongo.connection.readyState, 1)
})

test('should close the connection', async (t) => {
  const mongo = new Mongos(mongoConfig, {
    lazyConnect: true,
  })

  t.is(mongo.connection.readyState, 0)

  await mongo.connect()

  t.is(mongo.connection.readyState, 1)

  await mongo.disconnect()

  t.is(mongo.connection.readyState, 0)
})

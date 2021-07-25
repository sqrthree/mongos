# mongos

An opinionated mongoose wrapper.

## Install

```bash
npm install @sqrtthree/mongos
```

## Usage

```ts
import Mongos from '@sqrtthree/mongos'

const mongo = new Mongos(dbConfig: DBConfig, config?: Config, connectOptions?: ConnectOptions)

mongo.connection.model('User', userSchema)
```

## Options

### DBConfig: `Object`

The Object will be formatted to [Standard Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/#standard-connection-string-format) string with [sqrthree/mongoose-helper](https://github.com/sqrthree/mongoose-helper#makeconnectionurioptions).

### Config.lazyConnect: `boolean`

By default, When a new Mongos instance is created, it will connect to MongoDB server automatically. If you want to keep the instance disconnected until call `connect` manually, you can pass the lazyConnect option to the `true`.

### Config.logger: `Object`

A logger used to output event messages.

### ConnectOptions

See [mongoosejs.com/docs/connections.html#options](https://mongoosejs.com/docs/connections.html#options) to get more details.

---

> [sqrtthree.com](https://sqrtthree.com/) &nbsp;&middot;&nbsp;
> GitHub [@sqrthree](https://github.com/sqrthree) &nbsp;&middot;&nbsp;
> Twitter [@sqrtthree](https://twitter.com/sqrtthree)

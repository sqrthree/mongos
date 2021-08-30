import _ from 'lodash'
import mongoose, { Connection, ConnectOptions } from 'mongoose'

import { makeConnectionURI } from '@sqrtthree/mongoose-helper'

interface ExtraHostOption {
  host: string
  port?: number
}
interface DBConfig {
  host: string
  port?: number
  extras?: ExtraHostOption[]
  database: string
  username?: string
  password?: string
  options?: Record<string, string>
}

interface Logger {
  debug(message?: any, ...optionalParams: any[]): void
  info(message?: any, ...optionalParams: any[]): void
  warn(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
}

interface Config {
  lazyConnect?: boolean
  logger: Logger
}

export default class Mongo {
  config: Config

  dbConfig: DBConfig

  connectOptions: ConnectOptions

  connectionURI: string

  connection: Connection

  constructor(
    dbConfig: DBConfig,
    config?: Partial<Config>,
    connectOptions?: ConnectOptions
  ) {
    this.dbConfig = _.assign(
      {
        port: 27017,
      },
      dbConfig
    )

    this.config = _.assign(
      {
        lazyConnect: false,
        logger: console,
      },
      config
    )

    this.connectOptions = _.assign({}, connectOptions)
    this.connectionURI = makeConnectionURI(this.dbConfig)

    if (this.config.lazyConnect) {
      // Initialize now, connect later
      this.connection = mongoose.createConnection()
    } else {
      this.connection = mongoose.createConnection(
        this.connectionURI,
        this.connectOptions
      )

      this.connection.asPromise().catch((err) => {
        this.config.logger.error(
          `Caught an error occurs on the connection when Mongoose starts making its initial connection to the MongoDB server. Error: ${err.message}`
        )
      })
    }

    this.connection.on('connecting', () => {
      let message = `Start making initial connection to the MongoDB database ${this.dbConfig.database}`

      if (this.dbConfig.username) {
        message += ` with user ${this.dbConfig.username}`
      }

      this.config.logger.debug(message)
    })

    this.connection.on('connected', () => {
      let message = `Connected to MongoDB database ${this.dbConfig.database}`

      if (this.dbConfig.username) {
        message += ` with user ${this.dbConfig.username}`
      }

      this.config.logger.info(message)
    })

    this.connection.on('fullsetup', () => {
      this.config.logger.debug(
        "You're connecting to a replica set and Mongoose has successfully connected to the primary and at least one secondary."
      )
    })

    this.connection.on('disconnected', () => {
      this.config.logger.warn('Mongoose lost connection to the MongoDB server.')
    })

    this.connection.on('reconnected', () => {
      this.config.logger.warn(
        'Mongoose lost connectivity to MongoDB and successfully reconnected.'
      )
    })

    this.connection.on('reconnectFailed', () => {
      this.config.logger.error(
        'Mongoose lost connectivity to MongoDB and has run out of reconnectTries.'
      )
    })

    this.connection.on('error', (err) => {
      this.config.logger.error(
        `Caught an error occurs on the connection. Error: ${err.message}`
      )
      this.config.logger.error(err)
    })
  }

  connect(): Promise<Connection> {
    return this.open()
  }

  open(): Promise<Connection> {
    // If the connection is already open, return it.
    // otherwise, open a new connection.
    // and always return the promise of the connection. due to https://github.com/Automattic/mongoose/blob/9de60a771e37cc2fcb7af3d805294b49239aed17/lib/connection.js#L701-L715
    // https://github.com/Automattic/mongoose/issues/9151

    // connected
    if (this.connection.readyState === 1) {
      return Promise.resolve(this.connection)
    }

    // connecting
    if (this.connection.readyState === 2) {
      // Ues callback to wait for the connection.
      // https://github.com/Automattic/mongoose/blob/9de60a771e37cc2fcb7af3d805294b49239aed17/lib/connection.js#L708
      return new Promise((resolve, reject) => {
        this.connection.openUri(
          this.connectionURI,
          this.connectOptions,
          (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve(this.connection)
          }
        )
      })
    }

    return this.connection.openUri(this.connectionURI, this.connectOptions)
  }

  disconnect(force?: boolean): Promise<void> {
    return this.close(force)
  }

  close(force?: boolean): Promise<void> {
    return this.connection.close(force)
  }
}

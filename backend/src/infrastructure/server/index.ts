import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import routesRouter from '../../adapters/inbound/http/routes'
import complianceRouter from '../../adapters/inbound/http/compliance'
import bankingRouter from '../../adapters/inbound/http/banking'
import poolsRouter from '../../adapters/inbound/http/pools'
import { initDb } from '../../infrastructure/db'

dotenv.config()

const app = express()
app.use(bodyParser.json())

app.use('/routes', routesRouter)
app.use('/compliance', complianceRouter)
app.use('/banking', bankingRouter)
app.use('/pools', poolsRouter)

const port = process.env.PORT || 4000

const useInMemory = process.env.USE_IN_MEMORY === 'true'

if (useInMemory) {
  app.listen(port, () => console.log(`Server listening on ${port} (in-memory mode)`))
} else {
  initDb()
    .then(() => {
      app.listen(port, () => console.log(`Server listening on ${port}`))
    })
    .catch((err) => {
      console.error('Failed to init DB:', err.message || err)
      process.exit(1)
    })
}

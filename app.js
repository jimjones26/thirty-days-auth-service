const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./routes/userRoutes')

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again in 1 hour.'
})

const app = express()
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(helmet())
app.use(xss())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

// limit the amount of requests an ip can make in a time
app.use(limiter)

// limit size of json payload
app.use(express.json({ limit: '10kb' }))

// data sanitization against XSS
app.use(xss())
app.use((req, res, next) => {
  console.log('request time: ', new Date().toISOString())

  next()
})

app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app

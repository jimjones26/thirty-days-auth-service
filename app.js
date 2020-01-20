const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./routes/userRoutes')

const app = express()
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())
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

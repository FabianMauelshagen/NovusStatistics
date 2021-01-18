const mongoose = require('mongoose')
const express = require('express')
const port = 3000

const e = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

// Middleware
app.use(bodyParser.json())
app.use(cors())

mongoose.connect(
    'mongodb://127.0.0.1:27017/Novus', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }
)

const chatEventRouter = require('./dimensions/chatevents')
const guests = require('./dimensions/guest')
const chatSessions = require('./dimensions/chatsession')
const users = require('./dimensions/user')
const functions = require('./dimensions/function')

app.use('/chatevents', chatEventRouter)
app.use('/guests', guests)
app.use('/chatsessions', chatSessions)
app.use('/functions', functions)

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
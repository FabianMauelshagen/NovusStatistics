const mongoose = require('mongoose')
const express = require('express')
const port = 3000
var ObjectId = require('mongodb').ObjectID
var chatsessions = require('./dimensions/chatsession')
var users = require('./dimensions/user')
var time = require('./dimensions/time')

var functions = require('./dimensions/function')
const e = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')



let type = 0
let functionName = ''
 
const chatSchema = new mongoose.Schema()
const chatevent_coll = mongoose.model('chatevents', chatSchema)
const userevents_coll = mongoose.model('userevents', chatSchema)
const user_coll = mongoose.model('users', chatSchema)
const agentRatings_coll = mongoose.model('agentratings', chatSchema)
const agentSettings_coll = mongoose.model('agentratingsettings', chatSchema)
const chatsessions_coll = mongoose.model('chatsessions', chatSchema)
//const sysdiagnostics_coll = mongoose.model('systemdiagnosticdatas', chatSchema)
//const guests_coll = mongoose.model('guests', chatSchema)

let startDate = '1991-08-06'
let endDate = new Date()

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

/* app.get('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8;'
    })

    
})  */



const chatEventRouter = require('./dimensions/chatevents')
const guests = require('./dimensions/guest')
app.use('/chatevents', chatEventRouter)
app.use('/guests', guests)

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
}) 



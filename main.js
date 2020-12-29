const mongoose = require('mongoose')
const express = require('express')
const main = express()
const port = 3000
var ObjectId = require('mongodb').ObjectID
var chatsessions = require('./dimensions/chatsession')
var users = require('./dimensions/user')
var time = require('./dimensions/time')
var guests = require('./dimensions/guest')
var functions = require('./dimensions/function')
const e = require('express')
 
const chatSchema = new mongoose.Schema()
const chatevent_coll = mongoose.model('chatevents', chatSchema)
const userevents_coll = mongoose.model('userevents', chatSchema)
const user_coll = mongoose.model('users', chatSchema)
const agentRatings_coll = mongoose.model('agentratings', chatSchema)
const agentSettings_coll = mongoose.model('agentratingsettings', chatSchema)
const chatsessions_coll = mongoose.model('chatsessions', chatSchema)
const sysdiagnostics_coll = mongoose.model('systemdiagnosticdatas', chatSchema)
const guests_coll = mongoose.model('guests', chatSchema)

let startDate = '1991-08-06'
let endDate = new Date()

mongoose.connect(
    'mongodb://127.0.0.1:27017/Novus', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }
)

main.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8;'})
    
         startDate = time.getLastMonth()[0]
        endDate = time.getLastMonth()[1]  
        functions.calcDuration(startDate, endDate, chatevent_coll, 1).then(function(array){
            res.write('chatsessions.getDurations: // Sitzungen (Anzahl Sitzungen die berechnet werden konnten,<br> also Daten zu Beitritt und Austritt vorhanden)' +
            '<br> und deren Länge (Zeit zwischen erstem Gastbeitritt und letzten Gastaustritt),<br> sowie kürzeste, längste und durchschn. Sitzung <br>')
             /* for(elem of array[0]){
                res.write('<br>ID: ' + elem.type)
                res.write('<br>Start der Funktion: ' + elem.startTime)
                res.write('<br>Stop der Funktion: ' + elem.stopTime)
                res.write('<br>Dauer der Nutzung: ' + elem.duration + '<br><br>')
            }  */
            res.write('<br>Anzahl Nutzungen: ' + array[1][0])
            res.write('<br>Kürzeste Nutzung: ' + array[1][1])
            res.write('<br>Längste Nutzung: ' + array[1][2])
            res.write('<br>Durchschnittliche Länge: ' + array[1][3])
        })  

        functions.calcEachDay(startDate, endDate, chatevent_coll, 0).then(function(array){
            for(elem of array){
                res.write('<br>Anzahl Nutzungen: ' + elem[1][0])
                res.write('<br>Kürzeste Nutzung: ' + elem[1][1]) 
                res.write('<br>Längste Nutzung: ' + elem[1][2])
                res.write('<br>Durchschnittliche Länge: ' + elem[1][3])
            }
        })
})

main.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})


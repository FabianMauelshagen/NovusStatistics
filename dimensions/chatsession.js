const express = require('express')
const router = express.Router()
const Model = require('../dimensions/models')

// Erster Guest Joined und Letzter GuestLeft von allen Chat Sessions
function chatSessionAggregate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let array = []
    Model.chatevent_coll.aggregate([{
      $match: {
        $and: [{
          createdAt: {
            $gt: new Date(startDate)
          }
        }, {
          createdAt: {
            $lt: new Date(endDate)
          }
        }]
      }
    }, {
      $match: {
        $or: [{
          type: 'guestJoined'
        }, {
          type: 'guestLeft'
        }]
      }
    }, {
      $project: {
        user: 1,
        chatSession: 1,
        createdAt: 1,
        type: 1,
        datetime: {
          '$dateToString': {
            'format': '%H:%M:%S',
            'date': '$createdAt'
          }
        }
      }
    }, {
      $group: {
        _id: '$chatSession',
        max: {
          $max: '$datetime'
        },
        min: {
          $min: '$datetime'
        },
        createdAt: {
          $first: '$createdAt'
        }
      }
    }, {
      $addFields: {
        duration: new Date('')
      }
    }, {
      $sort: {
        createdAt: 1
      }
    }], function (err, result) {
      array = result
      resolve(array)
    })
  })
}

// Extraktion der Min Max Werte und Berechnung der Sitzungsdauer (Unvollständige Datensätze werden ignoriert)
// Promise return Value:
// array[0] = (Array) Erster und letzter Gastbeitritt pro ChatSession (Field: _id, min, max, duration(=Füllvariable))
// array[1] = (Array) Längste und kürzeste Sitzung (stats[0] = (Number) ChatSessions Gesamt, stats[1] = (String) kürzeste Sitzung, ...
// ... stats[2] = (String) längste Sitzung, stats[3] = (String) Durchschn. Sitzungslänge)
function getDurations(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    chatSessionAggregate(startDate, endDate).then(function (array) {
      let first = ''
      let last = ''
      let long = 0
      let short = 0
      let i = 0
      let totalDur = 0
      let avgDur = 0
      let durations = []
      let stats = []
      for (elem of array) {
        if (!(elem.min == elem.max)) {
          first = calcTime(elem.min)
          last = calcTime(elem.max)
          let diff = last.getTime() - first.getTime()
          if (short == 0 || diff < short) {
            short = diff;
          }
          if (long == 0 || diff > long) {
            long = diff;
          }
          totalDur += diff
          let sessionDuration = new Date(diff)
          durations[i] = elem
          durations[i].duration = sessionDuration.getTime()
          i++
        }
      }
      avgDur = new Date((totalDur / i))
      let longestDuration = new Date(long)
      let shortestDuration = new Date(short)
      stats[0] = i
      stats[2] = Math.ceil(shortestDuration.getTime() / 60000)
      stats[3] = Math.ceil(longestDuration.getTime() / 60000)
      stats[1] = Math.ceil(avgDur.getTime() / 60000)
      resolve([durations, stats])
    })
  })
}

// Time String to Date Konvertierung
function calcTime(time) {
  var date = new Date("January 1, 2000 " + time)
  return date
}

// Alle ChatSession Gründe nach Thema
function agentSettingsAggregate() {
  return new Promise(function (resolve, reject) {
    let array = []
    Model.agentSettings_coll.aggregate([{
      $project: {
        _id: 1,
        title: 1
      }
    }, {
      $addFields: {
        count: 0
      }
    }, {
      '$redact': {
        '$cond': [
          {
            '$lt': [
              {
                '$strLenCP': '$title'
              }, 30
            ]
          }, '$$KEEP', '$$PRUNE'
        ]
      }
    }], function (err, result) {
      array = result
      resolve(array)
    })
  })
}

// Anzeige der Häufigkeit einzelner ChatSession Themen (Grund für die Sitzung nach Agentrating Theme). 
// array[0] = (Array) Allen Themen mit absoluter Häufigkeit 
// array[1] = (Array) Min Statistik -> array[1][0] = (Array) Seltenste Themen, array[1][1] = (Number) Anzahl
// array[2] = (Array) Max Statistik -> array[2][0] = (Array) Häufigste Themen, array[2][1] = (Number) Anzahl
// array[3] = (Array) Nicht genutzten Themen (Anzahl = 0)
function ratingsAggregate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    agentSettingsAggregate().then(function (array) {
      Model.agentRatings_coll.aggregate([{
        $match: {
          $and: [{
            createdAt: {
              $gt: new Date(startDate)
            }
          }, {
            createdAt: {
              $lt: new Date(endDate)
            }
          }]
        }
      }, {
        $project: {
          chatSession: 1,
          agentRatingSettings: 1,
          createdAt: 1
        }
      }], function (err, result) {
        let maxWert = 0
        let minWert = 0
        let maxThema = []
        let minThema = []
        let minStats = []
        let maxStats = []
        let used = []
        let notUsed = []
        //Alle Dokumente aus der agentRatings Collection
        for (rt of result) {
          // Alle Objekte aus dem agentRatingSettings Array innerhalb eines rt Dokuments
          for (ars of rt.agentRatingSettings) {
            // Alle gespeicherten ChatSession Themen (Title aus agentRatingSettings Collection) zum Vergleich mit den rt-Array Werten
            for (elem of array) {
              // Bei übereinstimmenden Werten, inkrementieren der count Variable innerhalb des agentRatingSettings Arrays
              if (elem._id.equals(ars.agentRatingSetting)) {
                elem.count++
              }
            }
          }
        }
        // Erneutes analysieren des Arrays mit abgleich von nicht genutzten Themen sowie Max und Min Werten
        for (elem of array) {
          if (elem.count == 0) {
            notUsed[notUsed.length] = elem.title
          } else {
            used[used.length] = elem
          }
          if (maxWert == 0 || maxWert < elem.count) {
            maxWert = elem.count
          }
          if (minWert == 0 || (minWert > elem.count && elem.count != 0)) {
            minWert = elem.count
          }
        }
        // Auslesen der den Max und Min Werten entsprechenden Themen
        for (elem of array) {
          if (elem.count == minWert) {
            minThema[minThema.length] = elem.title
          } else if (elem.count == maxWert) {
            maxThema[maxThema.length] = elem.title
          }
        }
        minStats[0] = minThema
        minStats[1] = minWert
        maxStats[0] = maxThema
        maxStats[1] = maxWert
        let stats = [minStats, maxStats, notUsed]
        resolve([used, stats])
      })

    })
  })
}

// Alle Chatsessions nach Datum, mit allen in der Chatsession benutzten Funktionen in chronologischer Nutzungsreihenfolge
// elem of array:
//      (Number) elem._id = ChatSession ID
//      (Array)  elem.functions:
//                 (String) Type = Funtions Typ
//                 (Date) createdAt = Startdatum der Funktion
function getUsedFunctionsInOrder(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    Model.chatevent_coll.aggregate([
      {
        '$match': {
          '$and': [
            {
              'createdAt': {
                '$gt': new Date(startDate)
              }
            }, {
              'createdAt': {
                '$lt': new Date(endDate)
              }
            }
          ]
        }
      }, {
        '$match': {
          '$and': [
            {
              'type': {
                '$regex': new RegExp('Changed')
              }
            }, {
              'type': {
                '$not': new RegExp('recordingChanged')
              }
            }, {
              '$or': [
                {
                  'data.action': 'started'
                }, {
                  'data.action': 'opened'
                }
              ]
            }
          ]
        }
      }, {
        '$group': {
          '_id': {
            '_id': '$chatSession', 
            'type': '$type'
          }, 
          'count': {
            '$sum': 1
          }, 
          'createdAt': {
            '$first': '$createdAt'
          }
        }
      }, {
        '$project': {
          '_id': '$_id._id', 
          'type': '$_id.type', 
          'createdAt': '$createdAt'
        }
      }, {
        '$sort': {
          '_id': -1, 
          'createdAt': 1
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'createdAt': {
            '$first': '$createdAt'
          }, 
          'functions': {
            '$push': {
              'type': '$type', 
              'timestamp': '$createdAt'
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$functions'
        }
      },  {
        '$sort': {
          'createdAt': 1, 
          '_id': 1
        }
      },{
        '$project': {
          '_id': 1, 
          'createdAt': {
              $dateToString: {
                format: "%G-%m-%d",
                date: '$createdAt'
              }   
          },
          'type': '$functions.type', 
          'timestamp':  {
            $dateToString: {
              format: "%H:%M:%S",
              date: '$functions.timestamp'
            }   
        },
        }
      }
    ], function (err, result) {
      resolve(result)
    })
  })
}

/* function getTotal(Model){
  return new Promise(function(resolve, reject){
    let total = 0
    Model.aggregate([
      {
        $group: {
          _id: null, 
          count: {
            $sum: 1
          }
        }
      }
    ], function(err, result){
      total = result[0].count
      resolve(total)
    })
  })
} */

// Anzahl an Chatsessions Gesamt
function getTotalByDate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let total = 0
    Model.chatsessions_coll.aggregate([{
      $match: {
        $and: [{
          createdAt: {
            $gt: new Date(startDate)
          }
        }, {
          createdAt: {
            $lt: new Date(endDate)
          }
        }]
      }
    }, {
      $group: {
        _id: null,
        count: {
          $sum: 1
        }
      }
    }], function (err, result) {
      if(result[0]) total = result[0].count
      resolve(total)
    })
  })
}

// Gesamtzahl Guests und Agents by Date
// totals[0] = (Number) aktive Guests
// totals[1] = (Number) atkvie Agents
function getTotalGAByDate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let totals = [0, 0]
    Model.chatsessions_coll.aggregate([{
      $match: {
        $and: [{
          createdAt: {
            $gt: new Date(startDate)
          }
        }, {
          createdAt: {
            $lt: new Date(endDate)
          }
        }]
      }
    }, {
      $project: {
        _id: 1,
        activeGuests: {
          $cond: {
            if: {
              $isArray: '$guests'
            },
            then: {
              $size: '$guests'
            },
            else: 0
          }
        },
        activeAgents: {
          $cond: {
            if: {
              $isArray: '$agents'
            },
            then: {
              $size: '$agents'
            },
            else: 0
          }
        }
      }
    }, {
      $group: {
        _id: null,
        activeGuests: {
          $sum: '$activeGuests'
        },
        activeAgents: {
          $sum: '$activeAgents'
        }
      }
    }], function (err, result) {
      if(result[0]){
        totals[0] = result[0].activeGuests
        totals[1] = result[0].activeAgents
      }
      resolve(totals)
    })
  })
}

// Durchschnitts Statistik, 
//avgs[0] = (Number) Gesamtzahl Chatsessions 
//avgs[1] = (Number) Total Guests
//avgs[2] = (Number) Durchschnitt Guests pro Session
//avgs[3] = (Number) Total Agents
//avgs[4] = (Number) Durchschnitt Agents pro Session
function getAvgStats(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let avgGuests = 0
    let avgAgents = 0
    let avgs = []
    getTotalByDate(startDate, endDate).then(function (total) {
      getTotalGAByDate(startDate, endDate).then(function (totals) {

        avgGuests = totals[0] / total
        avgAgents = totals[1] / total
        avgs[0] = total
        avgs[1] = totals[0]
        avgs[2] = Math.round((avgGuests + Number.EPSILON) * 1000) / 1000
        avgs[3] = totals[1]
        avgs[4] = Math.round((avgAgents + Number.EPSILON) * 1000) / 1000
        resolve(avgs)

      })
    })
  })
}

router.get('/getDurations', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getDurations(startDate, endDate))

  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/getAvgStats', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getAvgStats(startDate, endDate))

  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/getUsedFunctions', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getUsedFunctionsInOrder(startDate, endDate))

  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/ratingsAggregate', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await ratingsAggregate(startDate, endDate))
  } catch (err) {
    res.send('Error ' + err)
  }
})



// Test Aufrufe innerhalb der main.js Datei


/* // Sitzungen (Anzahl Sitzungen die berechnet werden konnten, also Daten zu Beitritt und Austritt vorhanden) ...
       // ... und deren Länge (Zeit zwischen erstem Gastbeitritt und letzten Gastaustritt), sowie kürzeste, längste und avg. Sitzung
       startDate = time.getSpecificDate('2020-10-21')[0]
       endDate = time.getSpecificDate('2020-10-21')[1]
       chatsessions.getDurations(startDate, endDate, chatevent_coll).then(function(array){
           res.write('chatsessions.getDurations: // Sitzungen (Anzahl Sitzungen die berechnet werden konnten,<br> also Daten zu Beitritt und Austritt vorhanden)' +
           '<br> und deren Länge (Zeit zwischen erstem Gastbeitritt und letzten Gastaustritt),<br> sowie kürzeste, längste und durchschn. Sitzung <br>')
            for(elem of array[0]){
               res.write('<br>ID: ' + elem._id)
               res.write('<br>Erster Gastzutritt: ' + elem.min)
               res.write('<br>Letzter Gastaustritt: ' + elem.max)
               res.write('<br>Dauer der Sitzung: ' + elem.duration + '<br><br>')
           } 
           res.write('<br>Anzahl Sitzungen: ' + array[1][0])
           res.write('<br>Kürzeste Sitzung: ' + array[1][1])
           res.write('<br>Längste Sitzung: ' + array[1][2])
           res.write('<br>Durchschnittliche Länge: ' + array[1][3])
       })   */

/* // ChatSession Gründe (Fallabschluß, Kredit etc..) und Ihre Häufigkeit
startDate = time.getTimeSpan('2020-10-15', '2020-10-18')[0]
endDate = time.getTimeSpan('2020-10-15', '2020-10-18')[1]
res.write('<br>Startdatum: ' + startDate + '<br>Enddatum: ' + endDate)

 chatsessions.ratingsAggregate(startDate, endDate, agentSettings_coll, agentRatings_coll).then(function(array){
    res.write('<br><br>chatsession.ratingsAggregate: // ChatSession Gründe (Fallabschluß, Kredit etc..) und Ihre Häufigkeit')
    for(elem of array[0]){
        res.write('Thema: ' + elem.title + '<br>Count: ' + elem.count + '<br>')
    }
    res.write('<br><br>Seltenste Themen: (Anzahl: ' + array[1][1] + ')')
    for(elem of array[1][0]){
        res.write('<br>' + elem)
    }
    res.write('<br><br>Häufigste Themen: (Anzahl: ' + array[2][1] + ')')
    for(elem of array[2][0]){
        res.write('<br>' + elem)
    }
    res.write('<br><br>Nicht genutzte Themen: ')
    for(elem of array[3]){
        res.write('<br>' + elem)
    }
}) */

//Chatsessions mit den in der Session benutzten Funktionen in chronologisch richtiger Reihenfolge, separierbar nach einem Datum.
/* startDate = '2020-08-28'
endDate = '2020-08-31'
res.write('<br>Startdatum: ' + startDate + '<br>Enddatum: ' + endDate)
chatsessions.getUsedFunctionsInOrder(startDate, endDate, chatevent_coll).then(function(array){
    res.write('<br><br>chatsession.getUsedFunctionInOrder: //Chatsessions mit den in der Session benutzten <br>Funktionen in chronologisch richtiger Reihenfolge, separierbar nach einem Datum.')
    for(elem of array){
        res.write('<br><br>ChatSession: ' + elem._id)
        for(funct of elem.functions){
            res.write('<br>Type: ' + funct.type + ' | CreatedAt: ' + funct.createdAt.toLocaleTimeString('de-DE', {timeZone: 'UTC'}))
        }
    }
});   */

/* startDate = time.getLastQuarter()[0]
endDate = time.getLastQuarter()[1]
//Chatsession Anzahl mit Zeitspanne
chatsessions.getTotalByDate(startDate, endDate, chatsessions_coll).then(function(total){
    res.write('<br><br>chatsession.getTotal: //Chatsession Anzahl mit Zeitspanne<br>')
    res.write('<br>Chatsessions zwischen <br>' + startDate + '<br> und <br>' + endDate + ':<br> ' + total)
}) */

/* //ChatSession Stats (Gesamt ChatSessions, Durchschn. Guests/Agents pro Session)
        chatsessions.getAvgStats(startDate, endDate, chatsessions_coll).then(function(avgs){
            res.write('<br><br>chatsession.getAvgStats: //ChatSession Stats (Gesamt ChatSessions, Durchschn. Guests/Agents pro Session)<br>')
            res.write('Zeitraum: ' + startDate + ' - ' + endDate + '<br>')
            res.write('Gesamtzahl ChatSessions: ' + avgs[0] + '<br>Durchschnittlich angemeldete Guests: ' + avgs[1] + '<br>Durchschnittlich angemeldete Agents: ' + avgs[2])
        })  */

module.exports = router;
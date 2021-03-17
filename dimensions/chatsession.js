const express = require('express')
const router = express.Router()
const Model = require('../dimensions/models')

// Erster Guest Joined und Letzter GuestLeft von allen Chat Sessions, Genutzt für die Berechnung der Sitzungsdauer
function chatSessionAggregate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let array = []
    Model.chatevent_coll.aggregate([{
      // Zeit Filter
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
      // Filter für Zutritt und Austritt
      $match: {
        $or: [{
          type: 'guestJoined'
        }, {
          type: 'guestLeft'
        }]
      }
    }, {
      // Festlegen der anzuzeigenden Felder
      $project: {
        user: 1,
        chatSession: 1,
        createdAt: 1,
        type: 1,
        // Formatierung des Timestamps in Uhrzeit String
        datetime: {
          '$dateToString': {
            'format': '%H:%M:%S',
            'date': '$createdAt'
          }
        }
      }
    }, {
      // Gruppieren nach Chat_id, Anzeige der frühesten (min) und spätesten (max) Werts
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
      //  Neues Feld  für nachträgliche Speicherung der berechneten Dauer
      $addFields: {
        duration: new Date('')
      }
    }, {
      // Sortieren nach ID
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
      let first = '' // Erster Beitritt
      let last = '' // Letzter Austritt
      let long = 0  // längste Zeit
      let short = 0 // Kürzeste Zeit
      let i = 0 // Counter
      let totalDur = 0 // Gesamte Duaer
      let avgDur = 0 // Durchschnittliche Duaer
      let durations = [] // Array mit den berechneten Zeitwerten
      let stats = [] // Array für die fertigen Zeit Statistiken (Min, Max, Avg)
      for (elem of array) {
        // Ausschluss von Fehlerhaften und 0 Werten
        if (!(elem.min == elem.max)) {
          first = calcTime(elem.min)
          last = calcTime(elem.max)
          // Berechnet die Zeit in Millisekunden die zwischen den zwei Daten first und last vergangen ist
          let diff = last.getTime() - first.getTime()
          // true wenn short noch nicht belegt wurde oder der neue Wert kleiner als der bereits gespeicherte Wert ist.
          if (short == 0 || diff < short) {
            short = diff;
          }
          // true wenn long noch nicht belegt wurde oder der neue Wert kleiner als der bereits gespeicherte Wert ist.
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
      // Belegen des Statistik Arrays mit den fertigen Werten
      stats[0] = i
      //  Math.ceil zum aufrunden, da in den Diagrammen nur volle Minuten angezeigt werden und somit auch Werte < 60 Sekunden angezeigt werden
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
      // Auswahl der Felder
      $project: {
        _id: 1,
        title: 1
      }
    }, {
      // Counter Variable zum späteren berechnen der Gesamtanzahl
      $addFields: {
        count: 0
      }
    }, {
      // Begrenzung des Ausgabe Strings auf 30 Zeichen zum Ausschluss von Fehlerhaften Daten
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
        // Zeitfilter
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
        // Auswahl Felder
        $project: {
          chatSession: 1,
          agentRatingSettings: 1,
          createdAt: 1
        }
      }], function (err, result) {
        // Anzahl des Wertes der am meisten vorkam
        let maxWert = 0
        // Anzahl des Wertes der am wenigsten vorkam
        let minWert = 0
        // Falls mehrere Themen am meisten vorkamen
        let maxThema = []
        // Falls mehrere Themen am wenigsten vorkamen (Häufig)
        let minThema = []
        // Speichern der minWerte und minThemen
        let minStats = []
        // Speichern der maxWerte und maxThemen
        let maxStats = []
        // Speichern der Themen mit Nutzung > 0
        let used = []
        // Speichern der Themen mit Nutzung = 0
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
          // true wenn maxWert noch nicht belegt oder neuer Wert größer wie aktuell gespeichert
          if (maxWert == 0 || maxWert < elem.count) {
            maxWert = elem.count
          }
          // selbe wie maxWert nur 0 Werte werden ignoriert
          if (minWert == 0 || (minWert > elem.count && elem.count != 0)) {
            minWert = elem.count
          }
        }
        // Auslesen der den Max und Min Werten entsprechenden Themen
        for (elem of array) {
          if (elem.count == minWert && elem.count > 0) {
            minThema[minThema.length] = elem.title
          } else if (elem.count == maxWert && elem.count > 0) {
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
        // Zeitfilter
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
        // Filter nach Funktionen
        '$match': {
          '$and': [
            {
              'type': {
                // Mit allen Werte die "Changed" beinhalten
                '$regex': new RegExp('Changed')
              }
            }, {
              'type': {
                // Ohne alle Werte die "recordingChanged" beinhalten
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
        // Grupieren nach ChatSession und innerhalb dieser nach Funktionsytyp
        '$group': {
          '_id': {
            '_id': '$chatSession', 
            'type': '$type'
          }, 
          // Zählen der Funktionsnutungen
          'count': {
            '$sum': 1
          }, 
          // Anhängen des Timestamps zur Funktionsnutzung
          'createdAt': {
            '$first': '$createdAt'
          }
        }
      }, {
        // Auswahl der Felder
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
        // Neues Gruppieren und Ablegen der Funktionen in functions Array (Ausschluss von doppelten Dokumenten)
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
        // Aufteilen des Dokuments in eigene Dokumente nach den Werten des functions Arrays
        '$unwind': {
          'path': '$functions'
        }
      },  {
        // Sortieren zuerst nach Zeit dann nach ID
        '$sort': {
          'createdAt': 1, 
          '_id': 1
        }
      },{
        // Formatieren der Ausgabe Dokumente
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

// Anzahl an Chatsessions Gesamt
function getTotalByDate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    let total = 0
    Model.chatsessions_coll.aggregate([{
      //  Zeitfilter
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
      // Gruppieren nach der Count Variablen
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
      // Zeitfilter
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
      //Auswahl Felder -> Anzahl Gäste / Berater pro Dokument
      $project: {
        _id: 1,
        activeGuests: {
          $cond: {
            // true wenn das array "guests" existiert
            if: {
              $isArray: '$guests'
            },
            // Wenn true: Größe des "guests" arrays (also Anzahl Gäste)
            then: {
              $size: '$guests'
            },
            // false: 0 (Keine Gäste)
            else: 0
          }
        },
        // Selbes Vorgehen wie bei Gästen
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
      // Zusammenzählen der Gäste und Agents für alle Dokumente
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

// Get Funktion für den Aufruf im Frontend über den '/xx' Pfad
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
const express = require('express')
const router = express.Router()
const Model = require('../dimensions/models')

// Anzahl der Nutzungen einer Funktion pro Stunde eines Tages (type = Funktion, action = Funktions Aktion started/opened etc., from/to = Uhrzeit in Stunden)
function getBusyTimesForEach(startDate, endDate, from, to, action, type) {
  try {
    return Model.chatevent_coll.aggregate([{
      // Zeit Filterung = >= startDate und <= endDate <<<--- In jeder Funktion gleich!
      '$match': {
        '$and': [{
          'createdAt': {
            '$gte': new Date(startDate)
          }
        }, {
          'createdAt': {
            '$lte': new Date(endDate)
          }
        }]
      }
    }, {
      // Abgleich
      '$match': {
        // Und Operator
        '$and': [{
          // Beispiel type = Whiteboard, action = Opened
          'data.action': action
        }, {
          'type': type
        }]
      }
    }, {
      // Feldbezeichner die ausgegeben werden sollen
      '$project': {
        '_id': 0,
        'type': 1,
        'hours': {
          '$hour': '$createdAt'
        },
        'datetime': {
          '$dateToString': {
            'format': '%H:%M:%S',
            'date': '$createdAt'
          }
        }
      }
    }, {
      // Filtern nach Stunden
      '$match': {
        '$and': [{
          'hours': {
            '$gte': from
          }
        }, {
          'hours': {
            '$lt': to
          }
        }]
      }
    }, {
      '$sort': {
        'datetime': 1
      }
    }, {
      // Gruppieren nach hours (alle Starts um 8 Uhr summieren, alle um 9 Uhr summieren etc.)
      '$group': {
        '_id': '$hours',
        'count': {
          '$sum': 1
        }
      }
    }, {
      // Letzte Sortierung, Array wird in aufsteigender Reihenfolge in Diagramm Label angelegt
      '$sort': {
        '_id': 1
      }
    }])
  } catch (e) {
    console.log(e)
  }
}

// Loop der getBusyTimesForEach Funktion für alle Funktionstypen + Generierung der fertigen Stunden Arrays
// Die Indexstellen sind dabei die Stunden (0 = 7 Uhr, 1 = 8 Uhr etc.)
// Zur Umsetzung wird vorab jede Index Stelle mit 0 belegt, welche ddann mit den neuen Werten an den jeweiligen Stunden Positionen überschrieben wird
// Gibt es für einen Stunden Wert keinen zugehörigen count Wert (Eine Funktion wurde um 9 Uhr nicht verwendet), bleibt die 0 an der Indexstelle bestehen
async function getBusyTimesLoop(startDate, endDate) {
  let types = [{
    action: 'started',
    type: 'videoChanged',
    name: 'Video-Chat', // Spätere Label Bezeichnung
    valArr: [] // Array zur Speicherung der fertigen Stunden Werte
  }, {
    action: 'started',
    type: 'screenSharingChanged',
    name: 'Screen-Sharing',
    valArr: []
  }, {
    action: 'started',
    type: 'coBrowsingChanged',
    name: 'Co-Browsing',
    valArr: []
  }, {
    action: 'opened',
    type: 'whiteboardChanged',
    name: 'Whiteboard',
    valArr: []
  }]

  for (loopElem of types) { // Loop über die Funktionen
    let from = 7
    let to = 16
    let i = 0
    let zero = true // Prüfung ob es sich um ein reines 0 Array handelt (Funktion wurde nicht benutzt)
    const res = await getBusyTimesForEach(startDate, endDate, from, to, loopElem.action, loopElem.type)
    for (from; from <= to; from++) {
      loopElem.valArr[i] = 0 // Index Stelle mit 0 belegen

      for (val of res) { // Loop über das Return Array aus getBusyTimesForEach
        if (from == val._id) { // Abgleich ob Stunden Wert vorhanden
          loopElem.valArr[i] = val.count // true = Füllen des Werte-Arrays mit der Count Variablen
          zero = false // Ein einzige nicht 0 Wert reicht um zero mit false zu belegen
        }
      }
      i++
    }
    if (zero) loopElem.valArr.length = 0 // Wenn die Funktion nicht benutzt wurde wird das Werte-Array geleert
    // Bei fehlenden Werten soll "Keine Daten vorhanden" angezeigt werden
  }
  return types
}

// Kumulierte Funktionsnutzungen pro Stunde für alle  Funktionen
function getBusyTimes(startDate, endDate, from, to) {
  const res = Model.chatevent_coll.aggregate([{
    //Zeitfilter
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
    // Filtern nach Funktionen
    '$match': {
      '$or': [{
        '$and': [{
          'data.action': 'started'
        }, {
          'type': 'videoChanged'
        }]
      }, {
        '$and': [{
          'data.action': 'started'
        }, {
          'type': 'screenSharingChanged'
        }]
      }, {
        '$and': [{
          'data.action': 'started'
        }, {
          'type': 'coBrowsingChanged'
        }]
      }, {
        '$and': [{
          'data.action': 'opened'
        }, {
          'type': 'whiteboardChanged'
        }]
      }]
    }
  }, {
    // Auswahl der Felder
    '$project': {
      '_id': 0,
      'type': 1,
      'hours': {
        // Ausgabe der vollen Stunde des Timestamps
        '$hour': '$createdAt'
      },
      'datetime': {
        //Formatierung des timestamp in einen Uhrzeit String
        '$dateToString': {
          'format': '%H:%M:%S',
          'date': '$createdAt'
        }
      }
    }
  }, {
    // Filtern nach Stunden 
    '$match': {
      '$and': [{
        'hours': {
          '$gte': from
        }
      }, {
        'hours': {
          '$lt': to
        }
      }]
    }
  }, {
    // Gruppieren und summieren der Stunden
    '$group': {
      '_id': '$hours',
      'count': {
        '$sum': 1
      }
    }
  }, {
    // Sortieren der Stunden 
    '$sort': {
      '_id': 1
    }
  }])
  return res
}

// Veraltet
function getAllDurations(startDate, endDate) {
  const res = Model.chatevent_coll.aggregate([{
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
    '$match': {
      '$and': [{
        'type': {
          '$regex': new RegExp('Changed')
        }
      }, {
        'type': {
          '$not': new RegExp('recordingChanged')
        }
      }, {
        '$or': [{
          'data.action': 'started'
        }, {
          'data.action': 'stopped'
        }, {
          'data.action': 'opened'
        }, {
          'data.action': 'closed'
        }]
      }]
    }
  }, {
    '$group': {
      '_id': {
        'chatSession': '$chatSession',
        'guest': '$guest',
        'type': '$type'
      },
      'started': {
        '$first': '$createdAt'
      },
      'stopped': {
        '$last': '$createdAt'
      }
    }
  }, {
    '$project': {
      '_id': 0,
      '_chatSession': '$_id.chatSession',
      '_guest': '$_id.guest',
      'type': '$_id.type',
      'started': '$started',
      'startTime': {
        '$dateToString': {
          'format': '%H:%M:%S',
          'date': '$started'
        }
      },
      'stopped': '$stopped',
      'stopTime': {
        '$dateToString': {
          'format': '%H:%M:%S',
          'date': '$stopped'
        }
      }
    }
  }, {
    '$match': {
      '$expr': {
        '$ne': [
          '$startTime', '$stopTime'
        ]
      }
    }
  }])
  return res
}

// Alle Start und End Zeiten der jeweiligen Funktion zur weiteren Verarbeitung
function getDurations(startDate, endDate, i) {
  let types = ['coBrowsingChanged', 'videoChanged', 'screenSharingChanged', 'whiteboardChanged']
  const res = Model.chatevent_coll.aggregate([{
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
    // Filtern nach Funktionen
    '$match': {
      '$and': [{
        'type': types[i]
      }, {
        '$or': [{
          'data.action': 'started'
        }, {
          'data.action': 'stopped'
        }, {
          'data.action': 'opened'
        }, {
          'data.action': 'closed'
        }]
      }]
    }
  }, {
    //Gruppieren nach Chatsitzung, dann nach Gast, dann nach Funktionstyp
    '$group': {
      '_id': {
        'chatSession': '$chatSession',
        'guest': '$guest',
        'type': '$type'
      },
      'started': {
        '$first': '$createdAt'
      },
      'stopped': {
        '$last': '$createdAt'
      }
    }
  }, {
    // Vorbereiten der neuen Dokument Struktur
    '$project': {
      '_id': 0,
      '_chatSession': '$_id.chatSession',
      '_guest': '$_id.guest',
      'type': '$_id.type',
      'started': '$started',
      'startTime': {
        '$dateToString': {
          'format': '%H:%M:%S',
          'date': '$started'
        }
      },
      'stopped': '$stopped',
      'stopTime': {
        '$dateToString': {
          'format': '%H:%M:%S',
          'date': '$stopped'
        }
      }
    }
  }, {
    // Ausschluss der Dokumente mit gleicher Start und Stop Zeit
    '$match': {
      '$expr': {
        '$ne': [
          '$startTime', '$stopTime'
        ]
      }
    }
  }])
  return res

}

// Verarbeitung der Start und Endzeiten der Funktionen, Berechnung der Dauer sowie Durchschnitt, Min und Max Dauer
async function calcDuration(startDate, endDate, z) { // z = Index zum iterieren über die Funktionen
  let array = await getDurations(startDate, endDate, z)
  let startTime = ''
  let stopTime = ''
  let long = 0 // Längste Dauer
  let short = 0 // Kürzeste Dauer
  let i = 0 // Counter
  let totalDur = 0 // Komplette Dauer
  let avgDur = 0 // Durchschnittliche Dauer
  let durations = [] // Array mit allen Dauern
  let stats = [] // Array mit den fertigen Statistiken (Max, Min Avg)
  let type = ''
  for (elem of array) {
    startTime = calcTime(elem.startTime) // Return = Millisekunden der StartTime 
    stopTime = calcTime(elem.stopTime)
    let diff = stopTime.getTime() - startTime.getTime()
    if (short == 0 || diff < short) { // Wenn kein Wert für short oder die neue Differenz kleiner als der aktuelle short Wert ist = true
      short = diff;
    }
    if (long == 0 || diff > long) { //Selbe wie bei short
      long = diff;
    }
    totalDur += diff // Komplette Dauer kumuliert mit allen Differenzen
    let sessionDuration = new Date(diff) // Umwandeln der Millisekunden in einen Datumswert
    durations[i] = elem
    durations[i].duration = sessionDuration.toLocaleTimeString('de-DE', { // Anzeige der Dauer im Format HH:mm:ss UTC (Ohne Sommerzeit)
      timeZone: 'UTC'
    })
    i++
  }
  avgDur = new Date((totalDur / i))
  //Umwandeln der Millisekunden Werte
  let longestDuration = new Date(long)
  let shortestDuration = new Date(short)
  let date = new Date(endDate)
  //Belegen der Arrays
  stats[0] = i
  stats[1] = shortestDuration.getTime()
  stats[2] = longestDuration.getTime()
  if (!isNaN(avgDur)) { // avg = NaN wenn der Wert nicht berechnet werden konnte = Keine Zeit Werte vorhanden
    stats[3] = avgDur.getTime()
  } else {
    stats[3] = 0
  }
  stats[4] = date
  stats[5] = type

  return stats

}

// Time String to Date Konvertierung
function calcTime(time) {
  var date = new Date("January 1, 2000 " + time)
  return date
}


// Berechnung der Dauer der Funktionen für einzelne Tage über eine Zeitspanne
// Dabei wird jeder Tag dieser Zeitspanne einzeln iteriert und berechnet
// Aufruf der calcDuration Funktion mit einem übergebenen Array
async function calcEachDay(startDate, endDate, index) {
  let totals = []
  let i = 0
  let newStartDate = new Date(startDate)
  let currentDate = new Date(endDate)
  let currentStartDate = new Date(endDate)
  while (currentStartDate >= newStartDate) { // currentStartDate ist der aktuelle Tag innerhalb der Iteration, dieser wird hoch gezählt in jedem Durchgang
    var res = await calcDuration(currentStartDate, currentDate, index)
    res[4] = currentDate.getTime() // Millisekunden Wert des Datums, wird für die Anzeige im Zeitreihen Diagramm benötigt.
    totals[i] = res // Finales Speichern im Rückgabe Array
    currentStartDate.setDate(currentDate.getDate() - 1)
    currentDate.setDate(currentDate.getDate() - 1)
    currentStartDate.setHours(0, 0, 0, 0)
    i++
  }
  return totals
}

// Finaler Aufruf der calcEachDay Funktion, belegen der fertigen Arrays für die Anzeige in den Diagrammen 
async function getDurationArrays(startDate, endDate, index) {
  let minArray = {
    name: 'Minimum',
    data: []
  }
  let maxArray = {
    name: 'Maximum',
    data: []
  }
  let avgArray = {
    name: 'Durchschnitt',
    data: []
  }
  const result = await calcEachDay(startDate, endDate, index)
  for (elem of result) {
    // Math.ceil() damit aufgerundet wird und eine Zeitdauer < 1 Minute als 1 angezeigt wird (Diagramme zeigen nur ganze Minuten)
    minArray.data.push([elem[4], Math.ceil(elem[1] / 60000)]) 
    maxArray.data.push([elem[4], Math.ceil(elem[2] / 60000)])
    avgArray.data.push([elem[4], Math.ceil(elem[3] / 60000)])
  }
  return [minArray, maxArray, avgArray]
}

// Get Funktion für das Frontend, über den '/xxx' Pfad wird die Funktion über Axios aufgerufen
router.get('/getBusyTimes', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getBusyTimes(startDate, endDate, 7, 16))
  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/getBusyTimesLoop', async (req, res) => {

  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getBusyTimesLoop(startDate, endDate))
  } catch (err) {

    res.send('Error ' + err)
  }
})

router.get('/calcEachDay', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    let index = req.query.index
    res.json(await getDurationArrays(startDate, endDate, index))
  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/calcTotal', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    let index = req.query.index
    res.json(await calcDuration(startDate, endDate, index))
  } catch (err) {
    res.send('Error: ' + err)
  }
})

// Test Aufrufe innerhalb der main.js Datei


/*   //Datums und Zeitsetzung
startDate = time.getLastMonth()[0]
endDate = time.getLastMonth()[1]
let from = 7
let to = 16 */

/* res.write('<br>Startdatum: ' + startDate + '<br>Enddatum: ' + endDate)
   // Funktions Nutzungen mit Zeitstempel 
  functions.getTimes(startDate, endDate, from, to, chatevent_coll).then(function(result){
      res.write('<br><br>functions.getTimes: // Funktions Nutzungen mit Zeitstempel (Aktuell von 8 bis 10 Uhr)<br>')
      for(elem of result){
          res.write('<br>Type: ' + elem.type + ' Uhrzeit: ' + elem.datetime)
      }
  })   */

/*  // Funktions Nutzungen pro Stunde 
res.write('<br>Startdatum: ' + startDate + '<br>Enddatum: ' + endDate)
functions.getBusyTimes(startDate, endDate, from, to, chatevent_coll).then(function(result){
    res.write('<br><br>functions.getBusyTimes: // Funktions Nutzungen pro Stunde von 7 bis 16<br>')
    for(elem of result){
        res.write('<br>Uhrzeit: ' + elem._id + '-' + (elem._id + 1) + ' | Funktionen genutzt: ' + elem.count)
    }
})   */

/* // Parameter bestimmen
  type = 1 // VideoChat
  startDate = time.getTimeSpan('2020-11-01', '2020-11-07')[0]
  endDate = time.getTimeSpan('2020-11-01', '2020-11-07')[1] */

/* // Funktions Dauer über Zeitraum Gesamt mit Durchschnitt, Max und Min
functions.calcDuration(startDate, endDate, chatevent_coll, type).then(function (array) {
    switch (type) {
        case 0:
            functionName = 'Co-Browsing'
            break
        case 1:
            functionName = 'Video-Chat'
            break
        case 2:
            functionName = 'Whiteboard'
            break
        case 3:
            functionName = 'Screen-Sharing'
            break
    }
    res.write('<br><b>Funktion: ' + functionName + '</b><br>')
    if (array[1][0] != 0)
        res.write('<br><b>Anzahl Nutzungen: ' + array[1][0] +
            '</b><br><b>Kürzeste Nutzung: ' + array[1][1] +
            '</b><br><b>Längste Nutzung: ' + array[1][2] +
            '</b><br><b>Durchschnittliche Länge: ' + array[1][3] +
            '</b>')
    else
        res.write('<br><b>Anzahl Nutzungen: keine Daten' +
            '</b><br><b>Kürzeste Nutzung: keine Daten' +
            '</b><br><b>Längste Nutzung: keine Daten' +
            '</b><br><b>Durchschnittliche Länge: keine Daten</b>')
    res.write('<br>_____________<br>')
}) */

/* // Funktionsdauer über Zeitraum für jeden einzelnen Tag mit Durchschnitt, Max und Min
functions.calcEachDay(startDate, endDate, chatevent_coll, type).then(function (array) {
    for (elem of array) {
        if (elem[1][0] != 0)
            res.write('<br><b>Anzahl Nutzungen: ' + elem[1][0] +
                '</b> <br><b>Kürzeste Nutzung: ' + elem[1][1] +
                '</b> <br><b>Längste Nutzung: ' + elem[1][2] +
                '</b> <br><b>Durchschnittliche Länge: ' + elem[1][3] +
                '</b> <br><b>Datum: ' + elem[1][4] +
                '</b>')
        else
            res.write('<br>Anzahl Nutzungen: ' + elem[1][0] +
                '<br>Kürzeste Nutzung: Keine Daten' +
                '<br>Längste Nutzung: Keine Daten' +
                '<br>Durchschnittliche Länge: Keine Daten' +
                '<br>Datum: ' + elem[1][4])
        res.write('<br>')
    }
}) */


module.exports = router

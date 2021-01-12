const express = require('express')
const router = express.Router()
const Model = require('../dimensions/models')

// Browser Nutzung
// i: 0 -> Benutzter Browser, 1 -> Benutztes Betriebssystem, 2 -> Boolean hat Kamera, 3 -> Boolean hat Mikrofon, 4 -> Boolean hat Lautsprecher
function getUseCounts(startDate, endDate, i) {
  return new Promise(function (resolve, reject) {
    let fields = ['$browserName', '$osName', '$hasCamera', '$hasMicrophone', '$hasSpeakers']
    Model.sysdiagnostics_coll.aggregate([{
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
          _id: fields[i],
          count: {
            $sum: 1
          }
        }
      }, {
        $sort: {
          count: 1
        }
      }

    ], function (err, result) {
      resolve(result)
    })
  })
}

// Gesamtzahl an Guests über Zeitspanne
// Rückgabewert = (number) c -> Count der Guests
function getTotal(startDate, endDate) {

  return new Promise(function (resolve, reject) {
    Model.guests_coll.aggregate([{
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
          },
          date: {
            $first: '$createdAt'
          }
        }
      }, {
        $project: {
          date: 1,
          count: 1,
        }
      }

    ], function (err, result) {
      let c = null
      let d = 0
      for (elem of result) {
        c = elem.count
        var dateVar = new Date(elem.date)
        d = dateVar.getTime()
      }
      resolve([d, c])


    })
  })
}

// Statistik über die erfassten Gäste
// (array) result: 
//      result[0] = (array) totals = Count der erstellten Guests pro Tag über Zeitspanne
//      result[1] = (array) stats: 
//                          result[1][0] = (number) total       -> Gesamtzahl Guests
//                          result[1][1] = (number) average     -> Durchschnitt Guests / Tag
//                          result[1][2] = (number) min         -> Kleinste Anzahl Guests Gesamt
//                          result[1][3] = (number) max         -> Größte Anzahl Guests Gesamt
function getStats(startDate, endDate) {
  return new Promise(async function (resolve, reject) {
    let totals = []
    let stats = []
    let total = 0
    let avg = 0
    let min = 0
    let max = 0
    let i = 0
    let newStartDate = new Date(startDate)
    let currentDate = new Date(endDate)
    let currentStartDate = new Date(endDate)
    while (currentStartDate >= newStartDate) {
      await getTotal(currentStartDate, currentDate).then(function (res) {
        if (res[0] != 0) {
          totals[i] = res
        } else {
          totals[i] = [currentStartDate.getTime(), 0]
        }
      })
      currentStartDate.setDate(currentDate.getDate() - 1)
      currentDate.setDate(currentDate.getDate() - 1)
      currentStartDate.setHours(0, 0, 0, 0)
      i++
    }
    for (elem of totals) {
      if (min == 0 || (min > elem[1] && elem[1] != 0)) {
        min = elem[1]
      }
      if (max == 0 || max < elem[1]) {
        max = elem[1]
      }
      total += elem[1]
    }
    avg = Math.round(((total / totals.length) + Number.EPSILON) * 100) / 100
    stats[0] = total
    stats[1] = avg
    stats[2] = min
    stats[3] = max
    resolve([totals, stats])
  })
}

// Annahme / Ablehnung der Screensharing Einladung
function getInviteStats(startDate, endDate) {
  return new Promise(function (resolve, reject) {
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
        type: 'screenSharingInviteResponse'
      }
    }, {
      $group: {
        _id: '$data.action',
        count: {
          $sum: 1
        }
      }
    }], function (err, result) {
      resolve(result)
    })
  })
}



/* let startDate = time.getSpecificDate('2020-01-01')[0]
let endDate = time.getSpecificDate('2020-10-10')[1] */

// User System Statistik (Anzahl Browser Nutzung etc.)
router.get('/getUseCounts', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    let type = req.query.i
    res.json(await getUseCounts(startDate, endDate, type))

  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/getStats', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getStats(startDate, endDate))
  } catch (err) {
    res.send('Error ' + err)
  }
})

router.get('/getInviteStats', async (req, res) => {
  try {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json(await getInviteStats(startDate, endDate))
  } catch (err) {
    res.send('Error ' + err)
  }
})


// Test Aufrufe innerhalb der main.js Datei


/* // Datums Setzung
   startDate = time.getLastMonth()[0]
   endDate = time.getLastMonth()[1]
   res.write('start: ' + startDate + ' end: ' + endDate)  */

/* res.write('<br><br>guests.getUseCounts: // User System Statistik (Browser, OS, hasCamera, hasMicrophone, hasSpeakers)')
for(var i = 0; i < 5; i++){
    // User System Statistik (Anzahl Browser Nutzung etc.)
    guests.getUseCounts(startDate, endDate, sysdiagnostics_coll, i).then(function(array){
        res.write('<br>')
        for(elem of array){
            res.write('<br>Wert: ' + elem._id + '<br>Count: ' + elem.count)
        }
    })
} */

/* // Gesamtzahl Kunden (Aufruf Redundant da in getStats erhalten)
guests.getTotal(startDate, endDate, guests_coll).then(function(result){
    res.write('<br><br>guests.getTotal: // Gesamtzahl Kunden (Aufruf Redundant da in getStats erhalten) <br>')
        res.write('Anzahl Kunden: ' + result)
})  */

/*  // Anzahl Gäste Gesamt, Gesamt / Tag, Durchschnitt / Tag, Min und Max Werte 
guests.getStats(startDate, endDate, guests_coll).then(function(array){
    res.write('<br><br>guests.getStats: // Anzahl Gäste Gesamt, Gesamt / Tag, Durchschnitt / Tag, Min und Max Werte  <br>')
    for(elem of array[0]){
        res.write('<br>Count: ' + elem)
    }
    res.write('<br><br>Total: ' + array[1][0] + '<br>Durchschnitt: ' + array[1][1])
    res.write('<br>Min: ' + array[1][2] + '<br>Max: ' + array[1][3])
})   */

/* // Annahme Häufigkeit bei Screensharing Einladung
guests.getInviteStats(startDate, endDate, chatevent_coll).then(function(array){
    res.write('<br><br>guests.getInviteStats: // Annahme Häufigkeit bei Screensharing Einladung  <br>')
    for(elem of array){
        res.write('<br>Type: ' + elem._id + ' | Count: ' + elem.count)
    }
}) */

module.exports = router;
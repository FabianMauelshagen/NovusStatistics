
// Browser Nutzung
// i: 0 -> Benutzter Browser, 1 -> Benutztes Betriebssystem, 2 -> Boolean hat Kamera, 3 -> Boolean hat Mikrofon, 4 -> Boolean hat Lautsprecher
function getUseCounts(startDate, endDate, Model, i){
    return new Promise(function(resolve, reject){
        let fields = ['$browserName', '$osName', '$hasCamera', '$hasMicrophone', '$hasSpeakers']
        Model.aggregate([
            {
                $match: {
                  $and: [
                    {
                      createdAt: {
                        $gt: new Date(startDate)
                      }
                    }, {
                      createdAt: {
                        $lt: new Date(endDate)
                      }
                    }
                  ]
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
              
        ], function(err, result){
            resolve(result)
        })
    })
}

// Gesamtzahl an Guests über Zeitspanne
// Rückgabewert = (number) c -> Count der Guests
function getTotal(startDate, endDate, Model){
    return new Promise(function(resolve, reject){
        Model.aggregate([
            {
                $match: {
                  $and: [
                    {
                      createdAt: {
                        $gt: new Date(startDate)
                      }
                    }, {
                      createdAt: {
                        $lt: new Date(endDate)
                      }
                    }
                  ]
                }
              }, {
                $group: {
                  _id: null, 
                  count: {
                    $sum: 1
                  }
                }
              }, {
                    $sort: {
                      count: 1
                    }
                 }
              
        ], function(err, result){
            let c = 0
            for(elem of result){
                c = elem.count
            }
            resolve(c)
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
function getStats(startDate, endDate, Model){
        return new Promise(async function(resolve, reject){
            let totals = []
            let stats = []
            let total = 0
            let avg = 0
            let min = 0
            let max = 0
            let i = 0
            let currentDate = new Date(endDate)
            let currentStartDate = new Date(endDate)
            while(currentStartDate >= startDate){
                    await getTotal(currentStartDate, currentDate, Model).then(function(res){
                        totals[i] = res
                    })
                currentStartDate.setDate(currentDate.getDate() - 1)
                currentDate.setDate(currentDate.getDate() - 1)
                currentStartDate.setHours(0,0,0,0)
                i++
            }
            for(elem of totals){
                if(min == 0 || (min > elem && elem != 0)){
                    min = elem
                }
                if(max == 0 || max < elem){
                    max = elem
                }
                total += elem
            }
            avg = Math.round(((total / totals.length) + Number.EPSILON) * 100) / 100
            stats.push(total, avg, min, max)
            resolve([totals, stats])
        })
}

// Annahme / Ablehnung der Screensharing Einladung
function getInviteStats(startDate, endDate, Model){
    return new Promise(function(resolve, reject){
        Model.aggregate([
            {
               $match: {
                $and: [
                {
                    createdAt: {
                    $gt: new Date(startDate)
                    }
                }, {
                    createdAt: {
                    $lt: new Date(endDate)
                    }
                }
                ]
              }
            },{
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
            }
          ], function(err, result){
              resolve(result)
          })
    })
}


// Test Aufrufe innerhalb der main.js Datei


 /* // Datums Setzung
    startDate = time.getLastQuarter()[0]
    endDate = time.getLastQuarter()[1]
    console.log('start: ' + startDate + ' end: ' + endDate)  */

    /* // User System Statistik (Anzahl Browser Nutzung etc.)
    guests.getUseCounts(startDate, endDate, sysdiagnostics_coll, 0).then(function(array){
        for(elem of array){
            res.write('<br>Wert: ' + elem._id + '<br>Count: ' + elem.count)
        }
    }) */

    /* // Gesamtzahl Kunden (Aufruf Redundant da in getStats erhalten)
    guests.getTotal(startDate, endDate, guests_coll).then(function(result){
            res.write('Anzahl Kunden: ' + result)
    })  */

     /* // Anzahl Gäste Gesamt, Gesamt / Tag, Durchschnitt / Tag, Min und Max Werte 
    guests.getStats(startDate, endDate, guests_coll).then(function(array){
        let total = 0
        for(elem of array[0]){
            res.write('<br>Count: ' + elem)
        }
        res.write('<br><br>Total: ' + array[1][0] + '<br>Durchschnitt: ' + array[1][1])
        res.write('<br>Min: ' + array[1][2] + '<br>Max: ' + array[1][3])
    })   */
        
    /* // Annahme Häufigkeit bei Screensharing Einladung
    guests.getInviteStats(startDate, endDate, chatevent_coll).then(function(array){
        for(elem of array){
            res.write('<br>Type: ' + elem._id + ' | Count: ' + elem.count)
        }
    }) */

module.exports = {getUseCounts, getTotal, getStats, getInviteStats};
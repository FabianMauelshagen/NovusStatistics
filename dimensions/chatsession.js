const mongoose = require('mongoose');
const { send } = require('process');
var ObjectId = require('mongodb').ObjectID;

// Erster Guest Joined und Letzter GuestLeft von allen Chat Sessions
function chatSessionAggregate(startDate, endDate, Model){
    return new Promise(function(resolve, reject){
        let array = []
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
                    $match: {
                    $or: [
                        {
                        type: 'guestJoined'
                        }, {
                        type: 'guestLeft'
                        }
                    ]
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
                    }
                    }
                }, {
                  $addFields: {
                    duration: new Date('')
                  }
                }
                ]
            , function (err, result){
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
function getDurations(startDate, endDate, Coll){
    return new Promise(function(resolve, reject){
      chatSessionAggregate(startDate, endDate, Coll).then(function(array){
        let first = ''
        let last = ''
        let long = 0
        let short = 0
        let i = 0
        let totalDur = 0
        let avgDur = 0
        let durations = []   
        let stats = []                 
        for(elem of array){
            if(!(elem.min == elem.max)){
                first = calcTime(elem.min)
                last = calcTime(elem.max)
                let diff = last.getTime() - first.getTime()
                    if(short == 0 || diff < short){
                        short = diff; 
                    } 
                    if(long == 0 || diff > long){
                        long = diff;
                    } 
                totalDur += diff
                let sessionDuration =  new Date(diff)
                durations[i] = elem
                durations[i].duration = sessionDuration.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
                i++
            }
        }
        avgDur = new Date((totalDur/i))
        let longestDuration = new Date(long)
        let shortestDuration = new Date(short)
        stats[0] = i
        stats[1] = shortestDuration.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
        stats[2] = longestDuration.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
        stats[3] = avgDur.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
        resolve([durations, stats])
    })
    })  
}

// Time String to Date Konvertierung
function calcTime(time){
    var date = new Date("January 1, 2000 " + time)
    return date
}

// Alle ChatSession Gründe nach Thema
function agentSettingsAggregate(startDate, endDate, Model){
    return new Promise(function(resolve, reject){
        let array = []
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
              $project: {
                _id: 1, 
                title: 1
              }
            }, {
              $addFields: {
                count: 0
              }
            }
          ], function (err, result){
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
function ratingsAggregate(startDate, endDate, Coll, Model){
    return new Promise(function(resolve, reject){
        agentSettingsAggregate(startDate, endDate, Coll).then(function(array){
            Model.aggregate([
                {
                  $match: {
                  $and: [
                    {
                      createdAt: {
                        $gte: new Date(startDate)
                      }
                    }, {
                      createdAt: {
                        $lte: new Date(endDate)
                      }
                    }
                  ]
                  }
                },{
                  $project: {
                    chatSession: 1, 
                    agentRatingSettings: 1, 
                    createdAt: 1
                  }
                }
              ], function(err, result){
                    let maxWert = 0
                    let minWert = 0
                    let maxThema = []
                    let minThema = []
                    let minStats = []
                    let maxStats = []
                    let notUsed = []
                    //Alle Dokumente aus der agentRatings Collection
                    for(rt of result){
                        // Alle Objekte aus dem agentRatingSettings Array innerhalb eines rt Dokuments
                        for(ars of rt.agentRatingSettings){
                            // Alle gespeicherten ChatSession Themen (Title aus agentRatingSettings Collection) zum Vergleich mit den rt-Array Werten
                            for(elem of array){
                                // Bei übereinstimmenden Werten, inkrementieren der count Variable innerhalb des agentRatingSettings Arrays
                                if(elem._id.equals(ars.agentRatingSetting)){
                                    elem.count++
                                } 
                            }
                        } 
                    }
                    // Erneutes analysieren des Arrays mit abgleich von nicht genutzten Themen sowie Max und Min Werten
                    for(elem of array){
                      if(elem.count == 0){
                        notUsed[notUsed.length] = elem.title
                      }
                      if(maxWert == 0 || maxWert < elem.count){
                        maxWert = elem.count
                      }
                      if(minWert == 0 || (minWert > elem.count && elem.count != 0)){
                        minWert = elem.count
                      }
                    }
                    // Auslesen der den Max und Min Werten entsprechenden Themen
                    for(elem of array){
                      if(elem.count == minWert){
                        minThema[minThema.length] = elem.title
                      }else if(elem.count == maxWert){
                        maxThema[maxThema.length] = elem.title
                      }
                    }
                    minStats[0] = minThema
                    minStats[1] = minWert
                    maxStats[0] = maxThema
                    maxStats[1]  = maxWert
                    resolve([array, minStats, maxStats, notUsed])
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
function getUsedFunctionsInOrder(startDate, endDate, Model){
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
          $and: [
            {
              type: {
                $regex: new RegExp('Changed')
              }
            }, {
              type: {
                $not: new RegExp('recordingChanged')
              }
            }, {
              $or: [
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
        $group: {
          _id: {
            _id: '$chatSession', 
            type: '$type'
          }, 
          count: {
            $sum: 1
          }, 
          createdAt: {
            $first: '$createdAt'
          }
        }
      }, {
        $project: {
          _id: '$_id._id', 
          type: '$_id.type', 
          createdAt: '$createdAt'
        }
      }, {
        $sort: {
          _id: -1, 
          createdAt: 1
        }
      }, {
        $group: {
          _id: '$_id', 
          functions: {
            $push: {
              type: '$type', 
              createdAt: '$createdAt'
            }
          }
        }
      }
    ], function(err, result){
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
function getTotalByDate(startDate, endDate, Model){
  return new Promise(function(resolve, reject){
    let total = 0
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
      }
    ], function(err, result){
      total = result[0].count
      resolve(total)
    })
  })
}

// Gesamtzahl Guests und Agents by Date
// totals[0] = (Number) aktive Guests
// totals[1] = (Number) atkvie Agents
function getTotalGAByDate(startDate, endDate, Model){
  return new Promise(function(resolve, reject){
    let totals = []
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
      }
    ], function(err, result){
      totals[0] = result[0].activeGuests
      totals[1] = result[0].activeAgents
      resolve(totals)
    })
  })
}

// Durchschnitts Statistik, 
//avgs[0] = (Number) Gesamtzahl Chatsessions 
//avgs[1] = (Number) Durchschnitt Guests pro Session 
//avgs[2] = (Number) Durchschnitt Agents pro Session
function getAvgStats(startDate, endDate, Model){
    return new Promise(function(resolve, reject){
      let avgGuests = 0
      let avgAgents = 0
      let avgs = []
      getTotalByDate(startDate, endDate, Model).then(function(total){
          getTotalGAByDate(startDate, endDate, Model).then(function(totals){

            avgGuests = totals[0] / total
            avgAgents = totals[1] / total
            avgs[0] = total
            avgs[1] = Math.round((avgGuests + Number.EPSILON) * 1000) / 1000
            avgs[2] = Math.round((avgAgents + Number.EPSILON) * 1000) / 1000
            resolve(avgs)

          })
      })
    })
}


// Test Aufrufe innerhalb der main.js Datei


 /* // Sitzungen (Anzahl Sitzungen die berechnet werden konnten, also Daten zu Beitritt und Austritt vorhanden) ...
        // ... und deren Länge (Zeit zwischen erstem Gastbeitritt und letzten Gastaustritt), sowie kürzeste und längste Sitzung
        startDate = '2020-09-20'
        endDate = '2020-10-28'
        chatsessions.getDurations(startDate, endDate, chatevent_coll).then(function(array){
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
        })  */

        /* // ChatSession Gründe (Fallabschluß, Kredit etc..) und Ihre Häufigkeit
        startDate = '2020-09-20'
        endDate = '2020-10-28'
         chatsessions.ratingsAggregate(startDate, endDate, agentSettings_coll, agentRatings_coll).then(function(array){
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
        })   */
        
        /* //Chatsessions mit den in der Session benutzten Funktionen in chronologisch richtiger Reihenfolge, separierbar nach einem Datum.
        startDate = '2020-08-01'
        endDate = '2020-08-31'
        chatsessions.getUsedFunctionsInOrder(startDate, endDate, chatevent_coll).then(function(array){
            for(elem of array){
                res.write('<br><br>ChatSession: ' + elem._id)
                for(funct of elem.functions){
                    res.write('<br>Type: ' + funct.type + ' | CreatedAt: ' + funct.createdAt.toLocaleTimeString('de-DE', {timeZone: 'UTC'}))
                }
            }
        });  */

        /* //Chatsession Anzahl mit Zeitspanne
        chatsessions.getTotalByDate(startDate, endDate, chatsessions_coll).then(function(total){
            res.write('<br>Chatsessions zwischen dem ' + startDate + ' und dem ' + endDate + ': ' + total)
        }) */

        /* //ChatSession Stats (Gesamt ChatSessions, Durchschn. Guests/Agents pro Session)
        startDate = '2020-08-01'
        endDate = '2020-08-31'
        chatsessions.getAvgStats(startDate, endDate, chatsessions_coll).then(function(avgs){
            res.write('Zeitraum: ' + startDate + ' - ' + endDate + '<br>')
            res.write('Gesamtzahl ChatSessions: ' + avgs[0] + '<br>Durchschnittlich angemeldete Guests: ' + avgs[1] + '<br>Durchschnittlich angemeldete Agents: ' + avgs[2])
        }) */

module.exports = {ratingsAggregate, getDurations, getUsedFunctionsInOrder, getAvgStats};
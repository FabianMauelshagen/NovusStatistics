// Get time Tageszeit
function getTimes(startDate, endDate, from, to, Model) {
    return new Promise(function(resolve, reject){
        Model.aggregate([
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
                  '$or': [
                      {
                          '$and': [
                              {
                                  'data.action': 'started'
                              }, {
                                  'type': 'videoChanged'
                              }
                          ]
                      }, {
                          '$and': [
                              {
                                  'data.action': 'started'
                              }, {
                                  'type': 'screenSharingChanged'
                              }
                          ]
                      }, {
                          '$and': [
                              {
                                  'data.action': 'started'
                              }, {
                                  'type': 'coBrowsingChanged'
                              }
                          ]
                      }
                  ]
              }
          }, {
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
              '$match': {
                  '$and': [
                      {
                          'hours': {
                              '$gte': from
                          }
                      }, {
                          'hours': {
                              '$lt': to
                          }
                      }
                  ]
              }
          },{
            '$sort': {
              'datetime': 1
            }
          }
      ], function(err, result){
          resolve(result)
      })
    })
  }

  function getBusyTimes(startDate, endDate, from, to, Model){
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
                  '$match': {
                    '$or': [
                      {
                        '$and': [
                          {
                            'data.action': 'started'
                          }, {
                            'type': 'videoChanged'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'data.action': 'started'
                          }, {
                            'type': 'screenSharingChanged'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'data.action': 'started'
                          }, {
                            'type': 'coBrowsingChanged'
                          }
                        ]
                      }
                    ]
                  }
                }, {
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
                  '$match': {
                    '$and': [
                      {
                        'hours': {
                          '$gte': from
                        }
                      }, {
                        'hours': {
                          '$lt': to
                        }
                      }
                    ]
                  }
                }, {
                  '$group': {
                    '_id': '$hours', 
                    'count': {
                      '$sum': 1
                    }
                  }
                }, {
                  '$sort': {
                    '_id': 1
                  }
                }
              ], function(err, result){
                  resolve(result)
              })
        })
  }

  function getAllDurations(startDate, endDate, Model){
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
                      'data.action': 'stopped'
                    }, {
                      'data.action': 'opened'
                    }, {
                      'data.action': 'closed'
                    }
                  ]
                }
              ]
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
          }
        ], function(err, result){
          resolve(result)
        })
      })
  }

  // Alle Start und End Zeiten der jeweiligen Funktion zur weiteren Verarbeitung
  function getDurations(startDate, endDate, Model, i){
    return new Promise(function(resolve, reject){
      let types = ['coBrowsingChanged', 'videoChanged', 'whiteBoardChanged', 'screenSharingChanged']
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
          '$match': {
            '$and': [
              {
                'type': types[i]
              },{
                '$or': [
                  {
                    'data.action': 'started'
                  }, {
                    'data.action': 'stopped'
                  }, {
                    'data.action': 'opened'
                  }, {
                    'data.action': 'closed'
                  }
                ]
              }
            ]
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
        }
      ], function(err, result){
        resolve(result)
      })
    })
}

// Verarbeitung der Start und Endzeiten der Funktionen, Berechnung der Dauer sowie Durchschnitt, Min und Max Dauer
function calcDuration(startDate, endDate, Model, z){
  return new Promise(function(resolve, reject){
    getDurations(startDate, endDate, Model, z).then(function(array){
          let startTime = ''
          let stopTime = ''
          let long = 0
          let short = 0
          let i = 0
          let totalDur = 0
          let avgDur = 0
          let durations = []   
          let stats = []                 
          for(elem of array){
            startTime = calcTime(elem.startTime)
            stopTime = calcTime(elem.stopTime)
                  let diff = stopTime.getTime() - startTime.getTime()
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
          avgDur = new Date((totalDur/i))
          let longestDuration = new Date(long)
          let shortestDuration = new Date(short)
          let date = new Date(endDate)
          stats[0] = i
          stats[1] = shortestDuration.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
          stats[2] = longestDuration.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
          stats[3] = avgDur.toLocaleTimeString('de-DE', {timeZone: 'UTC'})
          stats[4] = date
          resolve([durations, stats])
    })
  })
}

// Time String to Date Konvertierung
function calcTime(time){
  var date = new Date("January 1, 2000 " + time)
  return date
}

// Berechnung der Dauer der Funktionen für einzelne Tage über eine Zeitspanne
function calcEachDay(startDate, endDate, Model, index){
  return new Promise(async function(resolve, reject){
    let totals = []
    let i = 0
    let currentDate = new Date(endDate)
    let currentStartDate = new Date(endDate)
    while(currentStartDate >= startDate){
            await calcDuration(currentStartDate, currentDate, Model, index).then(function(res){
              res[1][4].setDate(currentDate.getDate())
              totals[i] = res 
            })
        currentStartDate.setDate(currentDate.getDate() - 1)
        currentDate.setDate(currentDate.getDate() - 1)
        currentStartDate.setHours(0,0,0,0)
        i++
    }
    resolve(totals)
  })   
}
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


  module.exports = {getTimes, getBusyTimes, getDurations, calcDuration, calcEachDay};

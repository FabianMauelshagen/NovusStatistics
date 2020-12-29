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

function calcEachDay(startDate, endDate, Model, index){
  return new Promise(async function(resolve, reject){
    let totals = []
    let i = 0
    let currentDate = new Date(endDate)
    let currentStartDate = new Date(endDate)
    while(currentStartDate >= startDate){
            await calcDuration(currentStartDate, currentDate, Model, index).then(function(res){
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


  module.exports = {getTimes, getBusyTimes, getDurations, calcDuration, calcEachDay};

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


  module.exports = {getTimes, getBusyTimes};

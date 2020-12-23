// Get time Tageszeit
function getTime(startDate, endDate, from, to, Model) {
    return new Promise(function(resolve, reject){
        /* let startDate = new Date(date)
        let endDate = new Date(date)
        startDate.setHours(0,0,0,0)
        endDate.setHours(23,59,59,0) */
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
                              '$gt': from
                          }
                      }, {
                          'hours': {
                              '$lt': to
                          }
                      }
                  ]
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
                          '$gt': from
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

  module.exports = {getTime, getBusyTimes};
const mongoose = require('mongoose');
const { send, emit } = require('process');
var ObjectId = require('mongodb').ObjectID;


// User finden über bestimmte Feld ((String) field) und ensprechenden Wert ((String) value)
// Field: role, status, gender, firstname, lastname, username, email ...
function getUser(Model, field, value){
    return new Promise(function(resolve, reject){
    let array = [];
        Model.aggregate([
            {
                $match: {
                    [field]: value
                }
            }
        ], function (err, result){
        array = result
        resolve(array)
        })
    })
}

// Get all session interrupts
function getSessionInterrupts(startDate, endDate, Model) {
    return new Promise(function(resolve, reject){
        Model.aggregate([{
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
              'type': 'agentInterrupted'
            }
          }, {
            '$group': {
              '_id': {
                'user': '$user', 
                'type': '$type'
              }, 
              'count': {
                '$sum': 1
              }
            }
          }, {
            '$unwind': {
              'path': '$_id'
            }
          }, {
            '$group': {
              '_id': '$_id.user', 
              'type': {
                '$first': '$_id.type'
              }, 
              'count': {
                '$first': '$count'
              }
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': '_id', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$group': {
              '_id': '$_id', 
              'type': {
                '$first': '$type'
              }, 
              'count': {
                '$first': '$count'
              }, 
              'username': {
                '$first': '$user.username'
              }
            }
          }, {
            '$group': {
              '_id': '$username', 
              'username': {
                '$first': '$username'
              }, 
              'count': {
                '$sum': '$count'
              }, 
              'type': {
                '$first': '$type'
              }
            }
          }, {
            '$project': {
              '_id': 0
            }
          }, {
            '$sort': {
              'username': 1
            }
          }
        ], function(err, result){
            resolve(result)
        })
    })
  }

  // Get frequency of a problem acceptance by a user
function getFrequencyOfAcceptance(startDate, endDate, Model) {
    return new Promise(function(resolve, reject){
        Model.aggregate([{
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
              'type': 'changeChatSessionStatus', 
              'data.status': 'accepted'
            }
          }, {
            '$group': {
              '_id': '$user', 
              'count': {
                '$sum': 1
              }
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': '_id', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$group': {
              '_id': '$user._id', 
              'username': {
                '$first': '$user.username'
              }, 
              'count': {
                '$first': '$count'
              }
            }
          }, {
            '$group': {
              '_id': '$username', 
              'username': {
                '$first': '$username'
              }, 
              'count': {
                '$sum': '$count'
              }
            }
          }, {
            '$project': {
              '_id': 0
            }
          }, {
            '$sort': {
              'username': 1
            }
          }], function(err, result){
              resolve(result)
          })
    })
  }

  // Get Used Functions Count per User 
  function getUsedFunctions(startDate, endDate, Model) {
    return new Promise(function(resolve, reject){
        Model.aggregate([{
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
              '$or': [
                {
                  '$and': [
                    {
                      'data.action': 'started'
                    }, {
                      'type': 'videoChanged'
                    }, {
                      'user': {
                        '$exists': true
                      }
                    }
                  ]
                }, {
                  '$and': [
                    {
                      'data.action': 'started'
                    }, {
                      'type': 'screenSharingChanged'
                    }, {
                      'user': {
                        '$exists': true
                      }
                    }
                  ]
                }, {
                  '$and': [
                    {
                      'data.action': 'started'
                    }, {
                      'type': 'coBrowsingChanged'
                    }, {
                      'user': {
                        '$exists': true
                      }
                    }
                  ]
                }
              ]
            }
          }, {
            '$group': {
              '_id': {
                'user': '$user', 
                'type': '$type'
              }, 
              'count': {
                '$sum': 1
              }
            }
          }, {
            '$unwind': {
              'path': '$_id'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': '_id.user', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$project': {
              '_id': 0, 
              'username': '$user.username', 
              'type': '$_id.type', 
              'count': '$count'
            }
          }, {
            '$group': {
              '_id': {
                'username': '$username', 
                'type': '$type'
              }, 
              'count': {
                '$sum': '$count'
              }
            }
          }, {
            '$project': {
              '_id': 0, 
              'username': '$_id.username', 
              'type': '$_id.type', 
              'count': '$count'
            }
          }, {
            '$sort': {
              'username': 1, 
              'type': 1
            }
          }], function(err, result){
              resolve(result)
          })
    })
  }

// Aufruf bzw Verwendung in main.js:


/* //Datums und Zeitsetzung
    startDate = time.getLastMonth()[0]
    endDate = time.getLastMonth()[1] 
    res.write('<br>Startdatum: ' + startDate + '<br>Enddatum: ' + endDate) */
    
    /* // Wie oft wurde eine Sitzung unterbrochen nach User
    users.getSessionInterrupts(startDate, endDate, chatevent_coll).then(function(array){
        res.write('<br><br>users.getSessionInterrupts: // Wie oft wurde eine Sitzung unterbrochen nach User <br>')
        for(elem of array){
            res.write('<br>Count: ' + elem.count + ' | Berater: ' + elem.username)
        }
    }) */

    /* // Wie oft wurde Screen Sharing angenommen
    users.getFrequencyOfAcceptance(startDate, endDate, chatevent_coll).then(function(array){
        res.write('<br><br>users.getFrequencyOfAcceptence: // Wie oft wurde Screen Sharing angenommen<br>')
        for(elem of array){
            res.write('<br>Count: ' + elem.count + ' | Berater: ' + elem.username)
        }
    }) */

    /* // Welche Funktionen hat welcher Berater wie oft benutzt
    users.getUsedFunctions(startDate, endDate, chatevent_coll).then(function(array){
        res.write('<br><br>users.getUsedFunctions: // Welche Funktionen hat welcher Berater wie oft benutzt<br>')
        for(elem of array){
            res.write('<br>Type: ' + elem.type + ' | Count: ' + elem.count + ' | Berater: ' + elem.username)
        }
    }) */
module.exports = {getUser, getFrequencyOfAcceptance, getUsedFunctions, getSessionInterrupts};
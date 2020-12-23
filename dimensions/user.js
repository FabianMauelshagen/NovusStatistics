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
function getSessionInterrupts(startDate, endDate) {
    return ChatEvent.aggregate([{
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
        '$sort': {
          'username': 1
        }
      }, {
        '$project': {
          '_id': 0
        }
      }
  
    ])
  }

  
  // Get used functions by a user
function getUsedFunctions(startDate, endDate) {
    return ChatEvent.aggregate([{
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
        '$or': [{
          '$and': [{
            'data.action': 'started'
          }, {
            'type': 'videoChanged'
          }, {
            'user': {
              '$exists': true
            }
          }]
        }, {
          '$and': [{
            'data.action': 'started'
          }, {
            'type': 'screenSharingChanged'
          }, {
            'user': {
              '$exists': true
            }
          }]
        }, {
          '$and': [{
            'data.action': 'started'
          }, {
            'type': 'coBrowsingChanged'
          }, {
            'user': {
              '$exists': true
            }
          }]
        }]
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
      '$sort': {
        'username': 1,
        'type': 1
      }
    }, {
      '$project': {
        '_id': 0
      }
    }])
  }

  // Get frequency of a problem acceptance by a user
function getFrequencyOfAcceptance(startDate, endDate) {
    return ChatEvent.aggregate([{
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
      '$sort': {
        'username': 1
      }
    }, {
      '$project': {
        '_id': 0
      }
    }])
  }


module.exports = {getUser, getFrequencyOfAcceptance, getUsedFunctions, getSessionInterrupts};
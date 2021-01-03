const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const chatEventsSchema = new mongoose.Schema()
const ChatEvent = mongoose.model('chatevent', chatEventsSchema)

let startDate = '1991-08-06'
let endDate = new Date()
//as
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

// Get all problem solving frequencies
function getProblemSolvingFrequency() {

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

// Get time between the session and chat start
function getTimeBetweenSessionAndChat(startDate, endDate) {

}

// Get time Tageszeit
function getTime(date, from, to) {
  let startDate = new Date(date)
  let endDate = new Date(date)
  startDate.setHours(0,0,0,0)
  endDate.setHours(23,59,59,0)
  return ChatEvent.aggregate([
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
])
}

// Get all chatevents
router.get('/getTime', async (req, res) => {
  try {
    res.json(await getTime('2020-08-20', 7, 16))
  } catch (err) {
    res.send('Error ' + err)
  }
})

// Get single chatevent by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const chatEvents = await ChatEvent.findById(id, {})
    res.json(chatEvents)
  } catch (err) {
    res.send('Error ' + err)
  }
})

module.exports = router
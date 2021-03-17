const express = require('express')
const router = express.Router()
const Model = require('../dimensions/models')


// User finden über bestimmte Feld ((String) field) und ensprechenden Wert ((String) value)
// Field: role, status, gender, firstname, lastname, username, email ...
// Nicht genutzt
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

// Alle Sitzungsabbrüche pro User
function getSessionInterrupts(startDate, endDate) {
    return Model.chatevent_coll.aggregate([{
            // Zeitfilter
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
            // Filtern nach Typ
            '$match': {
              'type': 'agentInterrupted'
            }
          }, {
            // Gruppieren pro Use und pro Typ sowie zählen des Typs
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
            // Nach User Auflösen
            '$unwind': {
              'path': '$_id'
            }
          }, {
            // Erneutes Gruppieren nach User und Typ
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
            // Join mit User Dokumenten (Entnahme der zugehörigen User)
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
            // Hinzufügen des Usernames
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
            // Zählen der Count Variable
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
            // Entfernen der ID
            '$project': {
              '_id': 0
            }
          }, {
            '$sort': {
              'username': 1
            }
          }
        ])
  }

  // Frequenz, wie oft eine Anfrage von einem User akzeptiert wird, gezählt auf einzelne User
function getFrequencyOfAcceptance(startDate, endDate) {
    return Model.chatevent_coll.aggregate([{
            // Zeitfilter
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
            //Filtern nach Typ
            '$match': {
              'type': 'changeChatSessionStatus', 
              'data.status': 'accepted'
            }
          }, {
            // Gruppieren nach User und zählen der Variable
            '$group': {
              '_id': '$user', 
              'count': {
                '$sum': 1
              }
            }
          }, {
            // Join mit den User Dokumenten (s.o.)
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
            // Hinzufügen des Usernamens
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
            // Zusammenzählen der count Variable
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
            // Entfernen der ID
            '$project': {
              '_id': 0
            }
          }, {
            '$sort': {
              'username': 1
            }
          }])
  }

  // Anzahl der Funktionsnutzungen pro Nutzer und Funktion
  function getUsedFunctions(startDate, endDate) {
       return Model.chatevent_coll.aggregate([{
         // Zeitfilter
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
            // Filtern nach Funktions Start und existierendem User (Ob in einem Funktionsstart Dokument ein User eingetragen ist)
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
            // Gruppieren nach User und Typ + Zählvariable
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
            // Join mit User Dokumenten
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
            //  Definieren der anzuzeigenden Felder
            '$project': {
              '_id': 0, 
              'username': '$user.username', 
              'type': '$_id.type', 
              'count': '$count'
            }
          }, {
            // Beifügen des Usernamens
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
            // Formatieren des Dokuments
            '$project': {
              '_id': 0, 
              'username': '$_id.username', 
              'type': '$_id.type', 
              'count': '$count'
            }
          }, {
            // Sortieren nach User und dann nach Typ
            '$sort': {
              'username': 1, 
              'type': 1
            }
          }])
  }

  // Funktion um die User Namen Unkenntlich zu machen 
  // Hinweis: Funktion funktioniert nicht sobald str.length > 16 -> Evtl Abfrage einbauen sofern Username größer als 8 Zeichen sein darf
  function replace(str) {
    let stringMaxLength = 8 // Maximal Länge des gespeicherten Usernames 
    let i = 0
    // Erste Hälfte des Strings extrahieren
    str = str.substr(0, (str.length/2))
    i = str.length
    // String bis zum 8. Zeichen mit * auffüllen
    for(i; i < stringMaxLength; i++){
      str = str + '*'
    }
    return str
  }

  // Funktion zum füllen eines Funktions-Nutzungs-Arrays für alle User
  async function getUsedFunctionsLoop(startDate, endDate) {
    let functions = [{
      type: 'videoChanged',
      name: 'Video-Chat',
      values: []
    }, {
      type: 'coBrowsingChanged',
      name: 'Co-Browsing',
      values: []
    }, {
      type: 'screenSharingChanged',
      name: 'Screen-Sharing',
      values: []
    }]
    const res = await getUsedFunctions(startDate, endDate)
    let last = 0
    let users = []
    // Iterieren über die Funktionen
    for (functElem of functions) {
      let i = -1
      // Zuletzt gelesener User
      let lastUser = ''
      // Iterieren über Rückgabearray der getUsedFunction Funktion
      for (el of res) {
        // true wenn aktuell gelesener Name nicht gleich lastUser ist (Zuletzt gelesener User)
        if (el.username !== lastUser) {
          // Neuer User wird in lastUser gespeichert
          lastUser = el.username
          // Wenn letzter Durchlauf erreicht ist wird der lastUser jeweils in das User Array gepusht und dabei durch die replace Funktion unkenntlich gemacht
          if(last == functions.length-1){
            users.push(replace(lastUser))
          } 
          // i wird hochgezählt wenn ein neuer User gelesen wurde
          i++
        }
        // wenn der typ aus dem getFunctions Element mit dem Typ auf des functions Element übereinstimmt wird das Element im Werte Array gespeichert
        // Das i entspricht dabei immer der Position eines bestimmten Users
        if (el.type === functElem.type) {
          functElem.values[i] = el.count
        }
      }
      // Hochzählen der Zählvariable für das Funktions Array
      last++
    }
  
    // Iterieren über das Werte Array der einzelnen Funktionen des Funktions Arrays
    for (functElem of functions) {
      let z = 0
      // Ersetzen von undefined Werten durch eine 0
      for (val of functElem.values) {
        if (!val) {
          functElem.values[z] = 0
        }
        z++
      }
    }
    return [functions, users]
  }
  
  // Get Funktion zum Aufruf im Frontend
  router.get('/getSessionInterrupts', async (req, res) => {
    try {
      let startDate = req.query.start
      let endDate = req.query.end
      res.json(await getSessionInterrupts(startDate, endDate))
    } catch (err) {
      res.send('Error ' + err)
    }
  })
  
  router.get('/getFrequencyOfAcceptance', async (req, res) => {
    try {
      let startDate = req.query.start
      let endDate = req.query.end
      res.json(await getFrequencyOfAcceptance(startDate, endDate))
    } catch (err) {
      res.send('Error ' + err)
    }
  })
  
  router.get('/getUsedFunctions', async (req, res) => {
    try {
      let startDate = req.query.start
      let endDate = req.query.end
      res.json(await getUsedFunctionsLoop(startDate, endDate))
    } catch (err) {
      res.send('Error ' + err)
    }
  })


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
module.exports = router;
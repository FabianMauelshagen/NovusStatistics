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


module.exports = {getUser};
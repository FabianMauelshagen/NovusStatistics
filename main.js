
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

mongoose.connect(
    'mongodb://127.0.0.1:27017/Novus', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }
)

const chatSchema = new mongoose.Schema();
const chatevent = mongoose.model('chatevents', chatSchema);
const userevents = mongoose.model('userevents', chatSchema);


chatevent.aggregate([{
    $match: {
        chatSession: ObjectId('5e9e9e87f83891075e2f13a2')
    }
}, {
    $project: {
        user: 1,
        createdAt: 1,
        type: 1,
        datetime: {
            $dateToString: {
                format: '%H:%M:%S',
                date: '$createdAt'
            }
        }
    }
}, {
    $group: {
        "_id": "$type",
        "max": {
            "$max": "$datetime"
        },
        "min": {
            "$min": "$datetime"
        }
    }
}, {
    $project: {
        "_id": 1,
        "time": {
            $cond: {
                if: {
                    $eq: ["$_id", "guestJoined"]
                },
                then: "$min",
                else: "$max"
            }
        }
    }
}], function(err, result){
  console.log(result);
  mongoose.connection.close();
});

const mongoose = require('mongoose')

// Definieren der Collections
const chatSchema = new mongoose.Schema()
const chatevent_coll = mongoose.model('chatevents', chatSchema)
const sysdiagnostics_coll = mongoose.model('systemdiagnosticdatas', chatSchema)
const guests_coll = mongoose.model('guests', chatSchema)
const user_coll = mongoose.model('users', chatSchema)
const agentRatings_coll = mongoose.model('agentratings', chatSchema)
const agentSettings_coll = mongoose.model('agentratingsettings', chatSchema)
const chatsessions_coll = mongoose.model('chatsessions', chatSchema)

// Export der Collections
module.exports = {
    chatevent_coll,
    sysdiagnostics_coll,
    guests_coll,
    chatsessions_coll,
    agentRatings_coll,
    agentSettings_coll
}
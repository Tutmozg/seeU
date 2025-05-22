import { time } from 'console'
import { model, Schema } from 'mongoose'

const groupSchema = new Schema({
    emailCreator: String,
    name: String,
    members: Array,
    date: String,
    type: String,
    time: String,

    code: Number,
})

const groupModel = model('groups', groupSchema)

export default groupModel

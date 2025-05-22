import { model, Schema } from 'mongoose'

const userSchema = new Schema({
    email: String,
    password: String,
    name: String,
    activationLink: {
        type: String
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default: 'https://i.ibb.co/8DqP0QR3/man-11221990.png'
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    friends: {
        type: Array,
        default: []
    },
    groups: {
        type: Array,
        default: []
    },
    code: {
        type: Number,
        default: 0
    },
    date: {
        type: String,
        default: '00.00.0000'
    }

})

const userModel = model('users', userSchema)

export default userModel

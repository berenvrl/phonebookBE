//Mongoose setup
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose
    .connect(url)
    .then((result) => {
        console.log('connected to MongoDB')
    })
    .catch((error) => console.log('error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'Name is required!'],
    },
    number: {
        type: String,
        minLength: 8,
        required: [true, 'Number is required!'],
        validate: {
            validator: function (v) {
                return /\d{2,3}-\d+$/.test(v)
            },
            message: (props) => `${props.value} is not a valid number!`,
        },
    },
})

//formatting objects returned by Mongoose
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

const Persons = mongoose.model('Persons', personSchema)

module.exports = Persons

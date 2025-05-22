import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import router from './router/router.ts'

const app = express()



app.use(
    cors({
        methods: 'GET, POST, PUT, DELETE',
        origin: '*',
        credentials: true
    })
)

app.use(express.json())

mongoose
    .connect('mongodb://Tutmozg:lQnuFhMuWjPjBjk4@ac-xry7cky-shard-00-00.vqyykm5.mongodb.net:27017,ac-xry7cky-shard-00-01.vqyykm5.mongodb.net:27017,ac-xry7cky-shard-00-02.vqyykm5.mongodb.net:27017/data?ssl=true&replicaSet=atlas-uurc16-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0')


    .then(() => {
        console.log('connected to mongodb')
    })
    .catch(err => {
        console.log('connection to mongodb failed', err)
    })

app.use('/', router)

app.listen(3000, () => {
    console.log('Server is running on port: 3000');
});

//6eiMAm4qQYAvjzE0
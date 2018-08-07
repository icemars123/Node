var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


mongoose.Promise = Promise;

var dbUrl = 'mongodb://user:u123456@ds143559.mlab.com:43559/learning-node'
   
var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) =>{
        res.send(messages)
    })
})

app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    })
})

//async and await
//async, only until all await to go through, the await can commit. await just be promise.
//if the below is not async and await, then anything will be saved, but nothing'll be showed at the same time. In the back, nothing will be removed.
app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body)

        var savedMessage =  await message.save()

        console.log('saved')

        var censored =  await Message.findOne({ message: 'badword' })

        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error) 
    }finally{
        //logger.log('message post called')
        console.log('message post called')
    }

})

// // Promises and sync
// app.post('/messages', (req, res) => {
//     var message = new Message(req.body)

//     //promise
//     //If error, then to catch. If no error, then to save. -> and try to find badword(promise).
//     // if find it, then to remove. if not find it, then to emit.
//     // note:
//     // if post some content, then save it to the DB, then to find whether the badword is or not.
//     // If found "badword", then remove it from the DB, then io.emit message to the page, and send the status
//     message.save()
//         .then(() => {
//             console.log('saved')
//             return Message.findOne({ message: 'badword' })
//         })
//         .then(censored => {
//             if (censored) {
//                 console.log('censored words found', censored)
//                 return Message.remove({ _id: censored.id })
//             }
//             io.emit('message', req.body)
//             res.sendStatus(200)
//         })
//         .catch((err) => {
//             res.sendStatus(500)
//             return console.error(err)
//         })
// })

io.on('connection', (socket) => {
    console.log('a user connected')
})

// mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, { useMongoClient: true }, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})
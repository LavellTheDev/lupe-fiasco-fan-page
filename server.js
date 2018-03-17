const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db

MongoClient.connect('mongodb://lupe:fiasco@ds117489.mlab.com:17489/lupe', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 9000, () => {
    console.log('OMG listening on over 9000!!!')
  })
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

//attempt to replace get request below with an ajax request so the whole page does not refresh and restart the player
// ajax.get('/',(req,res)=>{
//     var messages=db.collection('messages').find();
//     messages.toArray((err,res)=>{
//         if(err) return console.log(err)
//         result.forEach(function(element){
//             element.total = element.thumbUp - element.thumbDown;
//         })
//         res.render('index.ejs', {messages: result})
//     })
// })

//express get request that requests object from database
app.get('/', (req, res) => {
  var messages = db.collection('messages').find();
  messages.toArray((err, result) => {
    if (err) return console.log(err)
    result.forEach(function(element) {
        element.total = element.thumbUp - element.thumbDown;
    });
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $inc: {
      thumbUp: 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/messages2', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $inc: {
        thumbDown: 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})


app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

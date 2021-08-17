const express = require('express')
const app = express()
const mongoose = require('mongoose')
const {MONGOURI} = require('./keys')
const cors = require('cors')
const port = process.env.PORT || 3001 ;
const morgan = require('morgan')



mongoose.connect(MONGOURI, {
    useNewUrlParser : true ,
    useUnifiedTopology: true
})
mongoose.connection.on('connected' ,()=>{
    console.log("connected to mongo Yeahhhh !!!")
})
mongoose.connection.on('Error' ,(err)=>{
    console.log("Error connecting" , err)
})



require('./models/user')
require('./models/post')

app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use('/test',require('./routes/auth'))
app.use('/try',require('./routes/post'))
app.use('/will',require('./routes/user'))







//hedha just bish tbadell il path w testaamell fonction f path wehed barka mouch fil les paths lkoll
/*const customMiddleware = (req,res,next) =>{
    console.log('customMiddleware executed')
    next()
}
//app.use(customMiddleware)
// ken n7ebou n'executiw customMiddleware fi ay path nemchyoulou
app.get('/' , (rep,res)=>{
    console.log('home')
    res.send('hello world')
})
app.get('/about',customMiddleware , (rep,res)=>{
    console.log('about')
    res.send('About the page')
})*/


app.listen(port ,() =>{
    console.log("server is running on ",port)
})
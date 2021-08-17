const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleWare/requireLogin')
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:"sema.kor88@gmail.com" ,
        pass:"alliance25244890"
    }
})


//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

router.get('/protected' , requireLogin , (req,res)=>{
    res.send("ya halla fikom")
})

/*router.get('/',(req,res)=>{
    res.send("hello every body")
})*/

router.post('/signup' ,(req,res)=>{
    //console.log(req.body.name)  --> testa3malha bish tjareb dima bil poste man est que 9a3ed ye5ou fil ism illi taatihoulou ou non
    const {name,email,password} = req.body
    console.log(req.body)
    if (!name || !email || !password)
    {
        return res.status(422).json({error : "please add all fields"})
    }
    //res.json({message:"successfully posted"}) --> njarbou beha fil postman 
    User.findOne({email : email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error : "user alredy exists with this mail"})
        }
        bcrypt.hash(password , 15)
        .then(hashedpassword=>{
            const user = new User({
                name : name ,
                email : email ,
                password : hashedpassword ,
            })
            //user.save hiyya illi t5azen bil data base
            user.save()
            .then(user=>{
                let mailoptions ={
                    from : "sema.kor88@gmail.com" ,
                    to:user.email,
                    subject:"signup success" ,
                    text:"Welcome to insta"
                }
                transporter.sendMail(mailoptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
    
                    }
                  });
                res.json({message : "saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })

        })
        
    })
    .catch(err=>{
        console.log(err)
    })
    
})
router.post('/signin' , (req,res)=>{
    const {email,password} = req.body
    if (!email || !password)
    {
        return res.status(422).json({error : "please add all fields"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if ( !savedUser )
        {
            return res.status(422).json({error : "Invalide email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then((domatch)=>{
            if (domatch)
            {
                //return res.json({message : "Successfully signin"})
                const token = jwt.sign({_id:savedUser._id} , JWT_SECRET)
                const {_id,name,email} = savedUser
                res.json({token,user:{_id,name,email}})
            }
            else
            {
                return res.status(422).json({error : "Invalide email or password"})
            }

        })
        .catch(err =>{
            console.log(err)
        })
    .catch(err =>{
        console.log(err)
    })
    })
})

router.post('/mdpOublier',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err)
        {
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if (!user)
            {
                return res.status(422).json({error:"User don't exists with this mail "})
            }
            user.resetToken =token
            user.expireToken = Date.now()+ 3600000
            user.save().then(result=>{
                let mailoptions ={
                    from : "sema.kor88@gmail.com" ,
                    to:user.email,
                    subject:"signup success" ,
                    html:`
                    <p>you requested for password reset</p>
                    <h5> click on this <a href="http://localhost:3000/reset/${token}"> Link </a> to reset your password</h5>
                    `
                }
                transporter.sendMail(mailoptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
    
                    }
                  });
                res.json({message : "check your mail"})

            })

        })
    })
})

router.post('/newPassword',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user)
        {
            return res.status(422).json({error:"try again session expired"})
        }
        bcrypt.hash(newPassword,15).then(hashedpassword=>{
            user.password= hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then(saveduser=>{
                res.json({message:"password updated success"})
            })
        }).catch(err=>{
           console.log(err)
        })
    })
})

module.exports = router
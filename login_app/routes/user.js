const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const Post = mongoose.model("Post")
const requireLogin = require('../middleWare/requireLogin')

router.use(express.json());

router.put('/user/:id',requireLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    //7atina req.param 5ater il id 9a3din njibou fih mil parametre
    .select("-password")
    .then(user=>{
        Post.find({posteBy:req.params.id})
        .populate("postedBy","_id name")
        .exec((err,posts)=>{
            if (err )
            {
                return res.status(422).json({error:err})
            }
            else
            {
                res.json({user,posts})
            }
        })
    }).catch(err=>{
        return res.status(404).json({error:"User not found"})
    })

})

module.exports = router 
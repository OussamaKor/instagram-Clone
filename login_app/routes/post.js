const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const requireLogin = require('../middleWare/requireLogin')


router.get('/allposts',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name") //populate t affichilik les détails mta liste passer en paramètre ---- kif nzid il parametre il dheni n7aded les champs illi n7eb nod5loulhom
    .populate("comments.postedBy","_id name")
    .then(Posts=>{
        res.json({Posts})
    })
    .catch(err=>{
        console.log(err)
    })
})
router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,pic} = req.body
    if ( !title || !body || !pic)
    {
        return res.status(412).json({error : "you need to add a picture with title and body"})
    }
    req.user.password = undefined 
    //maach yaffichilik il password 9oulchi aliih mouch mawjoud 
    const post = new Post({
        title : title ,
        body : body ,
        photo : pic ,
        postedBy : req.user
    })
    post.save().then(result=>{
        res.json({post:result})

    })
    .catch(err=>{
        console.log(err)
    })

})


//hedhi il router tlisti les posts illi sarterhom creation mil user illi houwa connecté
router.get('/myposts',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost : mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if ( err || !post )
        {
            return res.status(422).json({error:err})
        }
        if (post.postedBy._id.toString() === req.user._id.toString())
        {
            post.remove()
            .then(result=>{
                res.json({result})
            }).catch(err=>{
                console.log(err)
            })
        }
    })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
        },{
            new:true
        }).exec((err,result)=>{
            if(err)
            {
                return res.status(422).json({error:err})
            }
            else
            {
                res.json(result)
            }
        })
})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
        },{
            new:true
        }).exec((err,result)=>{
            if(err)
            {
                return res.status(422).json({error:err})
            }
            else
            {
                res.json(result)
            }
        })
})
router.put('/comment',requireLogin,(req,res)=>{
    const comment = {
        text : req.body.text ,
        postedBy :req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
        },{
            new:true
        })
        .populate("comments.postedBy","_id name")
        .populate("postedBy","_id name")
        //populate aamelneha 5ater réellement ander ken il id mta il user w ahna 7achetna bil name donc naamlou populate
        .exec((err,result)=>{
            if(err)
            {
                return res.status(422).json({error:err})
            }
            else
            {
                res.json(result)
            }
        })
})
module.exports = router 
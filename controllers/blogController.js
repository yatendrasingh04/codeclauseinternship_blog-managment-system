const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const Setting = require('../models/settingModel');
const { ObjectID } = require('mongodb');

const config = require('../config/config');
const nodemailer = require('nodemailer');

const sendCommentMail = async(name, email, post_id) => {

    try{
        
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions = {
            from:'BMS',
            to:email,
            subject:'New Reply',
            html:'<p>'+name+', has replied on your comment <a href="http://127.0.0.1:3000/post/'+post_id+'">Read here your replies.</a> </p>'
        }

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ",info.response);
            }
        });

    }catch(error){
        console.log(error.message);
    }

}

const loadBlog = async(req,res)=>{

    try {

        var setting = await Setting.findOne({});

        var limit = setting.post_limit;

        const posts = await Post.find({}).limit(limit);
        res.render('blog',{
            posts:posts,
            postLimit:limit
        });

    } catch (error) {
        console.log(error.message);
    }

}

const loadPost = async(req,res) =>{
    try {
        
        const likes = await Like.find({ "post_id":req.params.id,type:1 }).count();
        const dislikes = await Like.find({ "post_id":req.params.id,type:0 }).count();

        const post = await Post.findOne({ "_id":req.params.id });

        res.render('post',{post:post,likes:likes,dislikes:dislikes});
        
    } catch (error) {
        console.log(error.message);
    }
}

const addComment = async(req,res)=>{
    try {
        
        var post_id = req.body.post_id;
        var username = req.body.username;
        var email = req.body.email;
        var comment = req.body.comment;

        var comment_id = new ObjectID();

        await Post.findByIdAndUpdate({ _id:post_id },{
            $push:{
                "comments":{_id:comment_id, username:username,email:email, comment:comment }
            }
        });

        res.status(200).send({ success:true,msg:'Comment added!', _id:comment_id });

    } catch (error) {
        res.status(200).send({ success:false,msg:error.message });
    }
}

const doReply = async(req,res)=>{
    try{

        var reply_id = new ObjectID();
        await Post.updateOne({
            "_id":ObjectID(req.body.post_id),
            "comments._id":ObjectID(req.body.comment_id)
        },{

            $push:{
                "comments.$.replies":{ _id:reply_id, name:req.body.name, reply:req.body.reply }
            }

        });

        sendCommentMail(req.body.name, req.body.comment_email, req.body.post_id);

        res.status(200).send({ success:true,msg:'Reply added!',_id:reply_id });

    } catch (error) {
        res.status(200).send({ success:false,msg:error.message });
    }
}

const getPosts = async(req,res)=>{

    try {


        const posts = await Post.find({}).skip(req.params.start).limit(req.params.limit);
        res.send(posts);

    } catch (error) {
        res.status(200).send({ success:false,msg:error.message });
    }

}

module.exports = {
    loadBlog,
    loadPost,
    addComment,
    doReply,
    getPosts
}
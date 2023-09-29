const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/BMS");

const express = require("express");
const app = express();

var http = require('http').createServer(app);
var { Server } = require('socket.io');
var io = new Server(http,{});

const isBlog = require("./middlewares/isBlog");

app.use(isBlog.isBlog);

//for admin routes
const adminRoute = require("./routes/adminRoute");
app.use('/',adminRoute);

//for user routes
const userRoute = require("./routes/userRoute");
app.use('/',userRoute);

//for blog routes
const blogRoute = require("./routes/blogRoute");
app.use('/',blogRoute);

const Post = require('./models/postModel');
const Like = require('./models/likeModel');
const { ObjectID } = require('mongodb');

io.on("connection",function(socket){
    console.log('User Connected');

    socket.on("new_post",function(formData){
        console.log(formData);
        socket.broadcast.emit("new_post", formData);
    });

    socket.on("new_comment",function(comment){
        io.emit("new_comment",comment);
    });

    socket.on("new_reply",function(reply){
        io.emit("new_reply",reply);
    });

    socket.on("delete_post",function(postId){
        socket.broadcast.emit("delete_post",postId);
    });

    socket.on('increment_page_view', async function(post_id){
        var data = await Post.findOneAndUpdate({_id:ObjectID(post_id)}, {
            $inc: { views: 1 }
        },{
            new: true,
        });
        socket.broadcast.emit("updated_views",data);
    });

    socket.on("like", async function(data){
        await Like.updateOne({
            post_id:data.post_id,
            user_id:data.user_id
        }, {
            type:1
        },
        {
            upsert: true
        });

        const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
        const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

        io.emit("like_dislike",{
            post_id:data.post_id,
            likes:likes,
            dislikes:dislikes
        });
    });

    socket.on("dislike", async function(data){
        await Like.updateOne({
            post_id:data.post_id,
            user_id:data.user_id
        }, {
            type:0
        },
        {
            upsert: true
        });

        const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
        const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

        io.emit("like_dislike",{
            post_id:data.post_id,
            likes:likes,
            dislikes:dislikes
        });
    });
});

http.listen(3000,function(){
    console.log("Server is running");
});

// app.listen(3000,function(){
//     console.log("Server is running");
// });
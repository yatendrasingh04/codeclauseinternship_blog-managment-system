const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({

    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    type:{
        type:Number,
        required:true
    }

});

module.exports = mongoose.model('Like',likeSchema);
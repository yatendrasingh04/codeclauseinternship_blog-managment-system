const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({

    post_limit:{
        type:Number,
        required:true
    }

});

module.exports =  mongoose.model('Setting',settingSchema);
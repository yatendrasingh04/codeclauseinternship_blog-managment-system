const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({

    model_name:{
        type:String,
    },
    data:{
        type:String,
    }

});

module.exports = mongoose.model('Bin',postSchema);
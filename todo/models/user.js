var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose=require('passport-local-mongoose');
var User= new Schema({
     
    firstname: {
        type: String,
        default: ''
    },

    lastname: {
        type: String,
        default: ''
    },

    facebookId: String,
   
    admin:{
        type: Boolean,
        default: false 
    },
    permittedviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    permittedcreators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    permittededitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    permitteddeleters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

});

User.plugin(passportLocalMongoose);






var Users = mongoose.model('User',User);

module.exports = Users;
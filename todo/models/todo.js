const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const taskSchema= new Schema({
    
    todo:{
    	type: String,
    	required: true,
        unique: true
    },

    description:{
    	type: String,
    	required: true
    },

    date:{
        type: Date,
        required: true
    }
},{
	timestamps: true
});
const todoSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks:[taskSchema]
    

},{
    timestamps: true
});

var todoes = mongoose.model('todo',todoSchema);

module.exports = todoes;
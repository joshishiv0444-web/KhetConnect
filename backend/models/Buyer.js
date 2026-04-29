const mongoose = require('mongoose');

const Buyer = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        number:{
            type:Number,
            required:true
        },
        age:{
            type:Number,
            required:true,
        },
        dob:{
            type:Date,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true,
            minlength:6
        },
        occupation:{
            type:String,
            required:true
        }
    }
);

module.exports = mongoose.model('Buyer', Buyer);
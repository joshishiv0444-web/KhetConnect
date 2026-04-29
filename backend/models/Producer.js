const mongoose = require('mongoose');


const Farmer = new mongoose.Schema(
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
            required:true
        },
        dob:{
            type:Date,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        aad:{
            type:Number,
            required:true
        },
        password:{
            type:String,
            required:true,
            minlength:6
        }
    }
);

module.exports = mongoose.model('Producer', Farmer);
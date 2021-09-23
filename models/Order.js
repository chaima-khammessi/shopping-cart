const mongoose = require('mongoose');
const schema =  mongoose.Schema ; 


ObjectId = schema.ObjectId;

const orderSchema = mongoose.Schema({

    user : {
        type : ObjectId,
        ref : 'User',
        required : true
    },
    cart : {
        type : Object,
        required : true
    },
    adress :{
        type:String,
        required : true
    },
    name:{
        type : String,
        required : true
    },
    contact : {
        type : String,
        required : true

    },
    paymentId :{
        type : String,
        required : true

    },
    orderPrice : {
        type : String,
        required : true,

    }

});

module.exports = mongoose.model('Order' , orderSchema);
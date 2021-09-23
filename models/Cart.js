const mongoose = require('mongoose');


const cartSchema = mongoose.Schema({

    _id : {
        required:true,
        type : String,
    },
    totalquantity : {
        required : true,
        type : Number
    },
    totalprice: {
        required : true , 
        type : Number
    },
    selectedProdect:{
        required : true,
        type : Array
    },
    createAt : {
        type:Date,
        default : Date.now,
        index: {expires : ' 10000'}
    }

});
cartSchema.index({"lastModifiedDate": 1 },{ expireAfterSeconds: 10000 });


module.exports = mongoose.model('Cart' , cartSchema);
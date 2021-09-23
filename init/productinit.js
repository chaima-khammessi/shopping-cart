const product = require('../models/product');
const Product = require('../models/product');
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/Shopping-cart',{useNewUrlParser : true},(error)=>{
  if(error){
    console.log(error);
  }
  else{
    console.log('connectiong to DB...');

  }

})

const products = [new Product({
    imagePath:'/images/images.jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:220
}),
new product({
    imagePath:'/images/images (2).jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:270

}),
new product({
    imagePath:'/images/images (3).jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:320

}),
new product({
    imagePath:'/images/images.jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:300

}),
new product({
    imagePath:'/images/images5.jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:200

}), 
new product({
    imagePath:'/images/images6.jpg',
    productName:'Appel iphone12',
    information:{
        storageCapacity: 64,
        numberOfSIM: "Dual SIM",
        rearCameraResolution: 16,
        displaySize: 6.5
    },
    price:170

}), 
] 
    var done = 0;
for(var i = 0; i < products.length; i++){
    products[i].save((error , doc)=>{
        if(error){
            console.log(error);
        }
        console.log(doc);
        done ++ ; 
        if(done===products.length){
            mongoose.disconnect();
        }
    })
}

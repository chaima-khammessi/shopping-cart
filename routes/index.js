var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/Cart');
const stripe = require('stripe')('sk_test_51JblltHEZ7BFDikF0N4bABfNjdkoJZHs6xjFbcK0HrykCLlsvBrZ74umluCj6WaIV36v0jEbR0VQV8I7TfNUXqfe00Hp0xTQv1');
const Order = require('../models/Order')



/* GET home page. */
router.get('/', function (req, res, next) {
  const successMass = req.flash('success')[0];

  var totalProducts = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProducts = req.user.cart.totalquantity;
    } else {
      totalProducts = 0;
    }
  }


  Product.find({}, (error, doc) => {
    if (error) {
      console.log(error);
    }
    var ProductGrid = [];
    var colGgrid = 3;
    for (i = 0; i < doc.length; i += colGgrid) {
      ProductGrid.push(doc.slice(i, i + colGgrid))

    }
    res.render('index', {
      title: 'Shopping-cart',
      products: ProductGrid,
      checkuser: req.isAuthenticated(),
      totalProducts: totalProducts,
      successMass: successMass
    });
  })
});

router.get('/addtocart/:id/:price/:name', (req, res, next) => {

  /* Cart.deleteMany((error , doc)=>{
     console.log(doc);
 
   })*/

  req.session.hasCart = true;

  const cartID = req.user._id;
  const productPrice = parseInt(req.params.price, 10)
  const newProduct = {
    _id: req.params.id,
    price: productPrice,
    name: req.params.name,
    quantity: 1,

  }
  Cart.findById(cartID, (error, cart) => {
    if (error) {
      console.log(error);
    }
    if (!cart) {
      const newCart = new Cart({
        _id: cartID,
        totalquantity: 1,
        totalprice: productPrice,
        selectedProdect: [newProduct],
        createAt: Date.now()

      })

      newCart.save((error, doc) => {
        if (error) {
          console.log(error);
        }
        console.log(doc);

      })
    }
    var indexOfProduct = -1;
    if (cart) {
      for (var i = 0; i < cart.selectedProdect.length; i++) {
        if (req.params.id === cart.selectedProdect[i]._id) {
          indexOfProduct = i;
          break;
        }
      }
      if (indexOfProduct >= 0) {
        cart.selectedProdect[indexOfProduct].quantity = cart.selectedProdect[indexOfProduct].quantity + 1;
        cart.selectedProdect[indexOfProduct].price = cart.selectedProdect[indexOfProduct].price + productPrice
        cart.totalquantity = cart.totalquantity + 1;
        cart.totalprice = cart.totalprice + productPrice;
        cart.createAt = Date.now();
        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error);
          }
          console.log(doc);
          console.log(cart);
        })


      } else {
        cart.totalquantity = cart.totalquantity + 1;
        cart.totalprice = cart.totalprice + productPrice;
        cart.selectedProdect.push(newProduct);
        cart.createAt = Date.now();

        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error);
          }
          console.log(doc);
          console.log(cart);
        })


      }
    }

  })
  res.redirect('/')
})

router.get('/shopping-cart', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin')
    return;
  }
  console.log(req.session.hasCart);
  if (!req.user.cart) {
    res.render('shopping-cart', { checkuser: true, hasCart: req.session.hasCart, totalProducts: 0 })
    req.session.hasCart = false;

    return;

  }

  const userCart = req.user.cart
  const totalProducts = req.user.cart.totalquantity

  res.render('shopping-cart', { userCart: userCart, checkuser: true, totalProducts: totalProducts })
})
router.get('/increaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrice = (userCart.selectedProdect[index].price / userCart.selectedProdect[index].quantity);

    userCart.selectedProdect[index].quantity = userCart.selectedProdect[index].quantity + 1;
    userCart.selectedProdect[index].price = userCart.selectedProdect[index].price + productPrice;

    userCart.totalquantity = userCart.totalquantity + 1;
    userCart.totalprice = userCart.totalprice + productPrice;
    userCart.createAt = Date.now();
    console.log(userCart);

    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, doc) => {
      if (err) {
        console.log(err);
      }
      console.log(doc);
      res.redirect('/shopping-cart')

    })

  } else {
    res.redirect('shopping-cart');
  }
})

router.get('/decreaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrice = (userCart.selectedProdect[index].price / userCart.selectedProdect[index].quantity);

    userCart.selectedProdect[index].quantity = userCart.selectedProdect[index].quantity - 1;
    userCart.selectedProdect[index].price = userCart.selectedProdect[index].price - productPrice;

    userCart.totalquantity = userCart.totalquantity - 1;
    userCart.totalprice = userCart.totalprice - productPrice;
    userCart.createAt = Date.now();
    console.log(userCart);

    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, doc) => {
      if (err) {
        console.log(err);
      }
      console.log(doc);
      res.redirect('/shopping-cart')

    })

  } else {
    res.redirect('shopping-cart');
  }

  decreaseProduct
})






router.get('/deleteProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    console.log(userCart.selectedProdect.length)
    if (userCart.selectedProdect.length <= 1) {
      Cart.deleteOne({ _id: userCart._id }, (err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log(doc);
        res.redirect('/shopping-cart')
      })
    } else {
      userCart.totalprice = userCart.totalprice - userCart.selectedProdect[index].price;
      userCart.totalquantity = userCart.totalquantity - userCart.selectedProdect[index].quantity;

      userCart.selectedProdect.splice(index, 1);
      userCart.createAt = Date.now();
      console.log(userCart);
      Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log(doc);

        res.redirect('/shopping-cart')
      })

    }
  } else {
    res.redirect('/shopping-cart')
  }


})


router.get('/checout', (req, res, next) => {

  if (req.user.cart) {
    const errorMas = req.flash('error')[0]
    console.log(req.user);
      if(req.user.userName === undefined || req.user.adress ===undefined || req.user.contact ===undefined){
        req.flash('profileError', ['please update your information befor do order']);

        res.redirect('users/profile');
        return ;
      }

    res.render('checkout', {
      checkuser: true,
      totalProducts: req.user.cart.totalquantity,
      totalprice: req.user.cart.totalprice,
      errorMas: errorMas,
      user : req.user,

    })

  } else {
    res.redirect('/shopping-cart')
  }

})




router.post('/checkout', (req, res, next) => {

  stripe.charges.create({
    amount: req.user.cart.totalprice * 100,
    currency: "usd",
    source: req.body.stripeToken,
    description: "charge for test@example.com"
  },
    function (err, charge) {
      if (err) {
        console.log(err.raw.message);
        req.flash('error', err.raw.message)
        res.redirect('/checout')
      }

      console.log(charge);
      req.flash('success', 'successfuly bought products !!')
      const order = new Order({
        user: req.user._id,
        cart: req.user.cart,
        adress: req.body.adress,
        name: req.body.name,
        contact : req.body.contact,
        paymentId: charge.id,
        orderPrice: req.user.cart.totalprice
      });

      order.save((err, resualt) => {
        if (err) {
          console.log(err);
        }
        console.log(resualt);
        Cart.deleteOne({ _id: req.user.cart._id }, (err, doc) => {
          if (err) {
            console.log(err);
          }
          console.log(doc);
          res.redirect('/')
        })
      })

    });
})



module.exports = router;

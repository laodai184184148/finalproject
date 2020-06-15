const express = require('express');
const shopController = require('../controller/shop');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { ensureAuthenticated, forwardAuthenticated,authRole } = require('../config/auth');

router.get('/', shopController.getAllProducts);
router.get('/products/:id', shopController.getProductDetail);
router.get('/add-to-cart/:id', shopController.addtocart);
router.get('/cart', shopController.getCartpage);
router.post('/search',shopController.getsearchpage);
router.get('/remove/:id', shopController.removeItemFromCart);
router.get('/cart/checkout', shopController.getCheckoutpage);
router.post('/cart/checkout', shopController.postOrder);
router.get('/order', shopController.getorderpage);
router.get('/order/findorder/:id', shopController.getorderdetails);
router.post('/order/findorder', shopController.postsearchorderpage);

module.exports = router; 
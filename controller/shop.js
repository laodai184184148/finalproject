const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');

exports.getAllProducts = (req, res, next) => {
  Product.find()
        .then(products => {
            if (req.user == null)
                res.render('index_shop', {
                    prods: products,
                    pageTitle: 'Home',
                    user: req.user,
                });
            else if (req.user != null) {
                res.render('index_shop',
                    {
                        prods: products,
                        pageTitle: 'Home',
                        user: req.user,
                    });

            }
        })
        .catch(err => console.log(err));
};
exports.getProductDetail = (req, res, next) => {
  Product.findById(req.params.id)
    .then(product => {
      res.render('product-details', { 
        prod: product,
        pageTitle: 'Product Detail',
        name: 'Edward',
        user: req.user
      });
    })
    .catch(err => console.log(err));
}
exports.getsearchpage = (req, res, next) => {
  Product.find({ $text: { $search: req.body.search } })
    .then(products => {
      if (req.user == null)
        res.render('search', {
          prods: products,
          pageTitle: 'search',
          user: req.user,
          key: req.body.search
        });
      else if (req.user != null) {
        res.render('search',
          {
            prods: products,
            pageTitle: 'search',
            user: req.user,
            key: req.body.search
          });

      }
    })
    .catch(err => console.log(err));

}
exports.getorderpage = (req, res, next) => {
  res.render('order', {
    user: req.user,
    pageTitle: 'Search',
  })
}
exports.postsearchorderpage = (req, res, next) => {
  errors = [];
  if (req.body.phone.length < 10) {
    errors.push({ msg: 'Số điện thoại phải bao gồm 10 số' });
  }
  if (errors.length > 0) {
    res.render('order', {
      errors,
      user: req.user,
      pageTitle: 'Search',
    });
  }
  else {
    Order.find({ "cusdetails.phonenumber": req.body.phone })
      .then(orderr => {
        res.render('order', {
          user: req.user,
          pageTitle: 'Search result',
          ord: orderr,
          key: req.body.phone
        })
      })
      .catch(err => console.log(err));
  }
}
exports.getorderdetails = (req, res, next) => {
  Order.findById(req.params.id)
    .then(order => {
      res.render('order_infor', {
        products: order.items,
        user: req.user,
        order: order,
        pageTitle: 'order detailes'
      })
    })
    .catch(err => console.log(err));

}
exports.addtocart = (req, res, next) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.find()
    .then(products => {
      var product = products.filter(function (item) {
        return item.id == productId;
      });
      cart.add(product[0], productId);
      req.session.cart = cart;
      console.log(cart);

      res.redirect('/');
    })
    .catch(err => console.log(err));
}
exports.getCartpage = (req, res, next) => {
  if (!req.session.cart || req.session.cart.totalItems == 0) {
    return res.render('cart' , {
      title: 'Giỏ Hàng Của Bạn còn trống' ,
      products: null,
      pageTitle:'Cart',
      user: req.user
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('cart', {
    title: 'Giỏ Hàng Của Bạn',
    products: cart.getItems(),
    pageTitle:'Cart',
    totalPrice: cart.totalPrice,
    user: req.user
  });
}
exports.removeItemFromCart = (req, res, next) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;
  res.redirect('/cart');
}
exports.getCheckoutpage = (req, res, next) => {
  if (req.session.cart.totalItems == 0) {
    res.redirect('/')
  } else { 
    var cart = new Cart(req.session.cart);
    var today = new Date();
    res.render('checkout', {
      title: 'NodeJS Shopping Cart',
      products: cart.getItems(),
      totalPrice: cart.totalPrice,
      user: req.user,
      carrt: cart,
      pageTitle : 'checkout'
    })
  }
}
exports.postOrder = (req, res, next) => {
  var cart = new Cart(req.session.cart);
  var today = new Date();
  let errors = [];
  var order = new Order({
    items: cart.getItems(),
    shippingdeatils: {
      city: req.body.city,
      district: req.body.district,
      sub_district: req.body.sdis,
      street: req.body.street,
      houseNumber: req.body.houseNumber
    },
    shippingTime: {
      date: req.body.date,
      hour: req.body.hour
    },
    cusdetails: {
      name: req.body.fname,
      email: req.body.email,
      phonenumber: req.body.phone
    },
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,



    payment_method: req.body.payment_method,
    create_date: today
  });
  if (req.body.payment_method == 'Thanh Toán Khi Nhận Hàng') {
    order.payment_status = "Unpaid";
    order.del_status = "Waiting for  Delivery"
  }
  else {
    order.payment_status = "Paid";
    order.del_status = "Waiting for  Delivery"
  }
  if (!order.shippingdeatils.city || !order.shippingdeatils.district || !order.shippingdeatils.sub_district || !order.shippingdeatils.street || !order.shippingdeatils.houseNumber || !order.cusdetails.name || !order.cusdetails.email || !order.cusdetails.phonenumber) {
    errors.push({ msg: 'Vui Lòng Nhập đầy đủ các mục' });
  }
  if (errors.length > 0) {
    res.render('checkout', {
      errors,
      products: cart.getItems(),
      totalPrice: cart.totalPrice,
      user: req.user,
      carrt: cart,
      pageTitle : 'checkout'
    });

  } else {
    order.save()

      .then(result => {
        if (req.session.cart) {
          req.session.cart = null;
        }
        console.log(req.session.cart);

        res.render('order_detailes', {
          title: 'NodeJS Shopping Cart',
          products: order.items,
          user: req.user,
          order: order,
          pageTitle: 'post checkout'
        })

      })
      .catch(err => console.log(err));
  }
}

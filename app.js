const express=require('express');
const app=express();
const expressLayouts=require('express-ejs-layouts');
const mongoose=require('mongoose');
const db = require('./config/keys').MongoURL;
const flash= require('connect-flash');
const session=require('express-session')
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');

const swaggerUi=require('swagger-ui-express');
const swaggerDocument = require('./config/doc-api.json');
var options = {
  swaggerOptions: {
    authAction :{ JWT: {name: "JWT", schema: {type: "apiKey", in: "header", name: "Authorization", description: ""}, value: "Bearer <JWT>"} }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
require('./config/passport_local')(passport);
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT=process.env.PORT||3003;


//ejs
app.use(expressLayouts);
app.set('view engine','ejs');

//bodyparser
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



//app.use(express.static(__dirname + 'public'));
app.use(express.static(path.join(__dirname, 'public')));
//connect flash
app.use(flash())

//globals vars
app.use((req,res,next)=>{
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  next();
})
//routes
app.use('/users',require('./routes/users'));
app.use('/',require('./routes/shop'));
app.use('/admin',require('./routes/admin'));
app.use((req, res, next) => {
  res.status(404).send('404 Page Not Found')
})
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Some thing went wrong here')
})

//app.use(express.static('./views/public'))

app.listen(PORT,()=> console.log('Server started on port '+PORT));

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const croneJobs = require('./cron/timer')
let database = require('./DataBase/dbConnect')
const http=require('http');
const { createSocketConnection } = require('./sockets');
const { Server } = require('socket.io');

let usersRouter = require('./routes/userAuth');
let sellerRouter = require('./routes/sellerAuth');
let categoryRouter = require('./routes/categories');
let productRouter = require('./routes/product');
let auctionRouter = require('./routes/auction');
let notificationRouter = require('./routes/notification');


const app = express();

const server=http.createServer(app)
// const io=createSocketConnection(server);
const io = new Server(server, {
  cors: {
      origin: "http://localhost:3000", // Update this with your frontend URL
      methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
  }
});

// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));
app.use(cors());

croneJobs(io);

//socket connection
app.use((req, res, next) => {
  req.io = io; 
  next();
});

// Routes
app.use('/users', usersRouter);
app.use('/seller', sellerRouter);
app.use('/categories', categoryRouter);
app.use('/product', productRouter);
app.use('/auction', auctionRouter);
app.use('/notifications', notificationRouter);

io.of("/abc").on("connect",(socket)=>{
  console.log("Joining")
  socket.on("join",(data,callback)=>{
    console.log("Join",data)
    socket.join(data.userId)
  })
})

database();

// Error handling
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app,server, io};











// let createError = require('http-errors');
// let express = require('express');
// let path = require('path');
// let cookieParser = require('cookie-parser');
// let logger = require('morgan');
// let cors = require('cors')
// const {Server}=require('socket.io')
// const http=require('http');



// let usersRouter = require('./routes/userAuth')
// let sellerRouter = require('./routes/sellerAuth')
// let categoryRouter = require('./routes/categories')
// let productRouter = require('./routes/product')
// let auctionRouter = require('./routes/auction')
// const { createSocketConnection } = require('./sockets');
// let app = express();

// let database = require('./DataBase/dbConnect')
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/pictures', express.static(path.join(__dirname, 'pictures')));
// app.use(cors());

// const server = http.createServer(app);
// const io = createSocketConnection(server);
// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });


// croneJobs();

// app.use('/users', usersRouter);
// app.use('/seller', sellerRouter);
// app.use('/categories',categoryRouter);
// app.use('/product',productRouter)
// app.use('/auction', auctionRouter)

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// // Connect DB and Initialize server
// database();


// module.exports = app;

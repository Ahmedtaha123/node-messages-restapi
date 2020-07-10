const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@firstone-6y7ww.mongodb.net/${process.env.MONGODB_DEFUALT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else{
        cb(null, false);
    }
};

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({message: message, data: data});
});
mongoose.connect(MONGODB_URI,
    {useUnifiedTopology: true, useNewUrlParser: true 
    , useFindAndModify: false})
        .then(result => {
            console.log('mongo connected');               
            const server = app.listen(process.env.PORT || 8080);
            const io = require('./socket').init(server);
            io.on('connection', socket => {
                console.log('Client connected');    
            });
        })
        .catch(err => {
            console.log(err);
        });

// codepen html code
// <button id="get">Get Posts</button>
// <button id="post">Create a Posts</button>

// codepen javascript code
// const getButton = document.getElementById('get');
// const postButton = document.getElementById('post');

// getButton.addEventListener('click', () => {
//   fetch('http://localhost:8080/feed/posts')
//     .then(res => res.json())
//     .then(resData => console.log(resData))
//     .catch(err => {
//       console.log(err);
//     });
// });

// postButton.addEventListener('click', () => {
//   fetch('http://localhost:8080/feed/post',{
//     method: 'POST',
//     body: JSON.stringify({
//       title: 'a codepen post',
//       content: 'created via codepen'
//     }),
//     headers: {
//       'Content-type': 'application/json'
//     }    
//   })
//     .then(res => res.json())
//     .then(resData => console.log(resData))
//     .catch(err => {
//       console.log(err);
//     });
// });
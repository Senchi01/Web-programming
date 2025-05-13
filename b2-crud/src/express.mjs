import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import User from './model/UserSchema.mjs';
import snippetRoutes from './route/SnippetRouter.mjs';
import homeRouter from './route/homeRouter.mjs';
import userRoutes from './route/router.mjs';


dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } 
}));

// Enable use of flash messages and prepare the data object
app.use((req, res, next) => {
  res.data = {}
  res.data.flashMessage = null
  if (req.session && req.session.flashMessage) {
    res.data.flashMessage = req.session.flashMessage
    req.session.flashMessage = null
  }
  next()
})


app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }
  next();
});

app.use('/User', userRoutes);
app.use('/snippet', snippetRoutes);
app.use('/', homeRouter);


app.use((req, res, next) => {
  res.status(404).send('404: Requested page could not be found')
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default (port) => {
  port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening to port ${port}`)
  })
}
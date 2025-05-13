// controller/controller.mjs
import bcrypt from 'bcryptjs';
import User from "../model/UserSchema.mjs";
import Snippet from "../model/snippetSchema.mjs";

const controller = {

  getHome(req, res) {
    res.redirect('/home'); 
  },
  home(req, res) {
    const user = req.user;
    const flashMessage = res.data.flashMessage;
    const data = { 
      user,
      flashMessage
    }
    res.render('home', data);
  },

  login(req, res) {
    res.render('login', res.data );
  },

  async userLogedIn(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.flashMessage = `Welcome '${username}'!`
        res.redirect('/home'); 
      } else {
        req.session.userId = user._id;
        req.session.flashMessage = `invalid username or password`;
        res.redirect('/User/login');
      }
      
    } catch (error) {
      console.error('Error during login:', error); 
      req.session.flashMessage = `User Is not in database`;
      res.redirect('/User/login');
    }
  },

  logout(req, res) {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.redirect('/home');
        }
      });
    } else {

      res.redirect('/home');
    }
  },

  async showCreateUser(req, res) {
    res.render('register');
  },

  async addNewUser(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username })
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.userId = newUser._id;
        req.session.flashMessage =  `Welcome '${username}'!`;
        res.redirect('/home');
      }else{
        req.session.userId = null;
        req.session.flashMessage =  'User already registered (login instead)';
        res.redirect('/User/login');
      }
    } catch (error) {
      next(error);
    }
  },

  async showAddSnippet(req, res) {
    if (!req.session.userId) {
      req.session.flashMessage = '403: you must be logged in to create a snippet';
      return res.status(403).redirect('/User/login');
    }
    const user = req.user;

    res.render('createSnippet', {user});
  },

  async addNewSnippet(req, res, next) {
    try {
      const { title, content } = req.body;
      const user = req.user;
      const snippet = new Snippet({ title, content, owner: req.session.userId, creator: user.username });
      await snippet.save();
      req.session.flashMessage = 'Snippet created successfully';
      res.redirect('/snippet');
    } catch (error) {
      next(error);
    }
  },

  async showALlSnippets(req, res, next) {
    try {
      const snippets = await Snippet.find();
      const user = req.user;
      const flashMessage = res.data.flashMessage;
      const data = { 
        snippets,
        user,
        flashMessage
      }

      res.render('snippet', data ); 
    } catch (error) {
      next(error);
    }
  },

  async showMySnippets(req, res) {
    try {
      const userId = req.session.userId;
    
      if (!userId) {
        req.session.flashMessage = '403: you must be logged in to view your snippets';
        return res.status(403).redirect('/User/login');     
      }
      const snippets = await Snippet.find({ owner: userId });
      const user = req.user;
      const flashMessage = res.data;
      const data = { snippets, user, flashMessage};
      res.render('mySnippets', data);
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  async removeSnippet(req, res, next) {
    try {
      const snippet = await Snippet.findById(req.params.id);
      if (!snippet) {
        return res.status(404).send('Snippet not found');
      }
      if (snippet.owner.toString() !== req.session.userId.toString()) {
        return res.status(403).send('Forbidden');
      }
      await Snippet.findByIdAndDelete(snippet);
      req.session.flashMessage = 'Snippet removed successfully';
      res.redirect('/snippet'); 
    } catch (error) {
      next(error);
    }
  },

  async showUpdateSnippet(req, res, next) {
    try {
      const snippet = await Snippet.findById(req.params.id);
      if (!snippet) {
        return res.status(404).send('Snippet not found');
      }
      const user = req.user;
      const flashMessage = res.data;
      const data = { snippet, user, flashMessage };
      res.render('editSnippet',data);
    } catch (error) {
      next(error);
    }
  },

  async updateSnippet(req, res, next) {
    try {
      const { title, content } = req.body;
      await Snippet.findByIdAndUpdate(req.params.id, { title, content });
      req.session.flashMessage = 'Snippet updated successfully';
      res.redirect('/snippet');
    } catch (error) {
      next(error);
    }
  },


}

export default controller
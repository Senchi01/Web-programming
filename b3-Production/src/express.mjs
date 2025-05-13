// src/express.mjs
import dotenv from 'dotenv';
import express from 'express';
import http from 'http'; // Import http module
import { Server } from 'socket.io'; // Import Socket.io
import router from './route/router.mjs';
import webhookRouter from './route/webhookRouter.mjs';

dotenv.config();
const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server); // Initialize Socket.io

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook middleware
const verifyWebhook = (req, res, next) => {
  const source = req.headers['x-gitlab-token'];
  if (!source || source !== process.env.API_KEY) {
    return res.status(401).send('Unauthorized');
  }
    next();
};

app.use('/', router);
app.use('/webhook', verifyWebhook, webhookRouter);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


app.use((req, res, next) => {
  res.status(404).send('404: Requested page could not be found')
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
export { io };


export default (port) => {
  port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Listening to port ${port}`)
  })
}
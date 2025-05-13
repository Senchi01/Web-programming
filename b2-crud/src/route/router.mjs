// route/router.mjs
import express from 'express';
import controller from '../controller/controller.mjs';
const router = express.Router();


router.get('/login', controller.login);


router.post('/login', controller.userLogedIn);


router.get('/register', controller.showCreateUser);

router.post('/register', controller.addNewUser );

router.get('/logout', controller.logout);



export default router
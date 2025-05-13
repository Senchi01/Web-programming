import express from 'express';
import controller from '../controller/controller.mjs';
const router = express.Router();

export default router;

router.get('/home', controller.home);
router.get('/', controller.getHome);
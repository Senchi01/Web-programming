// src/route/webhookRouter.mjs
import express from 'express';
import controller from '../controller/controller.mjs';
const router = express.Router();


router.post('/', controller.handleWebhook);

export default router;
// src/route/router.mjs
import express from 'express';
import controller from '../controller/controller.mjs';

const router = express.Router();


router.get('/', controller.getIssues)
router.get('/issues', controller.getFetchedIssue)


export default router;
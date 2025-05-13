// route/snippetRouter.mjs
import express from 'express';
import controller from '../controller/controller.mjs';
import checkOwnership from '../middleware/checkOwnership.mjs';
const router = express.Router();

router.get('/', controller.showALlSnippets );

router.get('/create', controller.showAddSnippet);

router.post('/create', controller.addNewSnippet );

router.get('/:id/edit', controller.showUpdateSnippet);

router.post('/:id/edit', checkOwnership, controller.updateSnippet);

router.post('/:id/delete', controller.removeSnippet );

router.get('/my-snippets', controller.showMySnippets);



export default router;

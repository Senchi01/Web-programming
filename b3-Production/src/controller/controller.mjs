// src/controller/controller.mjs
import { io } from '../express.mjs';
import model from '../model/model.mjs';


const controller = {
  // Fetch GitLab issues
  async getFetchedIssue(req, res) {
    try {
      const projectId = process.env.PROJECT_ID;
      const issues = await model.fetchIssues(projectId);
      res.render('issues', { issues }); 
    } catch (error) {
      console.error('Error fetching GitLab issues:', error);
      res.status(500).send('Error fetching GitLab issues');
    }
  },

  getIssues(req, res) {
    res.redirect('/issues');
  },

  async handleWebhook(req, res) {
    const eventType = req.headers['x-gitlab-event'];
    const payload = req.body;
    try {
      switch (eventType) {
        case 'Issue Hook':
          io.emit('issueUpdate', payload); 
          break;
        default:
          console.log('Unhandled event type:', eventType);
          break;
      }

      res.status(200).send('Webhook received successfully');
    } catch (error) {
      console.error('Error processing GitLab webhook:', error);
      res.status(500).send('Error processing GitLab webhook');
    }
  }
}



export default controller;

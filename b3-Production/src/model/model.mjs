// src/model.mjs
import axios from "axios";

const model = {
  async fetchIssues(projectId) {
    try {
      const response = await axios.get(`https://gitlab.lnu.se/api/v4/projects/${projectId}/issues`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      });
      const issues = response.data;
      return issues;
    } catch (error) {
      console.error('Error fetching GitLab issues:', error);
      return [];
    }
  }
};

export default model;

const aiClient = require('../config/aiClient');

const runComplaintAnalysis = async (text) => {
  try {
    const response = await aiClient.post('/analyze', { text });
    return response.data;
  } catch (error) {
    console.error('AI analyze failed:', error.message);
    return null;
  }
};

const runComplaintClustering = async (complaints, maxClusters = 8) => {
  try {
    if (!Array.isArray(complaints) || complaints.length === 0) {
      return null;
    }

    const response = await aiClient.post('/cluster', {
      complaints,
      max_clusters: maxClusters
    });

    return response.data;
  } catch (error) {
    console.error('AI cluster failed:', error.message);
    return null;
  }
};

module.exports = {
  runComplaintAnalysis,
  runComplaintClustering
};

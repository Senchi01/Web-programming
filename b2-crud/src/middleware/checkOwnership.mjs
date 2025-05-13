// middleware/checkOwnership.mjs
import Snippet from "../model/snippetSchema.mjs";

const checkOwnership = async (req, res, next) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).send('Snippet not found');
    }
    if (snippet.owner.toString() !== req.session.userId.toString()) {
      return res.status(403).send('Forbidden');
    }
    req.snippet = snippet; 
    next();
  } catch (error) {
    next(error);
  }
};

export default checkOwnership;

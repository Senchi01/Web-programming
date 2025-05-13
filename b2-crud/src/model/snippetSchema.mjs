// model/snippetModle.mjs

import mongoose from 'mongoose';
const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: String, required: true }
});

const snippet = mongoose.model('Snippet', snippetSchema);

export default snippet;
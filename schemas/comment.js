const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  // (commentId), user, password, content, createdAt
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  content: {
    type: String
  },
  postId: {
    type: String, // ObjectID?
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

commentsSchema.virtual('commentId')
    .get(function() { return this._id; });

module.exports = mongoose.model("comments", commentsSchema); // <- '콜렉션명'이라고 보면 된대..!



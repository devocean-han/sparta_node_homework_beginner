const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  // (postId), user, password, title, content, createdAt
  // _id: {
  //   type: String,
  //   alias: "postId"
  // },
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  title: {
    type: String
  },
  content: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// postsSchema.virtual('postId')
//     .get(function() { return this._id; });
postsSchema.virtual('postId')
    .get(function() { return this.id; }); // 이것도 작동한다. _id라고 하지 않아도, id가 _id를 가리키는 getter로 설정되어 있어서.

module.exports = mongoose.model("posts", postsSchema); // <- '콜렉션명'이라고 보면 된대..!



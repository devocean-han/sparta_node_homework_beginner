const express = require('express');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
// const indexRouter = require('./routes/index');

// mongoose로 MongoDb 연결
const connect = require('./schemas/index');
connect(); // 연결 실행

// req.body를 사용하기 위한 body parser 미들웨어를 지정함
app.use(express.json());

// 전역 미들웨어로 comments, posts 라우터를 등록함
// app.use("/posts", postsRouter)
// app.use("/comments", commentsRouter)
app.use("/api", [postsRouter, commentsRouter]);
// app.use("/api", postsRouter)

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});
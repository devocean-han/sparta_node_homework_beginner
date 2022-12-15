const mongoose = require("mongoose");

const connect = () => {
  mongoose
    // .connect("mongodb://localhost:27017/spa_mall")
    .connect("mongodb://127.0.0.1:27017/homework_beginner") // => 없는 데이터베이스 이름을 넣어도 잘 작동할까?
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
}); // 이건 왜 필요한거지? .catch에서 받는 에러 내용을 얘가 정의하는 건가??

module.exports = connect;
/*
"/comments/..." 라우터 정의
*/

const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post");
const Comments = require("../schemas/comment");

// // req.body를 사용하기 위한 body parser 미들웨어를 지정함
// app.use(express.json());
// // => 이걸 여기다 지정해야 하는가, app.js 내에 해야 하는가?


// (req.params, req.body 등이) 빈 'Object'(객체)인지 테스트
function isEmptyObject(value) {
  return value // null과 undefined로 주어져도 에러를 던지지 않도록.
      && Object.keys(value).length === 0
      && value.constructor === Object;
}


// POST - 댓글 작성
// - 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post('/comments/:_postId', async (req, res) => {

    // params의 _postId 체크
    // 근데 아마 _postId가 아예 없고서는 요청이 불가능할 것이다. 차라리
    // 해당 postId를 가지는 게시글이 있냐 없냐를 검사하는 게 더 합리적이겠다...
    const postId = req.params._postId;
    if (!postId) { // _postId가 빈 채로 요청이 들어왔다면 id는 undefined일 것임.
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

    // body 체크
    const { user, password, content } = req.body;
    if (!user) { // user, password, content가 차례로 없을 때:
        return res.status(400).json({ message: "유저명을 입력해주세요."})
    } else if (!password) {
        return res.status(400).json({message: "비밀번호를 입력해주세요."})
    } else if (!content) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요."})
    }

    // 400 Bad request
    // 해당하는 게시글 id가 없음


    // DB에 insert하기
    const commented = await Comments.create({ user, password, content, postId });
    console.log(commented);
    res.status(200).json({ message: "댓글을 생성하였습니다." });
})


// GET - 댓글 조회(목록)
// - 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get('/comments/:_postId', async (req, res) => {

    // params의 _postId 체크
    // 근데 아마 _postId가 아예 없고서는 요청이 불가능할 것이다. 차라리
    // 해당 postId를 가지는 게시글이 있냐 없냐를 검사하는 게 더 합리적이겠다...
    const postId = req.params._postId;
    if (!postId) { // postId가 undefined면:
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    // 400 Bad request
    // 해당하는 게시글 id가 없음
    // => 그냥 빈 데이터 반환함.


    // 데이터 가져오기: commentId, user, content, createdAt
    const comment_list = await Comments.find(
        { postId: postId },
        'commentId user content createdAt',
        { sort: '-createdAt' }
    );
    res.status(200).json({ data: comment_list })

    // if postId를 입력받지 못한 경우 {
    //     return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    // }
    // id로 조회해 가져온 후
    // if postId에 해당하는 게시글이 존재하지ㅇ 않을 경우 {
    //     return res.status(404).json({ message: "이 id에 해당하는 게시글이 존재하지 않습니다."})
    // } else {
    //     return res.status(200).json({ data })
    // }
})


// PUT - 댓글 수정
// - 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put('/comments/:_commentId', async (req, res) => {

    // 400 bad request
    // params의 _commentId 체크
    // 아마 _commentId가 아예 비어서는 PUT 요청 자체가 불가능할 것이다.
    const commentId = req.params._commentId;
    if (!commentId) { // commentId가 undefined면:
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    // 400 bad request
    // body 체크 - password와 content
    const { password, content } = req.body;
    if (!content) { // content가 없거나 빈 문자열이라면
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    } else if (!password) { // password가 없거나 빈 문자열이라면
        return res.status(400).json({ message: "비밀번호를 입력해주세요." });
    }

    // 400 bad request
    // params 체크 - 몽고db의 ObjectID로 변환될 수 있는 '유효한' id인가
    let comment;
    try {
        comment = await Comments.findById({ _id: commentId });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    // 404 Not found
    // 해당 id의 댓글이 존재하지 않음 (comment가 null일 것임)
    if (!comment) {
        return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
    }

    // 401 Unauthorized
    // 해당 id의 댓글은 존재하나 비밀번호가 올바르지 않음
    if (comment.password !== password) {
        return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    // 200 Success
    const modified = await Comments.findByIdAndUpdate(
        { _id: commentId },
        { $set: { content: content } }
    );
    res.status(200).json({ message: "댓글을 수정하였습니다." });


    // if 400 id나 body를 제대로 입력받지 못했으면 {
    //     400 bad request
    //     res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    // } else if 400 body안에 content를 입력받지 못했으면 {
    //     400 bad request
    //     res.status(400).json({ message: "댓글 내용을 입력해주세요." })
    // }
    // id로 조회해서
    // if 404 해당 id의 댓글이 존재하지 않을 경우 {
    //     404 not found
    //     res.status(404).json({ message: "댓글 조회에 실패하였습니다." })
    // } else if 401 password가 안 맞으면 {
    //     401 unauthorized
    //     res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    // } else 200 다 잘 됐으면 {
    //     db에서 수정하고
    //     res.status(200).json({ message: "댓글을 수정하였습니다." })
    // }
})

// DELETE - 댓글 삭제
// - 원하는 댓글을 삭제하기
router.delete('/comments/:_commentId', async (req, res) => {
    const commentId = req.params._commentId;

    // 400 Bad request
    // body 체크 - password
    const { password } = req.body;
    if (!password) { // password가 없거나 빈 문자열이라면
        return res.status(400).json({ message: "비밀번호를 입력해주세요." });
    }

    // 400 Bad request
    // params 체크 - 몽고db의 ObjectID로 변환될 수 있는 '유효한' id인가
    let comment;
    try {
        comment = await Comments.findById({ _id: commentId });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    // 404 Not found
    // 해당 id의 댓글이 존재하지 않음 (comment가 null일 것임)
    if (!comment) {
        return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
    }

    // 401 Unauthorized
    // 해당 id의 댓글은 존재하나 비밀번호가 올바르지 않음
    if (comment.password !== password) {
        return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    // 200 Success
    const deleted = await Comments.findByIdAndDelete({ _id: commentId });
    res.status(200).json({ message: "댓글을 삭제하였습니다." });


    // const { password } = req.body;
    // if 400 id(params)나 body를 제대로 입력받지 못했으면 { // = id가 null이면? password가 null이나 undefined면?
    //     400 bad request
    //     res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    // }
    //
    // id로 조회해서
    // if 404 해당 id의 게시글이 존재하지 않을 경우 { // = 조회결과 리스트 길이가 0. 아니면 그냥 결과가 null? 몽고디비가 어떻게 돌려주느냐에 따라 달라짐.
    //     404 not found
    //     res.status(404).json({ message: "댓글 조회에 실패하였습니다." })
    // } else if 401 password가 안 맞으면 { // = db.password !== password
    //     401 unauthorized
    //     res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    // } // 200 이부분을 그냥 else로 받으면 될까?
    // else if 200 다 잘 됐으면 { // = 바디에 password라는 항목이 있고, 게시글 id도 잘 넣어서 요청했다면
    //     db에서 삭제하고
    //     res.status(200).json({ message: "댓글을 삭제하였습니다." })
    // }
})


module.exports = router;
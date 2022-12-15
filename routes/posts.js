/*
"/posts/..." 라우터 정의
*/

const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post");

const mongoose = require("mongoose");

// // req.body를 사용하기 위한 body parser 미들웨어를 지정함
// app.use(express.json());
// // => 이걸 여기다 지정해야 하는가, app.js 내에 해야 하는가?


// (req.params, req.body 등이) 빈 'Object'(객체)인지 테스트
function isEmptyObject(value) {
  return value // null과 undefined로 주어져도 에러를 던지지 않도록.
      && Object.keys(value).length === 0
      && value.constructor === Object;
}


// POST - 게시글 작성
// - 제목, 작성자명, 비밀번호, 작성 내용을 입력하기
router.post('/posts', async (req, res) => {
    // const data = {
    //     user: req.body.user,
    //     password: req.body.password,
    //     ...
    // }
    // 입력받은 데이터: user, password, title, content
    // db에 저장: user, password, title, content, createdAt(은 자동 지정)
    // => mongoDB ObjectID가 사실 생성 일자도 포함하고 있다는 것은 일단 그냥 넘기자.
    //      게시글ID로만 사용하자.

    const { user, password, title, content } = req.body;
    if (!user || !password || !title || !content) {
        return res.status(400).json({ "message": "데이터 형식이 올바르지 않습니다." })
    }
    const posted = await Posts.create({ user, password, title, content });
    console.log(posted);
    res.status(200).json({ "message": "게시글을 생성하였습니다." });

    // if 잘 처리됐으면 = body가 잘 들어왔으면 {
    //     const data = {...req.body}
    //     db에 insert하기
    //     res.status(200).json({ "message": "게시글을 생성하였습니다." })
    // } else if body 또는 params를 입력받지 못했으면 {
    //     res.status(400).json({ "message": "데이터 형식이 올바르지 않습니다." })
    // } else { ? }
});


// GET - 게시글 조회(목록)
// - (게시글id,) 제목, 작성자명, 작성 날짜를 조회하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get('/posts', async (req, res) => {
        // postId:
        // user:
        // title:
        // createAt:
        // 의 모음 배열을 반환해야 함.
    // console.log("req.params: ", req.params, typeof req.params); // 빈 req.params는 {}가 됨.
    // console.log("req.body: ", req.body, typeof req.body); // 빈 req.params는 {}가 됨.
    // console.log(isEmptyObject(req.params));
    // console.log(isEmptyObject(req.body));

    // const post_list = await Posts.find();
    // => 얘가 포함하는 정보는 postId, user, password, title, content, createdAt

    // 따라서 postId, user, title, createdAt 필드만 가져오게 하기:
    // const post_list = await Posts.find({}, 'postId user title createdAt', {sort: '-createdAt'});

    // 컬럼명 바꿔서 데려오기:
    const post_list = await Posts.find(
        {},
        // 'postId user title createdAt',
        {'postId': '$_id', 'user': '$user', 'title': '$title', 'createdAt': '$createdAt'},
        {sort: '-createdAt'}
    );

    // _id 필드 이름을 어떻게 postID라고 바꾸지? => 해결중...

    res.status(200).json({ data: post_list })
});

// GET - 게시글 상세 조회
// 제목, 작성자명, 작성 날짜, 작성 내용을 조회하기
// (검색 기능이 아닙니다. 간단한 게시글 조회만 구현해주세요.)
router.get('/posts/:_postID', async (req, res) => {
    const id = req.params._postID; // 이제 id는 숫자가 아니게 될 것이므로 더이상 Number()화는 하지 않는다.
    // if (!id) { // id가 null, undefined, 0, -0, 0n일 때? 정확한가?
    //     // _postID파트에 아무것도 안 넣어 보내면 무슨 값으로 도달하는지 테스트하기.
    //     return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다."})
    // }
    let post;
    try {
        post = await Posts.findById({ _id: id });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
    post = await Posts.findById({ _id: id }, "postId user title content createdAt");
        // postId:
        // user:
        // title:
        // content:
        // createdAt:

    res.status(200).json({ data: post })

    // if 잘 됐으면 {
    //
    //     res.status(200).json({ data })
    // } else if body 또는 params를 입력받지 못함녀 {
    //     res.status(400).json({ message: "데이터 형식이 올바르지 않습니다."})
    // } else { ? }
});

// PUT - 게시글 수정
// - API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 수정되게 하기
router.put('/posts/:_postID', async (req, res) => {
    const id = req.params._postID;
    const { password, title, content } = req.body;
        // password, title, content중 이름이 같은 것만 가져오겠지..?
    // 400 body를 제대로 입력받지 못했으면
    if (!password || !title || !content) {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

    // const post = await Posts.find({ postId: id });
    // const post = await Posts.findById({ _id: id });
    let post;
    try {
        post = await Posts.findById({ _id: id });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
    console.log(id, typeof id);
    // console.log(post);

    // 404 해당 id의 게시글이 존재하지 않을 경우 - post가 null일 것임
    if (!post) {
         return res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
    }
    // 401 해당 id의 게시글은 존재하나 비밀번호가 맞지 않을 경우
    if (post.password !== password) {
        return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    }
    // 200 비밀번호가 맞는 경우
    const modified = await Posts.findByIdAndUpdate(
        { _id: id },
        { $set: { title: title, content: content } }
    );
    console.log(modified); // 수정되기 전 버전이 출력된다...;;
    res.status(200).json({ message: "게시글을 수정하였습니다." });

    // id로 조회해서
    // if 200 다 잘 됐으면 {
    //     db에서 수정하고
    //     res.status(200).json({ message: "게시글을 수정하였습니다." })
    // } else if 400 id나 body를 제대로 입력받지 못했으면 {
    //     400 bad request
    //     res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    // } else if 401 password가 안 맞으면(이걸 검사하는 항목이 왜 없는가는 모르겟지만=> 이것도 검사하라고 함) {
    //     401 unauthorized
    //     res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    // } else if 404 해당 id의 게시글이 존재하지 않을 경우 {
    //     404 not found
    //     res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
    // }
})

// DELETE - 게시글 삭제
// - API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 삭제되게 하기
router.delete('/posts/:_postID', async (req, res) => {
    const id = req.params._postID;
    const { password } = req.body;

    // 400 id나 body를 제대로 입력받지 못했으면
    if (!password) { // id가 '없는'것은 아예 DELETE로 요청을 못 보냄.
                    // params에 뭐라도 넣어서 요청해야 하는데 '유효하지 않은 id'는 아래에서 검사함
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

    // const post = await Posts.find({ postId: id });
    // const post = await Posts.find({ _id: mongoose.Types.ObjectId(id) }); // "mongoose 모듈을 찾을 수 없음." 에러 발생
    let post;
    try {
        post = await Posts.findById({_id: id});
    } catch (error) {
        // if (error instanceof mongoose.Error.CastError) { // mongoose.Error.CastError를 해보았으나 인식 안됨.
        //     return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
        // } else {
        //     console.error(`Error: ${error.message}`)
        //     return
        // }
        console.log(error.message);
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
    // console.log(typeof password, typeof post[0].password, password === password)
    console.log(id);
    console.log(post); // null

    // 404 해당 id의 게시글이 존재하지 않을 경우 - post가 null일 것임.
    if (!post) {
         return res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
    }
    // 401 해당 id의 게시글은 존재하나 비밀번호가 맞지 않을 경우
    if (post.password !== password) {
        return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    }
    // 200 비밀번호가 맞는 경우
    const deleted = await Posts.findByIdAndDelete({ _id: id });
    console.log(deleted);
    res.status(200).json({ message: "게시글을 삭제하였습니다." })



    // if 400 id(params)나 body를 제대로 입력받지 못했으면 { // = id가 null이면? password가 null이나 undefined면?
    //     400 bad request
    //     res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    // }
    //
    // id로 조회해서
    // if 404 해당 id의 게시글이 존재하지 않을 경우 { // = 조회결과 리스트 길이가 0. 아니면 그냥 결과가 null? 몽고디비가 어떻게 돌려주느냐에 따라 달라짐.
    //     404 not found
    //     res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
    // } else if 401 password가 안 맞으면 { // = db.password !== password
    //     401 unauthorized
    //     res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
    // } // 200 이부분을 그냥 else로 받으면 될까?
    // else if 200 다 잘 됐으면 { // = 바디에 password라는 항목이 있고, 게시글 id도 잘 넣어서 요청했다면
    //     db에서 삭제하고
    //     res.status(200).json({ message: "게시글을 삭제하였습니다." })
    // }
})


module.exports = router;
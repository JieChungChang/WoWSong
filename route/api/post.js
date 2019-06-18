const cst           = require('../../util/constants.js');
const express       = require('express');
const router        = express.Router();
const request       = require('request');
const db            = require('../../util/sequelize.js');
const getAll        = require('../../controllers/post.js').getAll;
const tokenCheck    = require('../../controllers/crypto.js').tokenCheck;
const validations   = require('../../controllers/validations.js');
const ytApiKey      = require('../../util/.key/keys.js').ytApiKey;
const secrete       = require('../../util/.key/keys.js').secrete;
const S3imgHandle   = require('../../controllers/S3imgHandle.js');
const uploadImg     = S3imgHandle.uploadImg;
const deleteImg     = S3imgHandle.deleteImg;

// 取得全部 POST 頁面 API
router.get('/all', (req, res) => {
    const {paging}  = req.query;
    if ( isNaN(paging) ) {
        return res.send({result: {error: 'Unavailable Query String'}});
    }
    const postsLimit  = 3;
    const postsOffset = paging==0 ? 0:(paging*postsLimit);

    db.posts.findAll({offset: postsOffset, limit: postsLimit, include: [{model: db.comments}, {model: db.memberLikes}], order: [[ 'time', 'DESC' ]]})
    .then((results)=> {
        const postsResult = getAll(results, postsLimit, paging);
        return res.send({result: postsResult});
    });
});

// 新增貼文
router.post('/', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    const {video_id} = req.body;
    const {content}  = req.body;
    const verification = validations.newPostValidate(access_token, video_id, content);
    if (!verification.result) {
        const {statusCode} = verification.information;
        const {message} = verification.information;
        return res.status(statusCode).send({error: message});
    };

    tokenCheck(access_token, (checkResult, message, token, memberData)=>{
        if (!checkResult) {
            res.clearCookie('access_token');
            return res.status(403).send({error: message});
        } else {
            const reqUrl = `https://www.googleapis.com/youtube/v3/videos?id=${video_id}&key=${ytApiKey}&part=snippet`;
            request.get(reqUrl, function(error, response, body) {
                const bodyObj = JSON.parse(body);
                if ( bodyObj.items[0] ) {
                    console.log(bodyObj.items[0].snippet);
                    const picture = bodyObj.items[0].snippet.thumbnails.high.url;
                    const title = bodyObj.items[0].snippet.title;
                    db.sequelize.transaction((t) => {
                        // 新增貼文
                        return db.posts.create({
                            member_account: memberData.account,
                            video_id: video_id,
                            title: title,
                            picture: picture,
                            content: content,
                            time: Date.now(),
                            view_times: 0
                        }, {
                            transaction: t
                        });
                        // 新增貼文 End
                        // throw new Error('Error test');
                    })
                    .then((insertResult)=> {
                        res.cookie('access_token', token);
                        return res.status(200).send({result: insertResult});
                    })
                    .catch((err)=>{
                        return res.status(500).send({error: 'Create post failed'});
                    });
                } else {
                    return res.status(400).send({error: 'Can\'t get video title'});
                }
            });
        };
    });
});

// 刪除貼文
router.delete('/', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    const {post_id} = req.body;
    const verification = validations.deletePostValidate(access_token, post_id);
    if (!verification.result) {
        const {statusCode} = verification.information;
        const {message} = verification.information;
        return res.status(statusCode).send({result: false, message: message});
    };
    db.sequelize.transaction((t) => {
        return db.members.findOne({
            where: {access_token: access_token},
            include: [{
                model: db.posts,
                where: {id: post_id}
            }],
            transaction: t
        })
        .then( (result) => {
            if (result) {
                return db.posts.destroy({
                    where: {
                        id: post_id
                    },
                    transaction: t
                })
                .then((deletetResult)=> {
                    const image = result.posts[0].picture.split('/').pop();
                    deleteImg.s3delete(image, 'ytimage', (s3DeleteResult)=> {
                        if (s3DeleteResult) {
                            return res.status(200).send({result: true, message: result.posts.id});
                        } else {
                            return res.status(200).send({result: true, message: 'S3 update failed!'});
                        }
                    });
                })
                .catch(function(err) {
                    t.rollback();
                    return res.status(500).send({error: 'Delete post failed'});
                });
            } else {
                return res.status(200).send({result: false, message: 'Can not find post'});
            }
        })
        .catch(function(err) {
            t.rollback();
            return res.status(500).send({error: 'Delete post failed'});
        });
    });
});

// 修改貼文
router.patch('/', uploadImg.multiPartHandle.single('file'), (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    const {post_id}  = req.body;
    const {content}  = req.body;
    const verification = validations.updatePostValidate(access_token, post_id, content);
    if (!verification.result) {
        const {statusCode} = verification.information;
        const {message} = verification.information;
        return res.status(statusCode).send({result: false, message: message});
    };
    db.members.findOne({where: {access_token: access_token},
        include: [
            {
                model: db.posts,
                where: {id: post_id}
            }
        ]})
    .then((result) => {
        if (result) {// 如果帳號 與 post 作者符合 就可以更新
            if ( req.file ) {// 如果 user 有改照片 S3 才需要上傳檔案
                const MIME_TYPE_MAP = {
                    'image/png': 'png',
                    'image/jpeg': 'jpg',
                    'image/jpg': 'jpg'
                };
                uploadImg.s3upload(req.file.buffer, result.posts[0].picture.split('/').pop(), 'yt-'+post_id+'-'+Date.now()+'.'+MIME_TYPE_MAP[req.file.mimetype], 'ytimage', (uploadResult, url)=>{
                    if (uploadResult) {
                        console.log(url);
                        console.log(content);

                        db.posts.update(
                            {picture: url, content: content},
                            {where: {id: post_id}}
                        )
                        .then((updateResult)=> {
                            console.log('Update Result:');
                            console.log(updateResult[0]);
                            // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值
                            if (updateResult[0]) {
                                return res.status(200).send({updateResult: true, post_id: post_id, message: 'Update Post Successfully!'});
                            } else {
                                return res.status(200).send({updateResult: true, post_id: post_id, message: 'Didn\'t Update Anything!'});
                            }
                        });
                    } else {
                        return res.status(200).send({updateResult: false, post_id: post_id, message: 'Upload to S3 Fail!'});
                    }
                });
            } else { // 如果 user 沒有改照片 直接更新內容 S3 不需要上傳檔案
                db.posts.update(
                    {content: content},
                    {where: {id: post_id}}
                )
                .then((updateResult)=> {
                    console.log('Update Result:');
                    console.log(updateResult[0]);
                    // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值
                    if (updateResult[0]) {
                        return res.status(200).send({updateResult: true, post_id: post_id, message: 'Update Post Successfully!'});
                    } else {
                        return res.status(200).send({updateResult: true, post_id: post_id, message: 'Didn\'t Update Anything!'});
                    }
                });
            }
        } else {
            return res.status(200).send({updateResult: false, post_id: post_id, message: 'Token Didn\'t Match'});
        }
    })
    .catch(function(err) {
        return res.status(500).send({updateResult: false, message: err});
    });
});

router.patch('/imageURL', (req, res) => {
    const {secreteFromAWS}  = req.body;
    const {imgURL} = req.body;
    const {post_id} = req.body;
    if (secreteFromAWS !== secrete) {
        return res.status(403).send({error: 'Invalidate secrete'});
    } else {
        db.posts.update(
            {picture: imgURL},
            {where: {id: post_id}}
        )
        .then((updateResult)=> {
            console.log('Update Result:');
            console.log(updateResult[0]);
            // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值
            if (updateResult[0]) {
                return res.status(200).send({post_id: post_id, message: 'Update Post Successfully!'});
            };
        });
    }
});

// 計算 account 全部 post 數量 API
router.get('/countAll', (req, res) => {
    const {account} = req.query;

    db.posts.findAndCountAll({where: {member_account: account}})
    .then((result) => {
        res.status(200).send({count: result.count, follower: result.rows});
    })
    .catch((error)=>{
        res.status(500).send(error);
    });
});

// 加 Comment
router.post('/comment', (req, res) => {
    const access_token    = req.headers.authorization.substring(7);
    const {post_id} = req.body;
    const {commetInput} = req.body;
    const verification = validations.commentValidate(access_token, post_id, commetInput);
    if (!verification.result) {
        const {statusCode} = verification.information;
        const {message} = verification.information;
        return res.status(statusCode).send({result: false, message: message});
    };
    tokenCheck(access_token, (checkResult, message, token, memberData)=>{
        if (!checkResult) {
            res.clearCookie('access_token');
            return res.status(403).send({error: message});
        } else {
            // 新增 comment
            db.comments.create(
                {
                    post_id: post_id,
                    member_account: memberData.account,
                    comment: commetInput,
                    time: Date.now()
                })
            .then((insertResult)=> {
                // 去要所有的 post get('/comment')
                const reqUrl   = cst.PROTOCOL+cst.HOST_NAME+'/api/1.0/post/comment?post_id='+post_id;
                request.get(reqUrl, function(error, response, body) {
                    if (error) {
                        throw error;
                    }
                    const bodyObj = JSON.parse(body);
                    res.cookie('access_token', token);
                    return res.status(200).send({result: bodyObj});
                });
            });
        }
    });
});

// 取得 Comment
router.get('/comment', (req, res) => {
    const {post_id} = req.query;
    db.comments.findAll({where: {post_id: post_id}})
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((error)=>{
        res.status(500).send(error);
    });
});

// 加入喜愛
router.post('/like', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    const {post_id} = req.body;
    const {like_post} = req.body;
    console.log(req.body);
    const verification = validations.likepostValidate(access_token, post_id, like_post);
    if (!verification.result) {
        const {statusCode} = verification.information;
        const {message} = verification.information;
        return res.status(statusCode).send({result: false, message: message});
    };

    tokenCheck(access_token, (checkResult, message, token, memberData)=>{
        if (!checkResult) {
            res.clearCookie('access_token');
            return res.status(403).send({error: message});
        } else {
            const reqUrl = cst.PROTOCOL+cst.HOST_NAME+`/api/1.0/post/islike?post_id=${post_id}&member_account=${memberData.account}`;
            request.get(reqUrl, function(error, response, body) {
                if (error) {
                    throw error;
                }
                const bodyObj = JSON.parse(body);
                if (bodyObj.result && !like_post) {
                    // 有此 like 且 req 是 unlike
                    // 刪除 like
                    db.memberLikes.destroy({
                        where: {
                            post_id: post_id,
                            member_account: memberData.account
                        }})
                    .then((deletetResult)=> {
                        console.log('delete');
                        console.log(deletetResult);
                        res.cookie('access_token', token);
                        res.status(200).send({result: true, msg: 'Add like list Successfully'});
                    });
                } else if ( !bodyObj.result && like_post ) {
                    // 沒有此 like 且 req 是 like
                    // 新增 like
                    db.memberLikes.create({
                        post_id: post_id,
                        member_account: memberData.account,
                        time: Date.now()
                    })
                    .then((insertResult)=> {
                        console.log('create');
                        console.log(insertResult);
                        res.cookie('access_token', token);
                        res.status(200).send({result: true, msg: 'Add like list Successfully'});
                    });
                } else {
                    // 有此 like 且 req 是 like or 沒有此 like 且 req 是 unlike
                    // 只返回新 token
                    res.cookie('access_token', token);
                    res.status(200).send({result: true, msg: 'Add like list Successfully'});
                }
            });
        }
    });
});

// 取得是否喜愛
router.get('/islike', (req, res) => {
    const {post_id}    = req.query;
    const member_account = req.query.member_account;
    db.memberLikes.findOne({where: {post_id: post_id, member_account: member_account}})
    .then((result) => {
        if (!result) {
            res.status(200).send({result: false, msg: 'Query Successfully!'});
        } else {
            console.log(result);
            res.status(200).send({result: true, msg: 'Query Successfully!'});
        }
    })
    .catch((error)=>{
        ress.status(500).send({result: false, msg: error});
    });
});

// 取得指定 id 被喜愛次數
router.get('/countlike', (req, res) => {
    const {post_id} = req.query;
    db.memberLikes.count({where: {'post_id': post_id}})
    .then((count) => {
        if (!count) {
            res.status(200).send({result: false, count: 0});
        } else {
            res.status(200).send({result: true, count: count});
        }
    })
    .catch((error)=>{
        ress.status(500).send({result: false, msg: error});
    });
});

module.exports = router;

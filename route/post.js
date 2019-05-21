const express       = require('express');
const router        = express.Router();
const path          = require('path');
const request       = require('request');
const db            = require('../util/sequelize.js');
const cst           = require('../util/constants.js');
const tokenExpCheck = require('../controllers/crypto.js').tokenExpCheck;
const formatDate    = require('../controllers/date.js').formatDate;

// 會員喜愛頁面
router.get('/favorite', (req, res) => {
    const {account} = req.query;
    const viewerToken = req.cookies['access_token'];
    let viewrole;

    db.members.findAll({where: {account: account, verify: true},
        include: [
            {
                model: db.memberLikes,
                include: [
                    {
                        model: db.posts,
                        include: [
                            {
                                model: db.comments
                            },
                            {
                                model: db.memberLikes
                            }
                        ]
                    }
                ]
            }
        ],
        order: [[db.memberLikes, 'time', 'ASC']]
    })
    .then((result)=>{
        result = result[0];
        const memberData = {
            'name': result.name,
            'account': result.account,
            'picture': result.picture,
            'posts': result.member_likes.reverse().map((post) => {
                post=post.post;
                return Object.assign(
                    {},
                    {
                        post_id: post.dataValues.id,
                        video_id: post.dataValues.video_id,
                        title: post.dataValues.title,
                        picture: post.dataValues.picture,
                        content: post.dataValues.content,
                        time: formatDate(post.dataValues.time),
                        like_count: post.dataValues.member_likes.length,
                        comment_count: post.dataValues.comments.length,
                        view_times: post.dataValues.view_times
                    }
                );
            })
        };

        if (!viewerToken) {
            viewrole = 'guest';
            memberData.viewfrom = viewrole;
            memberData.target = 'favorite';
            res.render('post/member.ejs', {memberData: memberData} );
        } else {
            viewrole = 'others';
            db.members.findAll({where: {access_token: viewerToken, verify: true}})
            .then((veiwerData) => {
                // 下面這一段是 5/4 新加入的 預防有拿著系統沒記錄的 Token user 進入此頁面的時候，系統判斷是 Other
                // 但實際上應該要算是 Guest
                if (!veiwerData[0]) {
                    viewrole = 'guest';
                    memberData.viewfrom = viewrole;
                    memberData.target = 'favorite';
                    return res.render('post/member.ejs', {memberData: memberData} );
                }

                veiwerData.forEach( (data) => {
                    if ( data.dataValues.account === result.account) {
                        viewrole = 'self';
                    }
                });

                memberData.viewfrom = viewrole;
                memberData.target = 'favorite';
                res.render('post/member.ejs', {memberData: memberData} );
            });
        }
    })
    .catch((err)=> {
        res.send(err);
    });
});

// 會員分享頁面
router.get('/member', (req, res) => {
    const {account} = req.query;
    const viewerToken = req.cookies['access_token'];
    let viewrole;

    db.members.findAll({
        where: {account: account, verify: true},
        include: [
            {
                model: db.posts,
                include: [
                    {
                        model: db.comments
                    },
                    {
                        model: db.memberLikes
                    }
                ]
            }
        ],
        order: [[db.posts, 'time', 'ASC']]
    })
    .then((result)=>{
        result = result[0];

        const memberData = {
            'name': result.name,
            'account': result.account,
            'picture': result.picture,
            'posts': result.posts.reverse().map((post) => {
                return Object.assign(
                    {},
                    {
                        post_id: post.dataValues.id,
                        video_id: post.dataValues.video_id,
                        title: post.dataValues.title,
                        picture: post.dataValues.picture,
                        content: post.dataValues.content,
                        time: formatDate(post.dataValues.time),
                        like_count: post.dataValues.member_likes.length,
                        comment_count: post.dataValues.comments.length,
                        view_times: post.dataValues.view_times
                    }
                );
            })
        };

        if (!viewerToken) {
            viewrole = 'guest';
            memberData.viewfrom = viewrole;
            memberData.target = 'member';
            res.render('post/member.ejs', {memberData: memberData} );
        } else {
            viewrole = 'others';
            db.members.findAll({where: {access_token: viewerToken, verify: true}})
            .then((veiwerData) => {
                // 下面這一段是 5/4 新加入的 預防有拿著系統沒記錄的 Token user 進入此頁面的時候，系統判斷是 Other
                // 但實際上應該要算是 Guest
                if (!veiwerData[0]) {
                    viewrole = 'guest';
                    memberData.viewfrom = viewrole;
                    memberData.target = 'member';
                    return res.render('post/member.ejs', {memberData: memberData} );
                }
                veiwerData.forEach( (data)=> {
                    if ( data.dataValues.account === result.account) {
                        viewrole = 'self';
                    }
                });

                memberData.viewfrom = viewrole;
                memberData.target = 'member';
                res.render('post/member.ejs', {memberData: memberData} );
            });
        }
    })
    .catch((err)=> {
        res.send(err);
    });
});

// 分享頁面細節
router.get('/details', (req, res) => {
    const {postid} = req.query;
    const viewerToken = req.cookies['access_token'];
    let viewerAccount;
    let viewrole;

    db.posts.findAll({where: {id: postid}, include: [{model: db.members}]})
    .then((result)=>{
        result = result[0];
        result.time = formatDate(result.time);

        if (!viewerToken) {
            viewrole = 'guest';

            const reqUrl = cst.PROTOCOL+cst.HOST_NAME+'/api/1.0/post/comment?post_id='+postid;
            request.get(reqUrl, function(error, response, body) { // 拿 comment
                if (error) {
                    throw error;
                }
                const bodyObj = JSON.parse(body);

                result.viewfrom = viewrole;
                result.comment = bodyObj.reverse();

                res.render('post/detail.ejs', {postDetailData: result} );
            });
        } else {
            viewrole = 'others';
            db.members.findAll({where: {access_token: viewerToken, verify: true}})
            .then((veiwerData) => {
                veiwerData.forEach((data)=> {
                    if ( data.dataValues.account === result.member.account) {
                        viewrole = 'self';
                    }
                    viewerAccount = data.dataValues.account; // 確定 Token 主人的帳號
                });

                const reqUrl = cst.PROTOCOL+cst.HOST_NAME+'/api/1.0/post/comment?post_id='+postid;
                request.get(reqUrl, function(error, response, body) {// 拿 comment
                    if (error) {
                        throw error;
                    }
                    const bodyObj = JSON.parse(body);

                    result.viewfrom = viewrole;
                    result.comment = bodyObj.reverse();

                    const reqUrl = cst.PROTOCOL+cst.HOST_NAME+`/api/1.0/post/islike?post_id=${postid}&member_account=${viewerAccount}`;
                    request.get(reqUrl, function(error, response, body) {// 確認是否 like
                        if (error) {
                            throw error;
                        }
                        const bodyObj = JSON.parse(body);

                        result.isLike = bodyObj.result;
                        console.log(result);
                        res.render('post/detail.ejs', {postDetailData: result} );
                    });
                });
            });
        }
    })
    .catch((err)=> {
        res.send(err);
    });
});

// 修改頁面細節
router.get('/modify', (req, res) => {
    const {postid} = req.query;
    const access_token = req.cookies['access_token'];

    console.log(postid);
    if (!access_token) {
        res.redirect('/member/signin.html');
    } else {
        tokenExpCheck(access_token, res, (token)=>{
            db.posts.findOne({where: {id: postid}, include: [{model: db.members, attributes: ['access_token']}]})
            .then((queryResult)=>{
                queryResult.time = formatDate(queryResult.time);

                if ( queryResult ) {
                    if (token === queryResult.member.access_token) {
                        console.log('Accesstoken Match');
                        result = {tokenVerify: true, postDetailData: queryResult};
                        res.cookie('access_token', token);
                        res.render('post/modifyPost.ejs', {result: result});
                    } else {
                        console.log('Accesstoken Didn\'t Match');
                        result = {tokenVerify: false, postDetailData: {}};
                        res.cookie('access_token', token);
                        res.redirect('../404.html');
                    }
                } else {
                    res.redirect('../404.html');
                }
            });
        });
    }
});

module.exports = router;

const express    = require('express');
const router     = express.Router();
const db         = require('../../util/sequelize.js');

// 會員追蹤清單
router.get('/followList', async (req, res) => {
    if (!req.headers.authorization) {
        return res.send({
            result: false,
            message: '沒有取得 token'
        });
    }

    const access_token  = req.headers.authorization.substring(7);
    if (!access_token) {
        return res.send({
            result: false,
            message: 'Token Not Existed!'
        });
    }

    const {account}   = req.query;
    const tokenVerifyResult = await db.members.findOne({where: {access_token: access_token, verify: true}});
    console.log(tokenVerifyResult.account);

    if ( !tokenVerifyResult ) {
        return res.send({
            result: false,
            message: 'Token 驗證失敗'
        });
    }

    if ( tokenVerifyResult.account !== account ) {
        return res.send({
            result: false,
            message: '權限不符合'
        });
    }

    db.follows.hasMany(db.posts, {foreignKey: 'member_account', sourceKey: 'account'});
    const followList = await db.follows.findAll({
        where: {follower_account: account},
        attributes: ['account'],
        include: [{
            model: db.posts,
            attributes: ['id', 'title', 'time']
        }],
        raw: true,
        order: [[db.posts, 'time', 'DESC']]
    });

    return res.send({
        result: true,
        data: followList
    });
});

// 會員相關資料通知
router.get('/self', async (req, res) => {
    if (!req.headers.authorization) {
        return res.send({
            result: false,
            message: '沒有取得 token'
        });
    }

    const access_token  = req.headers.authorization.substring(7);
    if (!access_token) {
        return res.send({
            result: false,
            message: 'Token Not Existed!'
        });
    }

    const {account}   = req.query;
    const tokenVerifyResult = await db.members.findOne({where: {access_token: access_token, verify:true}});
    console.log(tokenVerifyResult.account);

    if ( !tokenVerifyResult ) {
        return res.send({
            result: false,
            message: 'Token 驗證失敗'
        });
    }

    if ( tokenVerifyResult.account !== account ) {
        return res.send({
            result: false,
            message: '權限不符合'
        });
    }

    const followNotificationList = await db.members.findAll({
        where: {account: account},
        attributes: ['account'],
        include:
        [
            {
                model: db.follows,
                attributes: ['follower_account', 'time']
            }
        ],
        raw: true
    });

    const commentNotificationList = await db.members.findAll({
        where: {account: account},
        attributes: ['account'],
        include:
        [
            {
                model: db.posts,
                attributes: ['id', 'title'],
                include:
                [
                    {
                        model: db.comments,
                        attributes: ['member_account', 'comment', 'time']
                    }
                ]
            }
        ],
        raw: true
    });

    const likeNotificationList = await db.members.findAll({
        where: {account: account},
        attributes: ['account'],
        include:
        [
            {
                model: db.posts,
                attributes: ['id', 'title'],
                include:
                [
                    {
                        model: db.memberLikes,
                        attributes: ['member_account', ['time', 'time']]
                    }
                ]
            }
        ],
        raw: true
    });

    let selfNotificationList = followNotificationList.concat(commentNotificationList);
    selfNotificationList = selfNotificationList.concat(likeNotificationList);

    selfNotificationList = selfNotificationList.sort(function(a, b) {
        if ( a['follows.time'] ) {
            a = a['follows.time'];
        }
        if ( a['posts.comments.time'] ) {
            a = a['posts.comments.time'];
        }
        if ( a['posts.member_likes.time']) {
            a = a['posts.member_likes.time'];
        }

        if ( b['follows.time'] ) {
            b = b['follows.time'];
        }
        if ( b['posts.comments.time'] ) {
            b = b['posts.comments.time'];
        }
        if ( b['posts.member_likes.time'] ) {
            b = b['posts.member_likes.time'];
        }

        return b-a;
    });

    return res.send({
        result: true,
        data: selfNotificationList
    });
});

module.exports = router;

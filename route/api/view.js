const express       = require('express');
const router        = express.Router();
const request       = require('request');
const uuidv4        = require('uuid/v4');
const validations   = require('../../controllers/validations.js');
const key           = require('../../util/.key/keys.js');
const db            = require('../../util/sequelize.js');
const redis         = require('redis');
const client        = redis.createClient();
client.on('connect', function() {
    console.log('RDB connected');
});

// Youtube Data API V3 video duration format to seconds
/**
 *
 * @param {*} duration
 */
function convert_time(duration) {
    let a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration*1000;
}

// 開始觀看
router.get('/startView', (req, res) => {
    const viewToken    = uuidv4();
    const viewTime     = Date.now();
    const {video_id} = req.query;
    const {ytApiKey} = key;
    const reqUrl       = `https://www.googleapis.com/youtube/v3/videos?id=${video_id}&key=${ytApiKey}&part=contentDetails`;

    request.get(reqUrl, function(error, response, body) {
        const bodyObj = JSON.parse(body);
        if (bodyObj.items[0]) {
            const maxAge  = convert_time(bodyObj.items[0].contentDetails.duration);
            if ( !maxAge ) {
                res.send({result: 'Can\'t get video duration'});
            } else {
                const atLeastTime = viewTime + (maxAge*3/4);
                expTime = maxAge + 3000; // 要加三秒緩衝時間 怕 redis 過期了但是增加 播放次數的請求還沒進 server
                client.set(viewToken, atLeastTime, 'EX', expTime/1000, (error) => {
                    if (error) {
                        res.send({error: error});
                    }
                    res.cookie('view_token', viewToken, {maxAge: expTime, httpOnly: true});
                    res.send({result: true, duration: maxAge/1000});
                });
            }
        } else {
            res.send({result: false});
        }
    });
});

// 增加觀看次數
router.post('/addView', (req, res) => {
    const addViewTime = Date.now() + 2000;
    const postBody    = req.body;
    const {post_id}   = postBody;
    const {video_id}  = postBody;
    const view_token  = req.cookies['view_token'];
    const verification = validations.addViewValidate(view_token, postBody);
    if (!verification.result) {
        const {message} = verification;
        return res.send({result: false, message: message});
    };

    client.get(view_token, (error, rdbResult) => {
        if (error) {
            throw error;
        }
        if ( !rdbResult ) {
            res.send({result: false, message: 'Don\'t have view token!'});
        } else {
            if (addViewTime > rdbResult) {
                db.posts.findByPk(post_id)
                .then(function(post) {
                    return post.increment('view_times', {by: 1});
                })
                .then((updateesult) => {
                    console.log(updateesult);
                    console.log(updateesult?'View times increment successfully!':'View times increment Fail!');
                    res.cookie('view_token', '');
                    res.send({result: true, view_times: updateesult.dataValues.view_times+1});
                })
                .catch((err) => {
                    res.send({result: false, message: 'rollback'});
                });
            // // 2019/06/25 for atomic command testing
            // db.posts.update({view_times: db.sequelize.literal('`view_times` + 1')}, {where: {id: post_id}})
            // .then((updateResult)=> {
            //     console.log('Update Result:');
            //     console.log(updateResult[0]);
            //     res.cookie('view_token', '');
            //     res.send({result: true});
            // });
            // // 2019/06/25 for transaction remove testing
            //     db.sequelize.transaction((t) => {
            //         // chain all your queries here. make sure you return them.
            //         return db.posts.findByPk(post_id, {transaction: t})
            //         .then(function(post) {
            //             return post.increment('view_times', {by: 1});
            //         })
            //         .then((updateesult) => {
            //         // Transaction has been committed
            //         // result is whatever the result of the promise chain returned to the transaction callback
            //             console.log(updateesult);
            //             console.log(updateesult?'View times increment successfully!':'View times increment Fail!');
            //             res.cookie('view_token', '');
            //             res.send({result: true, view_times: updateesult.dataValues.view_times+1});
            //         });
            //     }).catch((err) => {
            //         // Transaction has been rolled back
            //         // err is whatever rejected the promise chain returned to the transaction callback
            //         res.send({result: false, message: 'rollback'});
            //     });
            } else {
                res.send({result: false, message: 'Haven\'t seen enough time in this vedio!'});
            }
        }
    });
});

module.exports = router;

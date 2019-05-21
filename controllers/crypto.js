const cryptoModule = require('crypto');
const db           = require('../util/sequelize.js');
const crypto = {};

crypto.getCookie = function getCookie(cookies, target) {
    console.log('Get token');
    console.log(cookies);
    console.log(target);
    const cookie = {};
    cookies.split(';').forEach(function(el) {
        const [k, v] = el.split('=');
        cookie[k.trim()] = v;
    });
    return cookie[target];
};

crypto.createToken = function createToken() {
    const tokenHash = cryptoModule.createHash('sha256');

    // 處理 access_token hash 值
    const randomNumber = Math.random().toString(36).substring(7);
    // 36是進位方式指定,從2到36進位,如果使用36進位就是等於10碼數字+26英文從第7個字開始抓，所以是13 - 7 = 6 個隨機數字+字母
    tokenHash.update(randomNumber);
    const accessToken = tokenHash.digest('hex');
    return accessToken;
};
// 給 API 路徑使用的檢查 Token Function，ERROR 或找不到 Token 會回傳 False
crypto.tokenCheck = function tokenCheck(token, callback) {
    const newAccessToken = crypto.createToken();// 產生本地端 Token
    const currentTime = Date.now();
    const expiredTime = currentTime + 3600000;

    db.members.findOne({where: {access_token: token, verify: true}})
    .then((memberData) => {
        if ( !memberData ) {
            console.log('Can\'t find member');
            callback(false, 'Can\'t find member');
        } else {
            console.log(memberData.dataValues);

            if (memberData.dataValues.access_expired < currentTime) {
                db.members.update(
                    {access_token: newAccessToken, access_expired: expiredTime},
                    {where: {access_token: token}})
                .then( (updateesult) => {
                    console.log(updateesult[0]===1?'Update Token Successfully!': 'Update Token Failed!');
                    if (updateesult[0]===1) {
                        callback(true, 'Check ok and update expired token', newAccessToken, memberData);
                    } else {
                        console.log('Update Token Failed');
                        callback(false, 'Update Token Failed');
                    }
                });
            } else {
                console.log('Token Not Expired');
                callback(true, 'Check ok and return existed token', token, memberData);
            }
        }
    })
    .catch((err)=> {
        console.log(err);
        callback(false, 'Ubexpected error');
    });
};

// 給一般路徑使用的檢查 Token Function，ERROR 或找不到 Token 會導到特殊頁面
crypto.tokenExpCheck = function tokenExpCheck(token, response, callback) {
    const newAccessToken = crypto.createToken();// 產生本地端 Token
    const currentTime = Date.now();
    const expiredTime = currentTime + 3600000;

    db.members.findOne({where: {access_token: token, verify: true}})
    .then((memberData) => {
        if ( !memberData ) {
            console.log('Can\'t find member');
            response.redirect('/member/signin.html');
        } else {
            console.log(memberData.dataValues);

            if (memberData.dataValues.access_expired < currentTime) {
                // Update Token
                db.members.update(
                    {access_token: newAccessToken, access_expired: expiredTime},
                    {where: {access_token: token}})
                .then( (updateesult) => {
                    console.log(updateesult[0]===1?'Update Token Successfully!': 'Update Token Fail!');
                    if (updateesult[0]===1) {
                        callback(newAccessToken, memberData);
                    } else {
                        response.redirect('../404.html');
                    }
                });
            } else {
                console.log('Token Not Expired');
                callback(token, memberData);
            }
        }
    })
    .catch((err)=> {
        response.redirect('../404.html');
    });
};

module.exports = crypto;

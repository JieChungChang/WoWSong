const express          = require('express');
const router           = express.Router();
const path             = require('path');
const db               = require('../util/sequelize.js');

// user routes 測試路徑
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/member/index.html'));
});
// user 修改資料 頁面路徑
router.get('/modify/:target', (req, res) => {
    const {target} = req.params;
    if ( target === 'profile' ) {
        res.sendFile(path.join(__dirname, '../public/member/modifyProfile.html'));
    } else if ( target === 'important' ) {
        res.sendFile(path.join(__dirname, '../public/member/modifyImportant.html'));
    }
});
// 會員認證狀況路徑
router.get('/verifyStatus', (req, res) => {
    const {account} = req.query;

    db.members.findAll({where: {account: account}})
    .then((result) => {
        result = result[0];
        if (result) {
            const signResult = {
                status: 3,
                name: result.name,
                account: result.account,
                email: result.email,
                verify: result.verify
            };
            res.render('signRes.ejs', {signResult: signResult});
        } else {
            res.send({reeor: error});
        }
    })
    .catch( (error) => {
        res.send({error: error});
    });
});
// 會員認證信路徑
router.get('/verify', (req, res) => {
    const accessToken = req.query.token;

    if ( accessToken === '' ) {
        res.redirect('/');
    } else {
        const newData = {
            verify: true,
            access_expired: Date.now() + 3600000
        };

        db.members.update(newData, {where: {access_token: accessToken}})
        .then((updated) => {
            if ( updated[0] !== 0 ) {
                db.members.findOne({where: {access_token: accessToken, verify: true}})
                .then((result) => {
                    console.log(result);
                    const renderData = {
                        name: result.name,
                        account: result.account,
                        email: result.email,
                        page: `/post/member?account=${result.account}`
                    };

                    res.cookie('access_token', accessToken);
                    res.render('mailVerify.ejs', {renderData: renderData});
                });
            } else {
                res.redirect('/');
            }
        })
        .catch((error) => {
            res.redirect('../404.html');
        });
    }
});
// 修正會員信箱認證路徑
router.get('/verifyNewEmail', (req, res) => {
    const accessToken = req.query.token;
    const {email}   = req.query;

    if ( accessToken === '' || email === '' ) {
        res.redirect('/');
    } else {
        const newData = {
            verify: true,
            access_expired: Date.now() + 3600000,
            email, email
        };
        db.members.update(newData, {where: {access_token: accessToken}})
        .then((updated) => {
            if ( updated[0] !== 0 ) {
                db.members.findOne({where: {access_token: accessToken, verify: true}})
                .then((result) => {
                    console.log(result);
                    const renderData = {
                        name: result.name,
                        account: result.account,
                        email: result.email,
                        page: `/post/member?account=${result.account}`
                    };
                    res.cookie('access_token', accessToken);
                    res.render('mailVerify.ejs', {renderData: renderData});
                });
            } else {
                res.redirect('/');
            }
        })
        .catch((error) => {
            res.redirect('../404.html');
        });
    }
});

module.exports = router;

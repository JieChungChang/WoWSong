const express          = require('express');
const router           = express.Router();
const request          = require('request');
const {OAuth2Client}   = require('google-auth-library');
const crypto           = require('crypto');
const db               = require('../../util/sequelize.js');
const cst              = require('../../util/constants.js');
const uploadImg        = require('../../controllers/s3imgHandle.js').uploadImg;
const validations      = require('../../controllers/validations.js');
const createToken      = require('../../controllers/crypto.js').createToken;
const tokenCheck       = require('../../controllers/crypto.js').tokenCheck;
const googlCredentials = require('../../util/.key/keys.js').googlCredentials;

// gmail SMTP
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'obeobeko.noreply@gmail.com',
        pass: googlCredentials.gmailPass
    }
});
// user routes 測試路徑
router.post('/signup', (req, res) => {
    const memberInfo        = req.body;
    const {name}            = memberInfo;
    const {account}         = memberInfo;
    const {mail}            = memberInfo;
    const {password}        = memberInfo;
    const {passwordConfirm} = memberInfo;
    const {recaptchaRes}    = memberInfo;
    const verification = validations.signupValidate(memberInfo);
    if (!verification.result) {
        return res.status(200).send(verification.information);
    };

    const secretKey = googlCredentials.reCAPTCHASecrete;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaRes}`;

    request.get(verifyUrl, async function(error, response, body) {
        const bodyObj = JSON.parse(body);
        if ( bodyObj.success !== undefined && !bodyObj.success ) {
            const signResult = {
                signupResult: false,
                status: 5,
                msg: 'reCAPTCHA 驗證失敗'
            };
            res.send(signResult);
        } else {
            // 處理 password hash 值 不讓user password 明碼存進去
            const passwordHash = crypto.createHash('sha256');
            passwordHash.update(password);
            const hashPassword = passwordHash.digest('hex');

            // 產生 access_token
            const access_token = createToken();

            // 會員認證信 config
            const mailVerifyUrl = cst.PROTOCOL+cst.HOST_NAME+'/member/verify?token='+access_token;

            let mailContent = '<p>一個使用本信箱（<a href="'+mail+'">'+mail+'</a>) 的使用者帳號已於 WoWSong 創立</p>';
            mailContent += '<p>欲啟用本帳號並確認使用本信箱地址，請至 <br><a href="'+mailVerifyUrl+'">'+mailVerifyUrl+'</a></p>';
            mailContent += '<p>若您沒有在本站註冊過，則可以忽略本訊息。</p>';

            const mailOptions = {
                from: 'obeobeko.noreply@gmail.com',
                to: mail,
                subject: 'WoWSong 會員信箱認證',
                html: mailContent
            };
            const accountCheck = await db.members.findOne({
                where: {account: account},
                attributes: ['provider', 'account', 'email']
            });

            console.log(accountCheck);
            if (accountCheck) {
                signResult = {
                    signupResult: false,
                    status: 1,
                    msg: '此帳號已經存在'
                };
                return res.status(200).send(signResult);
            } else {
                db.members.findOrCreate({
                    where: {email: mail, provider: 'native'},
                    defaults: {
                        provider: 'native',
                        name: name,
                        account: account,
                        email: mail,
                        password: hashPassword,
                        access_token: access_token,
                        access_expired: 0,
                        picture: '../../public/img/user.png',
                        verify: false
                    }
                })
                .then(([member, created]) => {
                    console.log(member.get({
                        plain: true
                    }));
                    if (created) { // 如果 database 不存在才會存，有存 created 才會是 true
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        const signResult = {
                            signupResult: true,
                            account: account
                        };
                        res.cookie('access_token', access_token);
                        res.status(200).send(signResult);
                    } else {
                        signResult = {
                            signupResult: false,
                            status: 2,
                            msg: '此 mail 已經被使用'
                        };
                        return res.status(200).send(signResult);
                    }
                })
                .catch(function(err) {
                    console.log('Google Signin fail');
                    console.log(err.message);
                    return res.status(500).send({error: err});
                });
            }
        }
    });
});
router.post('/nativesignin', (req, res) => {
    const memberInfo     = req.body;
    const {account}      = memberInfo;
    const {password}     = memberInfo;
    const {recaptchaRes} = memberInfo;
    const verification = validations.nativesigninValidate(memberInfo);
    if (!verification.result) {
        return res.status(200).send(verification.information);
    };
    const secretKey = googlCredentials.reCAPTCHASecrete;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaRes}`;

    request.get(verifyUrl, function(error, response, body) {
        const bodyObj = JSON.parse(body);
        if ( bodyObj.success !== undefined && !bodyObj.success ) {
            const signResult = {
                signinResult: false,
                status: 2,
                msg: 'reCAPTCHA 驗證失敗'
            };
            return res.send(signResult);
        } else {
            // 處理 password hash 值 不讓user password 明碼存進去
            const passwordHash  = crypto.createHash('sha256');
            passwordHash.update(password);
            const hashPassword  = passwordHash.digest('hex');

            // 產生 access_token
            const access_token = createToken();

            db.members.findAll({where: {account: account, provider: 'native'}})
            .then((result) => {
                if (!result[0]) {
                    const signResult = {
                        signinResult: false,
                        status: 0,
                        msg: '此帳號不存在'
                    };
                    return res.send(signResult);
                } else {
                    if ( !result[0].verify ) {
                        const signResult = {
                            signinResult: false,
                            status: 0,
                            msg: '此帳號尚未驗證 email'
                        };
                        // res.send({result: "此帳號尚未驗證 email"});
                        return res.send(signResult);
                    } else {
                        if ( result[0].password === hashPassword ) {
                            const signInTime  = Date.now();
                            const expiredTime = signInTime + 3600000;

                            // 更新 aacessToken
                            db.members.update(
                                {access_token: access_token, access_expired: expiredTime},
                                {where: {account: account}})
                            .then(function(updateAccessTokenResult) {
                                console.log(updateAccessTokenResult);
                                res.cookie('access_token', access_token);
                                const memberData   = {
                                    name: result[0].name,
                                    account: result[0].account,
                                    picture: result[0].picture
                                };

                                const signResult = {
                                    signinResult: true,
                                    account: memberData.account
                                };

                                return res.send(signResult);
                            })
                            .catch(function(err) {
                                console.log('Update Access Token fail');
                                console.log(err.message);
                                res.send({result: err});
                            });
                        } else {
                            const signResult = {
                                signinResult: false,
                                status: 1,
                                msg: '密碼錯誤'
                            };
                            return res.send(signResult);
                        }
                    }
                }
            })
            .catch(function(err) {
                res.send({error: err});
            });
        }
    });
});
// google 登入
router.post('/ggsignin', (req, res) => {
    const memberInfo     = req.body;
    const {provider}     = memberInfo;
    const {access_token} = memberInfo;
    const {user_ID}      = memberInfo;
    const verification = validations.ggsigninValidate(memberInfo);
    if (!verification.result) {
        return res.status(400).send(verification.information);
    };

    const account = 'gg_'+user_ID;
    const localAccessToken = createToken();// 產生本地端 Token
    const signUpTime  = Date.now();
    const expiredTime = signUpTime + 3600000;

    const client_id = '288950503271-lcguojausmbr9bosbces66ub0ua6ig2i.apps.googleusercontent.com';
    const client = new OAuth2Client(client_id);
    /**
     * Google API verify token from client side
     */
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: access_token,
            audience: client_id// Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify().catch(function(error) {
        console.log(error);
        const signResult = {
            msg: 'Google 帳號驗證失敗'
        };
        return res.status(403).send(signResult);
    });

    // 沒有此 email 就新增
    // Google server API path
    let url  = 'https://oauth2.googleapis.com/tokeninfo?id_token=';
    url += access_token;
    // 取得照片等資料
    request.get(url, function(error, response, body) {
        const bodyObj = JSON.parse(body);
        console.log(bodyObj);
        const name    = bodyObj.name;
        const picture = bodyObj.picture;
        const email   = bodyObj.email;

        db.members.findOrCreate({
            where: {email: email, provider: 'Google'},
            defaults: {
                provider: provider,
                name: name,
                account: account,
                email: email,
                password: '',
                access_token: localAccessToken,
                access_expired: expiredTime,
                picture: picture,
                verify: true
            }
        })
        .then(([member, created]) => {
            console.log(member.get({
                plain: true
            }));
            if (created) { // 如果 database 不存在才會存，有存 created 才會是 true
                res.cookie('access_token', localAccessToken);
                const signResult = {
                    account: account
                };
                return res.status(200).send(signResult);
            } else {
                // 有此帳號就更新 acessToken
                db.members.update(
                    {access_token: localAccessToken, access_expired: expiredTime},
                    {where: {account: member.account}})// 新的 GGSIGNIN 條件式
                .then(function(result) {
                    console.log(result);
                    res.cookie('access_token', localAccessToken);

                    const signResult = {
                        account: member.account// 新的 GGSIGNIN 登入方式
                    };

                    return res.status(200).send(signResult);
                });
            }
        })
        .catch(function(err) {
            console.log('Google Signin fail');
            console.log(err.message);

            return res.status(500).send({error: err});
        });
    });
});
// FaceBook 登入
router.post('/fbsignin', (req, res) => {
    // 判斷登入 方式
    const memberInfo     = req.body;
    const {provider}     = memberInfo;
    const {access_token} = memberInfo;
    const {user_ID}      = memberInfo;

    const verification = validations.fbsigninValidate(memberInfo);
    if (!verification.result) {
        return res.status(400).send(verification.information);
    };
    const account = 'fb_'+user_ID;
    const localAccessToken = createToken();// 產生本地端 Token
    const signUpTime  = Date.now();
    const expiredTime = signUpTime + 3600000;

    // FB server API path
    let url  = 'https://graph.facebook.com/v3.2/me?fields=id,name,picture,email&access_token=';
    url += access_token;

    // 取得照片 以及 email
    request.get(url, function(error, response, body) {
        const bodyObj = JSON.parse(body);
        console.log(bodyObj);
        const name    = bodyObj.name;
        // let picture = bodyObj.picture.data.url;
        const picture = `https://graph.facebook.com/${account.substring(3)}/picture?height=300&width=300`;
        const email   = bodyObj.email;

        db.members.findOrCreate({
            where: {email: email, provider: 'Facebook'},
            defaults: {
                provider: provider,
                name: name,
                account: account,
                email: email,
                password: '',
                access_token: localAccessToken,
                access_expired: expiredTime,
                picture: picture,
                verify: true
            }
        })
        .then(([member, created]) => {
            console.log(member.get({
                plain: true
            }));
            if (created) { // 如果 database 不存在才會存，有存 created 才會是 true
                res.cookie('access_token', localAccessToken);
                const signResult = {
                    account: account
                };
                res.status(200).send(signResult);
            } else {
                // 有此帳號就更新 aacessToken
                db.members.update(
                    {access_token: localAccessToken, access_expired: expiredTime},
                    {where: {account: member.account}})// 新的 FBSIGNIN 登入方式 條件式
                .then(function(result) {
                    console.log(result);
                    res.cookie('access_token', localAccessToken);
                    const signResult = {
                        account: member.account// 新的 FBSIGNIN 登入方式
                    };
                    res.status(200).send(signResult);
                });
            }
        })
        .catch(function(err) {
            console.log('Facebook signin fail');
            console.log(err.message);
            res.status(500).send({error: err});
        });
    });
});
// 修改 會員照片
router.patch('/image', uploadImg.multiPartHandle.single('file'), (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    if (!access_token) {
        return res.send({updateResult: false, message: 'Token Not Existed!'});
    }
    tokenCheck(access_token, (checkResult, message, token, memberData)=>{
        if (!checkResult) {
            return res.status(200).send({updateResult: false, message: message});
        }
        const account = memberData.account;
        uploadImg.s3upload(req.file.buffer, account, 'memberImage', (uploadResult, url)=>{
            if (uploadResult) {
                console.log(url);
                console.log(account);

                db.members.update(
                    {picture: url},
                    {where: {account: account}}
                )
                .then((updateResult)=> { // updateResult 只會回傳影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值
                    console.log('Update Result:');
                    console.log(updateResult[0]);
                    res.cookie('access_token', token);
                    return res.status(200).send({updateResult: true, picture: url, message: 'Update Post Successfully!'});
                });
            } else {
                res.cookie('access_token', token);
                return res.status(200).send({updateResult: false, post_id: post_id, message: 'Upload to S3 Fail!'});
            }
        });
    });
});
// 修改 會員基本資料
router.patch('/information', async (req, res) => {
    const access_token  = req.headers.authorization.substring(7);
    const memberInfo      = req.body;
    const {name}          = memberInfo;
    const {account}       = memberInfo;
    const {introduction}  = memberInfo;
    const verification    = validations.updateInfoValidate(access_token, memberInfo);
    if (!verification.result) {
        const {statusCode} = verification;
        return res.status(statusCode).send(verification.information);
    };

    let updateAccountVerify = false;
    const updateAccountQueryResult = await db.members.findAndCountAll({where: {account: account}});

    if ( updateAccountQueryResult.count > 0 ) {
        if ( updateAccountQueryResult.rows[0].dataValues.access_token === access_token ) {
            updateAccountVerify = true;
        }
    } else if (updateAccountQueryResult.count === 0) {
        updateAccountVerify = true;
    }

    if ( !updateAccountVerify ) {
        res.send({
            updateResult: false,
            type: 1,
            message: '此帳號已經存在，請重新輸入'
        });
    } else {
        updateData();
    }

    /**
     * update member basic information
     */
    function updateData() {
        tokenCheck(access_token, (checkResult, message, token, memberData)=>{
            if (!checkResult) {
                return res.status(200).send({updateResult: false, message: message});
            }
            db.members.update(
                {name: name, account: account},
                {where: {id: memberData.id}}
            )
            .then((updateResult)=> {
                console.log('Update Result:');
                console.log(updateResult[0]);
                // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值
                if (updateResult[0]) {
                    res.cookie('access_token', token);
                    return res.send({
                        updateResult: true,
                        udapteData: {name: name, account: account, introduction: introduction},
                        message: 'Update Post Successfully!'
                    });
                } else {
                    res.cookie('access_token', token);
                    return res.send({
                        updateResult: true,
                        udapteData: {name: name, account: account, introduction: introduction},
                        message: 'Didn\'t Update Anything!'
                    });
                }
            });
        });
    }
});

// 修改 會員 Email
router.patch('/email', async (req, res) => {
    const access_token  = req.headers.authorization.substring(7);
    const memberInfo    = req.body;
    const {email}       = memberInfo;
    const {password}    = memberInfo;

    const verification = validations.updateEmailValidate(access_token, memberInfo);
    if (!verification.result) {
        const {statusCode} = verification;
        return res.status(statusCode).send(verification.information);
    };

    // 下面開始驗證 密碼
    // Crypto setting 一定要放在 post request 裡面，不然 digest 會只能用一次
    // 處理 password hash 值 不讓user password 明碼存進去
    const passwordHash = crypto.createHash('sha256');
    passwordHash.update(password);
    const hashPassword  = passwordHash.digest('hex');

    const accessToken  = createToken();

    // 會員認證信 config
    const mailVerifyUrl   = cst.PROTOCOL+cst.HOST_NAME+'/member/verifyNewEmail?token='+accessToken+'&email='+email;

    let mailContent = '<p>您收到此電子郵件是因為您的帳戶最近有更新過 E-Mail 地址（<a href="'+email+'">'+email+'</a>) 需要重新驗證。';
    mailContent += '<p>欲重新驗證信箱地址，請至 <br><a href="'+mailVerifyUrl+'">'+mailVerifyUrl+'</a></p>';
    mailContent += '<p>若您想維持原本的信箱，則可以忽略本訊息。</p>';

    const mailOptions = {
        from: 'obeobeko.noreply@gmail.com',
        to: email,
        subject: 'WoWSong 會員信箱更改重新認證',
        html: mailContent
    };

    /**
     * 寄送會員認證信
     */
    function sendNewEmailValidation() {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        const sendResult = {
            updateResult: true,
            email: email,
            message: `請儘速至 ${email} 完成您的認證，否則系統不會為您更新至最新 E-Mail`
        };
        res.cookie('access_token', accessToken);
        res.send(sendResult);
    }

    const tokenCheck = await db.members.findOne({where: {access_token: access_token, provider: 'native'}});
    if ( !tokenCheck ) {
        res.send({
            updateResult: false,
            type: 2,
            message: '查詢不到此帳號，請確認您要修正的帳號為不是使用 Google 或是 Facebook 註冊。'
        });
    } else {
        console.log(tokenCheck.dataValues);
        const memberData = tokenCheck.dataValues;

        if ( memberData.password !== hashPassword ) {
            res.send({
                updateResult: false,
                type: 1,
                message: '密碼錯誤'
            });
        } else {
            const emailCheck = await db.members.findAll({where: {email: email, provider: 'native'}});
            if ( emailCheck.length > 0 ) {
                res.send({
                    updateResult: false,
                    type: 0,
                    message: '此 E-Mail 已經被使用過，請使用別的 E-Mail。'
                });
            } else {
                const postTime  = Date.now();
                const expiredTime = postTime + 3600000;

                let tokenUpdateResult = await db.members.update(
                    {access_token: accessToken, access_expired: expiredTime},
                    {where: {id: memberData.id}}
                );

                console.log('Update Result:');
                console.log(tokenUpdateResult[0]);
                console.log(accessToken);

                tokenUpdateResult = tokenUpdateResult[0];
                // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值，算在未知錯誤

                if (tokenUpdateResult) {
                    sendNewEmailValidation();
                } else {
                    res.cookie('access_token', accessToken);
                    res.send({
                        updateResult: false,
                        type: 2,
                        message: '未知錯誤'
                    });
                }
            }
        }
    }
});

// 修改 會員密碼
router.patch('/password', async (req, res) => {
    const access_token  = req.headers.authorization.substring(7);
    const memberInfo           = req.body;
    const {newPassword}        = memberInfo;
    const {newPasswordConfirm} = memberInfo;
    const {currentPassword}    = memberInfo;
    const verification = validations.updatePasswordValidate(access_token, memberInfo);
    if (!verification.result) {
        const {statusCode} = verification;
        console.log(verification);
        return res.status(statusCode).send(verification.information);
    };

    // Crypto setting 一定要放在 post request 裡面，不然 digest 會只能用一次
    // 處理 password hash 值 不讓user password 明碼存進去
    const passwordHash = crypto.createHash('sha256');
    passwordHash.update(currentPassword);
    const hashPassword  = passwordHash.digest('hex');

    const accessToken  = createToken();

    const tokenCheck = await db.members.findOne({where: {access_token: access_token, provider: 'native'}});
    if ( !tokenCheck ) {
        res.send({
            updateResult: false,
            type: 3,
            message: '查詢不到此帳號，請確認您要修正的帳號為不是使用 Google 或是 Facebook 註冊。'
        });
    } else {
        console.log(tokenCheck.dataValues);
        const memberData = tokenCheck.dataValues;

        if ( memberData.password !== hashPassword ) {
            res.send({
                updateResult: false,
                type: 2,
                message: '密碼錯誤，帳號比對不符合！'
            });
        } else {
            const newPasswordHash = crypto.createHash('sha256');
            newPasswordHash.update(newPassword);
            const newHashPassword  = newPasswordHash.digest('hex');

            const postTime  = Date.now();
            const expiredTime = postTime + 3600000;

            let passwordUpdateResult = await db.members.update(
                {password: newHashPassword, access_token: accessToken, access_expired: expiredTime},
                {where: {id: memberData.id}}
            );

            console.log('Update Result:');
            console.log(passwordUpdateResult[0]);
            console.log(accessToken);

            passwordUpdateResult = passwordUpdateResult[0];
            // updateResult 只會回傳 影響幾行的數字, 所以如果 前端沒更動任何值，不會回傳任何值，算在未知錯誤

            if (passwordUpdateResult) {
                res.cookie('access_token', accessToken);
                res.send({
                    updateResult: true
                });
            } else {
                res.cookie('access_token', accessToken);
                res.send({
                    updateResult: false,
                    type: 3,
                    message: '未知錯誤'
                });
            }
        }
    }
});
// 特殊狀況下確認登入狀況 (修改密碼頁面)
router.get('/isLogin/special', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    if (!access_token) {
        return res.send({result: false, message: 'Token Not Existed!'});
    }
    const newAccessToken  = createToken();// 產生本地端 Token
    const currentTime  = Date.now();
    const expiredTime = currentTime + 3600000;

    db.members.findOne({where: {access_token: access_token}})
    .then( (result) => {
        if ( !result) {
            res.clearCookie('access_token');
            return res.send({result: false, message: 'Can\'t find member'});
        } else {
            if (result.access_expired < currentTime) { // 過期時間小於現在時間代表已經過期
                // 更新 Token
                db.members.update(
                    {access_token: newAccessToken, access_expired: expiredTime},
                    {where: {access_token: access_token}})
                .then( (updateesult) => {
                    console.log(updateesult[0]===1?'Update Token Successfully!': 'Update Token Fail!');
                    if (updateesult[0]===1) {
                        console.log(result);
                        res.cookie('access_token', newAccessToken);
                        res.send({result: true, memberData:
                            {
                                name: result.name,
                                account: result.account,
                                picture: result.picture,
                                email: result.email,
                                provider: result.provider,
                                verify: result.verify
                            }
                        });
                    } else {
                        return res.send({result: false, message: 'Update Token Fail!'});
                    }
                });
            } else {
                return res.send({
                    result: true,
                    memberData: {
                        name: result.name,
                        account: result.account,
                        picture: result.picture,
                        email: result.email,
                        provider: result.provider,
                        verify: result.verify
                    }
                });
            }
        }
    })
    .catch((error) =>{
        return res.status(500).send({error: error});
    });
});

// 確認登入狀況
router.get('/isLogin', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    if (!access_token) {
        return res.send({result: false, message: 'Token Not Existed!'});
    }
    const newAccessToken  = createToken();// 產生本地端 Token
    const currentTime  = Date.now();
    const expiredTime = currentTime + 3600000;

    db.members.findOne({where: {access_token: access_token, verify: true}})
    .then( (result) => {
        if (!result) {
            res.clearCookie('access_token');
            res.send({result: false, message: 'Can\'t find member'});
        } else {
            if (result.access_expired < currentTime) {
                // 更新 Token
                db.members.update(
                    {access_token: newAccessToken, access_expired: expiredTime},
                    {where: {access_token: access_token}})
                .then( (updateesult) => {
                    console.log(updateesult[0]===1?'Update Token Successfully!': 'Update Token Fail!');

                    if (updateesult[0]===1) {
                        // let bodyObj = JSON.parse(result);
                        console.log(result);
                        res.cookie('access_token', newAccessToken);
                        return res.send({result: true, memberData:
                            {
                                name: result.name,
                                account: result.account,
                                picture: result.picture
                            }
                        });
                    } else {
                        return res.send({result: false, message: 'Update Token Fail!'});
                    }
                });
            } else {
                return res.send({
                    result: true, memberData:
                    {
                        name: result.name,
                        account: result.account,
                        picture: result.picture
                    }
                });
            }
        }
    })
    .catch((error) =>{
        return res.status(500).send({error: error});
    });
});
// 確認是否有追蹤
router.get('/isFollow', (req, res) => {
    const {account}        = req.query;
    const {follower_account} = req.query;

    db.follows.findOne({where: {account: account, follower_account: follower_account}})
    .then( (result) => {
        if (!result) {
            res.send({result: false, msg: 'Query Failed!'});
        } else {
            console.log(result);
            res.send({result: true, msg: 'Query Successfully!'});
        }
    })
    .catch((error) =>{
        return res.status(500).send({error: error});
    });
});
// 取得粉絲人數
router.get('/follower', (req, res) => {
    const {account} = req.query;
    db.follows.findAndCountAll({where: {account: account}})
    .then( (result) => {
        console.log(result);
        console.log(result.rows);
        res.send({count: result.count, follower: result.rows});
    })
    .catch((error) =>{
        return res.status(500).send({error: error});
    });
});
// 取得追蹤人數
router.get('/follow', (req, res) => {
    const {account} = req.query;
    db.follows.findAndCountAll({where: {follower_account: account}})
    .then( (result) => {
        res.send({count: result.count, follower: result.rows});
    })
    .catch((error) =>{
        return res.status(500).send({error: error});
    });
});
// 追蹤
router.post('/followMember', (req, res) => {
    const access_token = req.headers.authorization.substring(7);
    const postBody  = req.body;
    const {account} = postBody;
    const {follow}  = postBody;
    const verification = validations.followMemberValidate(access_token, postBody);
    if (!verification.result) {
        const {statusCode} = verification;
        console.log(verification);
        return res.status(statusCode).send(verification.information);
    };

    tokenCheck(access_token, (checkResult, message, token, memberData)=>{
        if (!checkResult) {
            return res.send({result: false, message: message});
        }
        const reqUrl = cst.PROTOCOL+cst.HOST_NAME+`/api/1.0/member/isFollow?account=${account}&follower_account=${memberData.account}`;
        request.get(reqUrl, function(error, response, body) {
            if (error) {
                throw error;
            }

            const bodyObj = JSON.parse(body);
            if (bodyObj.result && !follow) {
                // 有 follow 此帳號 且 req 是 取消 follow
                // 刪除 follow
                db.follows.destroy({
                    where: {
                        account: account,
                        follower_account: memberData.account
                    }})
                .then((deletetResult)=> {
                    res.cookie('access_token', token);
                    return res.send({result: true, msg: 'Remove from follower data'});
                });
            } else if ( !bodyObj.result && follow ) {
                // 沒有 follow 此帳號 但是 req 要 follow
                // 新增 follow
                db.follows.create(
                    {
                        account: account,
                        follower_account: memberData.account,
                        time: Date.now()
                    })
                .then((insertResult)=> {
                    res.cookie('access_token', token);
                    return res.send({result: true, msg: 'Add to follower data'});
                });
            } else {
                // 有 follow 此帳號 且 req 是 like || 沒有 follow 此帳號 且 req 是 unlike
                // 只返回新 token
                res.send({result: true, msg: 'request recieve but not update any data'});
            }
        });
    });
});

module.exports = router;

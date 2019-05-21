const express = require('express');
const router  = express.Router();
const path    = require('path');
const db      = require('../util/sequelize.js');

// 24H電台頁面
router.get('/fulltimeRadio/radio', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/fulltimeRadioPlaylist.html'));
});

// 電台司令頁面
router.get('/:account/radio', (req, res) => {
    const {account} = req.params;
    const viewerToken = req.cookies['access_token'];
    let viewrole;

    db.members.findAll({where: {account: account, verify: true}, include: [{model: db.posts}]})
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
                        picture: post.dataValues.picture
                    }
                );
            })
        };

        if (!viewerToken) {
            viewrole = 'guest';
            memberData.viewfrom = viewrole;
            memberData.target = 'member';
            res.render('radioPlaylist.ejs', {memberData: memberData} );
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
                    return res.render('radioPlaylist.ejs', {memberData: memberData} );
                }

                veiwerData.forEach( (data)=> {
                    if ( data.dataValues.account === result.account) {
                        viewrole = 'self';
                    }
                });

                if (viewrole ==='others' ) {
                    memberData.viewfrom = 'others';
                    memberData.target = 'member';
                    res.render('radioPlaylist.ejs', {memberData: memberData} );
                } else if (viewrole ==='self' ) {
                    memberData.viewfrom = 'self';
                    memberData.target = 'member';
                    res.render('radioheadPlaylist.ejs', {memberData: memberData} );
                }
            });
        }
    })
    .catch((err)=> {
        res.send(err);
    });
});
// 電台司令頁面 END

// 會員分享頁面
router.get('/:account/post', (req, res) => {
    const {account} = req.params;
    const viewerToken = req.cookies['access_token'];
    let viewrole;

    db.members.findAll({where: {account: account, verify: true}, include: [{model: db.posts}]})
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
                        picture: post.dataValues.picture
                    }
                );
            })
        };

        if (!viewerToken) {
            viewrole = 'guest';
            memberData.viewfrom = viewrole;
            memberData.target = 'member';
            res.render('playlist.ejs', {memberData: memberData} );
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
                    return res.render('playlist.ejs', {memberData: memberData} );
                }

                veiwerData.forEach((data)=> {
                    if ( data.dataValues.account === result.account) {
                        viewrole = 'self';
                    }
                });

                memberData.viewfrom = viewrole;
                memberData.target = 'member';
                return res.render('playlist.ejs', {memberData: memberData} );
            });
        }
    })
    .catch((err)=> {
        res.send(err);
    });
});

module.exports = router;

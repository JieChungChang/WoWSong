const express       = require('express');
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const https         = require('https');
const fs            = require('fs');
const db            = require('./util/sequelize.js');
const getCookie     = require('./controllers/crypto.js').getCookie;

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

// 導入 ejs
app.set('view engine', 'ejs');

// 會員相關 API routers
const memberApiRoutes = require('./route/api/member');
app.use('/api/1.0/member', memberApiRoutes);

// 貼文相關 API routers
const postApiRoutes = require('./route/api/post');
app.use('/api/1.0/post', postApiRoutes);

// 播放次數相關 API routers
const videoViewRoutes = require('./route/api/view');
app.use('/api/1.0/view', videoViewRoutes);

// 通知相關 API routers
const notificationRoutes = require('./route/api/notification');
app.use('/api/1.0/notification', notificationRoutes);

// 會員相關 routers
const memberRoutes = require('./route/member');
app.use('/member', memberRoutes);

// 發文相關 routers
const postRoutes = require('./route/post');
app.use('/post', postRoutes);

// 播放清單相關 routers
const playlistRoutes = require('./route/playlist');
app.use('/playlist', playlistRoutes);

// 載入 /admin || /user 下的 html || /uploads 下的照片
app.use('/', express.static('./public'));
app.use('/public', express.static('./public'));
app.use('/post', express.static('./public/post'));
app.use('/member', express.static('./public/member'));


// 載入 https
// app.set('httpsport', 443);
// var options = {
//  key: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/privkey.pem'),
//  cert: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/cert.pem'),
//  ca: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/chain.pem')
// };
// var httpsServer = https.createServer(options, app);
// httpsServer.listen(app.get('httpsport'))
// httpsServer.on('error', onError);

// 廣播電台 Socket IO
// app.set('httpsport', 443);
// var options = {
// key: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/privkey.pem'),
// cert: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/cert.pem'),
// ca: fs.readFileSync('/etc/letsencrypt/live/j-zone.xyz/chain.pem')
// };
// var httpsServer = https.createServer(options, app);
// httpsServer.listen(app.get('httpsport'))

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const roomsInfo = {
    'fullTimeRadio': {
        'client': [],
        'message': [],
        'radiohead': ''
    }
};

io.of('/radio').on('connection', (socket) => {
    // 取得進入房間資料
    const url = socket.request.headers.referer;
    const splited = url.split('/');
    let roomID = splited[splited.length - 2];
    console.log('Room ID is '+roomID);
    // 取得進入房間資料 End

    console.log('Not Join room yet and ALL Rooms are :');
    console.log(io.nsps['/radio'].adapter.rooms);

    // 加入房間後可以監聽 leave 事件 radiohead & client 都可以監聽
    socket.on('leave', function() {
        socket.leave(roomID);
        roomID = '';
    });
    // 加入房間後可以監聽 leave 事件 radiohead & client 都可以監聽 End


    // 加入房間後可以監聽 message radiohead & client 都可以監聽這些事件
    socket.on('sendMessage', (inputContent)=>{
        console.log('receive message: '+inputContent+' from '+socket.id);
        if (roomsInfo[roomID] && roomsInfo[roomID].client.includes(socket.id)) {
            roomsInfo[roomID].message.push({sendID: socket.id, content: inputContent});
            io.of('/radio').to(roomID).emit('normalMessage', socket.id, inputContent);
        }
    });

    socket.on('rhSendMessage', (inputContent)=> {
        console.log('receive message: '+inputContent+' from '+socket.id);
        if (roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id) {
            roomsInfo[roomID].message.push({sendID: 'radiohead', content: inputContent});
            io.of('/radio').to(roomID).emit('radioheadMessage', inputContent);
        }
    });
    // 加入房間後可以監聽 message radiohead & client 都可以監聽這些事件 End

    // 有房進房 沒房驗身開房
    if (roomsInfo[roomID]) {
        roomsInfo[roomID].client.push(socket.id);
        socket.join(roomID);
        console.log('New client join to '+roomID);
        console.log(roomsInfo);
        // 加入房間後，client 發出的事件，跟 radiohead 要求 目前影片資料
        socket.on('join', function(socketid) {
            socket.to(roomID).emit('newJoin', socketid);
        });

        socket.on('joinAnnounce', function(socketid) {
            socket.to(roomID).emit('joinAnnounce', socketid, roomsInfo[roomID].client.length);
        });

        console.log('Client Join a existed room! ALL Rooms are :');
        console.log(io.nsps['/radio'].adapter.rooms);
    } else {
        // 拿 token 驗證身分
        const cookies = socket.request.headers.cookie;
        const userToken = getCookie(cookies, 'access_token');
        console.log('online user Token ' + userToken);

        if (userToken) {
            db.members.findAll({where: {access_token: userToken, verify: true}})
            .then((result)=> {
                if (result[0].account === roomID) {
                    roomsInfo[roomID] = {};
                    roomsInfo[roomID].client = [];
                    roomsInfo[roomID].message = [];
                    roomsInfo[roomID].radiohead = socket.id;

                    socket.join(roomID);

                    console.log('Radiohead open room! ALL Rooms are :');
                    console.log(io.nsps['/radio'].adapter.rooms);

                    io.of('/homepage').emit('getRadioList', roomsInfo);// 傳送最新room資訊給留在首頁的人們

                    // Radiohead 事件
                    // 傳目前播放影片給 Client
                    socket.on('sendCurrentPlayerStatus', function(socketid, currentVideo, currentTimes, playList) {
                        console.log('現在播放的影片是', currentVideo);
                        console.log('現在播放時間是', currentTimes);
                        socket.to(socketid).emit('clientVideoPlay', currentVideo, currentTimes, playList);

                        console.log('目前聊天記錄', roomsInfo[roomID].message);
                        socket.to(socketid).emit('messageRecord', roomsInfo[roomID].message);

                        console.log('目前聊天人數', roomsInfo[roomID].client.length);
                        socket.to(socketid).emit('totalClientNumber', roomsInfo[roomID].client.length);
                    });

                    // 播放下一步影片
                    socket.on('nextVedio', function(videoID) {
                        console.log(videoID);
                        if (roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id) {
                            socket.to(roomID).emit('playNext', videoID);
                        }
                    });
                    // 播放下一步影片結束

                    // 影片暫停
                    socket.on('videoStop', function() {
                        console.log('Stop');
                        console.log(socket.id);
                        console.log(roomID);
                        if (roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id) {
                            socket.to(roomID).emit('videoStop');
                        }
                    });

                    // 影片播放
                    socket.on('videoPlay', function(currentVideo, currentTime) {
                        console.log('Paly');
                        if (roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id) {
                            socket.to(roomID).emit('videoPlay', currentVideo, currentTime);
                        }
                    });

                    // 新增影片事件
                    socket.on('addVideoToList', function(videoInfo) {
                        if (roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id) {
                            socket.to(roomID).emit('addVideoToList', videoInfo);
                            socket.to(roomID).emit('systemAnnounce', 'Radiohead 新增 '+videoInfo.title);
                            socket.emit('systemAnnounce', 'Radiohead 新增 '+videoInfo.title);
                        };
                    });
                    // 新增影片事件 End
                    // Radiohead 事件 End
                }
            })
            .catch((err)=> {
                console.log(err);
            });
        }
    }
    // 有房進房 沒房驗身開房 End

    // 離線
    socket.on('disconnect', function() {
        if ( roomsInfo[roomID] && roomsInfo[roomID].radiohead === socket.id ) {
            delete roomsInfo[roomID];
            clearRoom(socket, roomID);
            io.of('/homepage').emit('getRadioList', roomsInfo); // 傳送最新room資訊給留在首頁的人們
            console.log(roomID + ' radiohead disconnected');
        } else {
            if (roomsInfo[roomID]) {
                roomsInfo[roomID].client = roomsInfo[roomID].client.filter( (item) => item !== socket.id);// 從 Client list 中移除
                console.log(roomID + ' client disconnected');

                io.of('/radio').to(roomID).emit('leaveAnnounce', socket.id, roomsInfo[roomID].client.length);
            }
        }
    });
    // 離線 end
});

// Radiohead 離開的時候，需要強制所有 Client 離開該房間的 function
/**
 * Add two numbers.
 * @param {object} rhSocket is radiohead socket.
 * @param {string} roomID target room ID to clear.
 */
function clearRoom(rhSocket, roomID) {
    io.of('/radio').in(roomID).clients((error, socketIds)=> {
        if (error) throw error;
        console.log(socketIds);
        rhSocket.to(roomID).emit('leave');
        console.log('Rooms information: ');
        console.log(roomsInfo);
    });
};

io.of('/homepage').on('connect', (socket)=> {
    socket.on('homepageEntry', function() {
        socket.emit('getRadioList', roomsInfo);
    });
});

// 24H room Socket Block
io.of('/fullTimeRadio').on('connect', async (socket) => {
    // 取得進入房間資料
    let roomID = 'fullTimeRadio';
    console.log('Room ID is '+roomID);
    // 取得進入房間資料 End

    // 看房間人數 決定進入者身分
    if (roomsInfo[roomID].radiohead ==='') {
        roomsInfo[roomID].radiohead=socket.id;

        socket.join(roomID);

        console.log('Radiohead open room! ALL Rooms are :');
        console.log(io.nsps['/fullTimeRadio'].adapter.rooms);

        // 指定 Socket ID 為 Radiohead 後，取得目前排行榜清單
        const bestPostList = await db.posts.findAll(
            {
                limit: 3,
                order: [['view_times', 'DESC']],
                attributes: ['title', 'video_id']
            }
        );

        console.log('目前聊天人數1');
        io.of('/fullTimeRadio').to(roomID).to(socket.id).emit('totalClientNumber', roomsInfo[roomID].client.length); // 前端會幫忙加一算 Radiohead 的
        io.of('/fullTimeRadio').to(roomID).to(socket.id).emit('radioheadVideoPlay', bestPostList);
    } else {
        roomsInfo[roomID].client.push(socket.id);
        socket.join(roomID);
        console.log('New client join to '+roomID);
        console.log(roomsInfo);
    }
    // 看房間人數 決定進入者身分 End

    io.of('/homepage').emit('getRadioList', roomsInfo); // 傳送最新room資訊給留在首頁的人們
    // 加入房間後可以監聽 leave 事件 radiohead & client 都可以監聽
    socket.on('leave', function() {
        socket.leave(roomID);
        roomID = '';
    });
    // 加入房間後可以監聽 leave 事件 radiohead & client 都可以監聽 End


    // 加入房間後可以監聽 message radiohead & client 都可以監聽這些事件
    socket.on('sendMessage', (inputContent)=>{
        console.log('receive message: '+inputContent+' from '+socket.id);
        if (roomsInfo[roomID].radiohead === socket.id || roomsInfo[roomID].client.includes(socket.id)) {
            roomsInfo[roomID].message.push({sendID: socket.id, content: inputContent});
            io.of('/fullTimeRadio').to(roomID).emit('normalMessage', socket.id, inputContent);
        }
    });
    // 加入房間後可以監聽 message radiohead & client 都可以監聽這些事件 End

    // Client
    // 加入房間後，client 發出的事件，跟 radiohead 要求 目前影片資料
    socket.on('join', function(socketid) {
        if ( roomsInfo[roomID].client.includes(socketid) ) {
            socket.to(roomID).emit('newJoin', socketid);
        }
    });

    socket.on('joinAnnounce', function(socketid) {
        socket.to(roomID).emit('joinAnnounce', socketid, roomsInfo[roomID].client.length);
    });

    console.log('Client Join a existed room! ALL Rooms are :');
    console.log(io.nsps['/radio'].adapter.rooms);
    // Client End

    // Radiohead 事件
    // Radiohead 傳目前播放影片給 Client
    socket.on('sendCurrentPlayerStatus', function(socketid, currentVideo, currentTimes, playList) {
        if (roomsInfo[roomID].radiohead === socket.id) {
            console.log('現在播放的影片是', currentVideo);
            console.log('現在播放時間是', currentTimes);
            socket.to(socketid).emit('clientVideoPlay', currentVideo, currentTimes, playList);

            console.log('目前聊天記錄', roomsInfo[roomID].message);
            socket.to(socketid).emit('messageRecord', roomsInfo[roomID].message);

            console.log('目前聊天人數', roomsInfo[roomID].client.length);
            socket.to(socketid).emit('totalClientNumber', roomsInfo[roomID].client.length);
        }
    });

    // 播放下一步影片
    socket.on('nextVedio', function(videoID) {
        if (roomsInfo[roomID].radiohead === socket.id) {
            console.log(videoID);
            io.of('/fullTimeRadio').to(roomID).emit('playNext', videoID);
        }
    });
    // 播放下一步影片 事件 End

    // 播放清單結束
    socket.on('vedioEnd', async function(playList, nowPlay) {
        console.log(playList);
        if (roomsInfo[roomID].radiohead === socket.id) {
            const bestPostList = await db.posts.findAll(
                {
                    limit: 3,
                    order: [['view_times', 'DESC']],
                    attributes: ['title', 'video_id']
                });

            const originalRankKey = [];
            playList.forEach((video)=>{
                originalRankKey.push(video.title);
            });
            const newRankKey =[];
            bestPostList.forEach((video)=>{
                newRankKey.push(video.title);
            });

            Array.prototype.diff = function(a) {
                return this.filter(function(i) {return a.indexOf(i) < 0;} );
            };

            const originRank = originalRankKey.diff(newRankKey);
            const newRank = newRankKey.diff(originalRankKey);

            if (originRank.length !== 0 || newRank.length !== 0 ) {
                let rankStatus = '恭喜 ';

                newRank.forEach((key)=>{
                    rankStatus += key+' ';
                });
                rankStatus += '擠下 ';

                originRank.forEach((key)=>{
                    rankStatus += key+' ';
                });

                rankStatus += '成為新的排行榜前三名！';

                nowPlay = 0;

                io.of('/fullTimeRadio').to(roomID).emit('systemAnnounce', rankStatus);
            }

            io.of('/fullTimeRadio').to(roomID).emit('updatePlaylist', bestPostList, nowPlay);
        }
    });
    // 播放清單結束結束

    // Radiohead 事件 End


    // 離線
    socket.on('disconnect', function() {
        if ( roomsInfo[roomID].radiohead === socket.id ) {
            if (roomsInfo[roomID].client.length !== 0 ) {
                // 指派 client list 中第一個人為 Radiohead
                roomsInfo[roomID].radiohead = roomsInfo[roomID].client[0];
                // client list 指派第一個人為 Radiohead 後清除
                roomsInfo[roomID].client.shift();

                io.of('/fullTimeRadio').to(roomID).emit('leaveAnnounce', socket.id, roomsInfo[roomID].client.length);
            } else {
                roomsInfo[roomID].radiohead = '';
            }
        } else {
            if (roomsInfo[roomID]) {
                roomsInfo[roomID].client = roomsInfo[roomID].client.filter((item)=> item !== socket.id);// 從 Client list 中移除
                console.log(roomID + ' client disconnected');

                io.of('/fullTimeRadio').to(roomID).emit('leaveAnnounce', socket.id, roomsInfo[roomID].client.length);
            }
        }

        io.of('/homepage').emit('getRadioList', roomsInfo);// 傳送最新room資訊給留在首頁的人們
    });
    // 離線 end
});
// 24H room end
// 廣播電台 Socket IO END


server.listen(80, () => {
    console.log('Server started on port 80');
});

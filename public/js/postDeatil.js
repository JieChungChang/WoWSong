let access_token = '';
// header 用
const postBlock = document.getElementById('member-post-block');
const navList1  = document.querySelectorAll('.nav-link')[1];
const navList2  = document.querySelectorAll('.nav-link')[2];
document.addEventListener('DOMContentLoaded', function(event) {
    const accessToken = getCookie('access_token');
    if (accessToken) {
        isLogin(accessToken);
    } else {
        navList1.setAttribute('href', '/member/signin.html');
        navList2.setAttribute('href', '/member/signup.html');
        navList1.innerText = '登入';
        navList2.innerText = '註冊';
    }

    countLike();
    renderHeader();
});
/**
 * 
 * @param {*} cookie
 */
function isLogin(cookie) {
    const data = {
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+cookie
        }
    };
    fetch('/api/1.0/member/isLogin', data)
    .then((response) => {
        return response.json();
    })
    .then((res)=>{
        if (res.result) {
            console.log(res.memberData);

            navList1.setAttribute('href', '/post/createPost.html');
            navList1.innerText = '發表';

            addDropdownList(res.memberData.name, res.memberData.account, navList2 );
            // navList2.setAttribute('href', '/post/member?account='+res.memberData.account);
            // navList2.innerText = res.memberData.name;

            // 是否有追蹤
            const account = document.getElementById('memberAccount').innerText;
            const viewer_account = res.memberData.account;
            const followMemberBtn  = document.getElementById('followMemberBtn');
            if (followMemberBtn) { // 如果這個 buttom 有 render 出來 就去要
                fetch(`/api/1.0/member/isFollow?account=${account}&follower_account=${viewer_account}`)
                .then((response) => {
                    return response.json();
                })
                .then((resJSON)=>{
                    if ( resJSON ) {
                        console.log(resJSON.result);
                        followMemberBtn.innerText= resJSON.result?'不追蹤':'追蹤';
                        followMemberBtn.setAttribute('class', 'btn btn-primary obe-btn '+(resJSON.result?'selected':'') );
                    }
                })
                .catch((err) => {
                    console.log('錯誤:', err);
                });
            }
            // 是否有追蹤 end
        } else {
            console.log(res.message);
        }
    })
    .catch((err) => {
        console.log('錯誤:', err);
    });
}
// header 用 end
/**
 * 
 * @param {*} name 
 * @param {*} account 
 * @param {*} node 
 */
function addDropdownList(name, account, node) {
    const dropdownList = document.createElement('li');
    dropdownList.setAttribute('class', 'nav-item dropdown');

    const dropdownListName = document.createElement('a');
    dropdownListName.setAttribute('class', 'nav-link dropdown-toggle');
    dropdownListName.href = '#';
    dropdownListName.id='navbarDropdownMenuLink';
    dropdownListName.setAttribute('role', 'button');
    dropdownListName.setAttribute('data-toggle', 'dropdown');
    dropdownListName.setAttribute('aria-haspopup', 'true');
    dropdownListName.setAttribute('aria-expanded', 'false');

    const dropdownListNameText = document.createTextNode(name);
    dropdownListName.appendChild(dropdownListNameText);

    dropdownList.appendChild(dropdownListName);


    const dropdownMenu = document.createElement('div');
    dropdownMenu.setAttribute('class', 'dropdown-menu');
    dropdownMenu.setAttribute('aria-labelledby', 'navbarDropdownMenuLink');


    const dropdownMenuItemLink1 = document.createElement('a');
    const dropdownMenuItemText1 = document.createTextNode('個人首頁');

    dropdownMenuItemLink1.appendChild(dropdownMenuItemText1);

    dropdownMenuItemLink1.href='/post/member?account='+account;
    dropdownMenuItemLink1.setAttribute('class', 'dropdown-item');

    dropdownMenu.appendChild(dropdownMenuItemLink1);


    const dropdownMenuItemLink2 = document.createElement('a');
    const dropdownMenuItemText2 = document.createTextNode('個人帳戶');

    dropdownMenuItemLink2.appendChild(dropdownMenuItemText2);
    dropdownMenuItemLink2.href='/member';
    dropdownMenuItemLink2.setAttribute('class', 'dropdown-item');

    dropdownMenu.appendChild(dropdownMenuItemLink2);

    const dropdownMenuItemLink3 = document.createElement('a');
    const dropdownMenuItemText3 = document.createTextNode('登出');
    dropdownMenuItemLink3.setAttribute('class', 'dropdown-item');
    dropdownMenuItemLink3.appendChild(dropdownMenuItemText3);
    dropdownMenuItemLink3.setAttribute('onclick', 'logout()');

    dropdownMenu.appendChild(dropdownMenuItemLink3);

    dropdownList.appendChild(dropdownMenu);

    node.parentNode.replaceChild(dropdownList, node);
}
/**
 * youtube view count
 */
function play() {
    const videoImg = document.getElementById('videoImg');
    videoImg.setAttribute('style', 'display:none;');


    // 因為 不管怎麼樣 onYouTubeIframeAPIReady() 這個 function 在一個頁面只會自動 call 一次
    // 所以必須靠 下面這個判斷式 再 user 看第二次影片的時候直接 call onYouTubeIframeAPIReady()
    if ( document.getElementById('ytAPIScript') || document.getElementById('www-widgetapi-script')) {
        onYouTubeIframeAPIReady();
    } else {
        const tag = document.createElement('script');
        tag.setAttribute('id', 'ytAPIScript');
        tag.src = 'https://www.youtube.com/iframe_api';

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

let player;
/**
 * 
 */
function onYouTubeIframeAPIReady() {
    console.log('API loaded!');
    player = new YT.Player('ytplayer', {
        height: '390',
        width: '640',
        videoId: video_id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
/**
 * 
 * @param {*} event 
 */
function onPlayerReady(event) {
    fetch(`/api/1.0/view/startview?video_id=${video_id}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        console.log(myJson);
        if (myJson.result) {
            viewsTimmer(player.getDuration());
        }
    });
    event.target.playVideo();
}
/**
 * 
 * @param {*} event 
 */
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) { // 影片播完會發生
        const videoIframe = document.getElementById('ytplayer');
        const newYTdiv = document.createElement('div');
        newYTdiv.setAttribute('id', 'ytplayer');

        videoIframe.parentNode.replaceChild(newYTdiv, videoIframe);

        const videoImg = document.getElementById('videoImg');
        videoImg.setAttribute('style', 'display:;');
    }
}
/**
 * 
 * @param {*} duration 
 */
function viewsTimmer(duration) {
    setTimeout('addViews()', duration*1000*3/4);
}
/**
 * 
 */
function addViews() {
// console.log(nowPlay);
    const requestData = {
        'post_id': post_id,
        'video_id': video_id
    };
    const data = JSON.stringify(requestData);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/1.0/view/addView', false);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            console.log(result);
            if (result.result) {
                document.getElementById('viewTimes').innerText = result.view_times+' 次觀看次數';
            }
        }
    };

    xhr.send(data);
}
/**
 * youtube view count
 */
function countLike() {
    const post_id = document.getElementById('postId').value;
    const likeCount = document.getElementById('likeCount');

    fetch('/api/1.0/post/countlike?post_id='+post_id)
    .then((response) => {
        return response.json();
    })
    .then((resJSON)=>{
        if ( resJSON ) {
            likeCount.innerText=resJSON.count + ' 位謳客喜歡';
        }
    })
    .catch((err) => {
        console.log('錯誤:', err);
    });
}
/**
 * 
 * @param {*} name 
 */
function getCookie(name) {
    const cookie = {};
    document.cookie.split(';').forEach(function(el) {
        const [k, v] = el.split('=');
        cookie[k.trim()] = v;
    });
    return cookie[name];
}

if (!getCookie('access_token')) {
    console.log('Didn\'t signin');
} else {
    access_token = getCookie('access_token');
    /**
     * 
     * @param {*} target 
     */
    function deleteExistContent(target) {
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
    }
    /**
     * 
     */
    function sendComment() {
        access_token = getCookie('access_token');

        const post_id = document.getElementById('postId').value;
        const commetInput = document.getElementById('videoComment').value;

        const requestData = {
            'post_id': post_id,
            'commetInput': commetInput
        };

        const data = JSON.stringify(requestData);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/1.0/post/comment', false);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let result = JSON.parse(xhr.responseText).result;
                console.log(result);
                const commentBlock    = document.getElementById('videoCommentBlock');
                deleteExistContent(commentBlock);
                result = result.reverse();
                for (let i=0; i< result.length; i++) {
                    const commentaTag     = document.createElement('a');
                    commentaTag.setAttribute('href', '/post/member?account='+result[i].member_account);
                    const commentaTagText = document.createTextNode('@'+result[i].member_account);
                    commentaTag.appendChild(commentaTagText);


                    const commentPTag     = document.createElement('p');
                    const commentPTagText = document.createTextNode('  '+result[i].comment);
                    commentPTag.appendChild(commentaTag);
                    commentPTag.appendChild(commentPTagText);
                    commentBlock.appendChild(commentPTag);

                    document.getElementById('videoComment').value = '';
                }
            } else if (xhr.readyState === 4 && xhr.status === 403) {
                window.location='/member/signin.html';
            }
        };

        xhr.send(data);
    }
    /**
     * 
     */
    function sendLikPost() {
        access_token = getCookie('access_token');
        const post_id = document.getElementById('postId').value;

        const sendLikeBtn = document.getElementById('sendLikeBtn');
        const likePost = sendLikeBtn.getAttribute('class')==='islike'?true:false;

        const requestData = {
            'post_id': post_id,
            'like_post': !likePost
        };

        const data = JSON.stringify(requestData);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/1.0/post/like', false);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(JSON.parse(xhr.responseText));
                const result = JSON.parse(xhr.responseText).result;
                if (result === 'Token expired') {
                    window.location='/member/signin.html';
                } else {
                // 修改button顏色
                    console.log(result);
                    sendLikeBtn.setAttribute('class', !likePost?'islike':'dislike' );
                    countLike();
                }
            } else if (xhr.readyState === 4 && xhr.status === 403) {
                window.location='/member/signin.html';
            }
        };

        xhr.send(data);
    }
    // 有 button 才有功能
    /**
     * 
     */
    function followMember() {
        access_token = getCookie('access_token');
        const account          = document.getElementById('memberAccount').innerText;
        const followMemberBtn  = document.getElementById('followMemberBtn');
        const followMember     = followMemberBtn.innerText==='追蹤'?true:false;

        const requestData = {
            'account': account,
            'follow': followMember
        };

        const data = JSON.stringify(requestData);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/1.0/member/followMember', false);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const followMemberBtn  = document.getElementById('followMemberBtn');
                const result = JSON.parse(xhr.responseText).result;
                if (result) {
                    if (followMember) {
                        followMemberBtn.innerText = '不追蹤';
                        followMemberBtn.setAttribute('class', 'btn btn-primary obe-btn selected' );
                        countFollower(account);
                    } else {
                        followMemberBtn.innerText = '追蹤';
                        followMemberBtn.setAttribute('class', 'btn btn-primary obe-btn' );
                        countFollower(account);
                    }
                }
            }
        };

        xhr.send(data);
    }
    // 有 button 才有功能 End
    /**
     * 
     * @param {*} post_id 
     */
    function delPost(post_id) {
        swal({
            title: '確定要刪除嗎？',
            text: '請注意刪除之後無法復原喔！',
            icon: 'warning',
            buttons: true,
            dangerMode: true
        })
    .then((willDelete) => {
        if (willDelete) {
            access_token = getCookie('access_token');
            const url='/api/1.0/post';
            const data={post_id: post_id};
            fetch(url, {
                method: 'DELETE',
                body: JSON.stringify(data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                })
            }).then((res) =>{
                return res.json();
            })
            .then((response) => {
                console.log('Success:', response);
                if (response.result) {
                    swal('成功刪除謳歌！', {
                        icon: 'success'
                    })
                    .then(
                        () => {
                            window.location.replace(`/post/member?account=${member_account}`);
                        }
                    );
                } else {
                    swal('刪除失敗');
                }
            })
            .catch((error) => console.error('Error:', error));
        }
    });
    }
}

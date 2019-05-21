const postBlock = document.getElementById('member-post-block');
const navList1  = document.querySelectorAll('.nav-link')[1];
const navList2  = document.querySelectorAll('.nav-link')[2];

document.addEventListener('DOMContentLoaded', function(event) {
    getAllPosts(0);

    const accessToken = getCookie('access_token');
    if (accessToken) {
        isLogin(accessToken);
    } else {
        navList1.setAttribute('href', '/member/signin.html');
        navList2.setAttribute('href', '/member/signup.html');

        navList1.innerText = '登入';
        navList2.innerText = '註冊';
    }
});

/**
 * 
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
        } else {
            console.log(res.message);
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
/**
 * 
 * @param {*} paging 
 */
function getAllPosts(paging) {
    const rmEle = document.getElementById('loadPostBtnBlock');
    if (rmEle) {
        rmEle.parentNode.removeChild(rmEle);
    }

    fetch('/api/1.0/post/all?paging='+paging)
    .then((response) => {
        return response.json();
    })
    .then((res)=>{
        resJSON = res.result.rawData;

        if ( resJSON ) {
            let i = 0;
            resJSON.forEach((res)=>{
                const postRaw = document.createElement('div');
                postRaw.setAttribute('class', 'post-raw');
                postRaw.setAttribute('id', 'post'+(paging*3+i));
                postBlock.appendChild(postRaw);

                // image block
                const postImgBlock = document.createElement('div');
                postImgBlock.setAttribute('class', 'post-img-block');
                postImgBlock.setAttribute('id', 'postImgBlock'+(paging*3+i));
                postRaw.appendChild(postImgBlock);

                const imgLink = document.createElement('a');
                imgLink.setAttribute('href', '/post/details?postid='+res.id);
                imgLink.setAttribute('id', 'imgLink'+i);
                postImgBlock.appendChild(imgLink);

                const img = document.createElement('img');
                img.setAttribute('src', res.picture);
                imgLink.appendChild(img);
                // image block end

                // right block
                const postContentBlock = document.createElement('div');
                postContentBlock.setAttribute('class', 'post-content-block');
                postContentBlock.setAttribute('id', 'postContentBlock'+(paging*3+i));
                postRaw.appendChild(postContentBlock);


                // content block
                const contentLink = document.createElement('a');
                contentLink.setAttribute('href', '/post/details?postid='+res.id);
                contentLink.setAttribute('id', 'content'+(paging*3+i));
                postContentBlock.appendChild(contentLink);

                const postContent = document.createElement('h3');
                const postContentText = document.createTextNode(res.content.length<30?res.content:res.content.substring(0, 30)+'...');
                postContent.appendChild(postContentText);
                contentLink.appendChild(postContent);

                const postTitle = document.createElement('h4');
                const postTitleText = document.createTextNode(res.title);
                postTitle.appendChild(postTitleText);
                contentLink.appendChild(postTitle);
                // content block end


                // social block
                const socialPBlock = document.createElement('p');
                socialPBlock.setAttribute('class', 'socialP');
                socialPBlock.setAttribute('id', 'socialP'+(paging*3+i));
                postContentBlock.appendChild(socialPBlock);

                const socialLikeText = document.createTextNode(res.like_count+' 位謳客喜愛  ');
                socialPBlock.appendChild(socialLikeText);

                const socialCommentText = document.createTextNode(res.comment_count+' 位謳客評論 ');
                socialPBlock.appendChild(socialCommentText);

                const socialViewText = document.createTextNode(res.view_times+' 次觀看  ');
                socialPBlock.appendChild(socialViewText);
                // social block end


                // post info block
                const infoPBlock = document.createElement('p');
                infoPBlock.setAttribute('class', 'infoP');
                infoPBlock.setAttribute('id', 'infoP'+(paging*3+i));
                postContentBlock.appendChild(infoPBlock);

                const infoText = document.createTextNode('來自 ');
                infoPBlock.appendChild(infoText);

                const accountLink = document.createElement('a');
                accountLink.setAttribute('href', '/post/member?account='+res.account);
                accountLink.setAttribute('id', 'accountLink'+(paging*3+i));
                infoPBlock.appendChild(accountLink);

                const accountText = document.createTextNode(res.account);
                accountLink.appendChild(accountText);

                const dateText = document.createTextNode(' at '+res.time);
                infoPBlock.appendChild(dateText);
                // post info block end
                // right block end

                i++;
            });

            if (res.result.nextPage) {
                const loadPostBtnBlock = document.createElement('div');
                loadPostBtnBlock.setAttribute('id', 'loadPostBtnBlock');
                const loadPostBtn = document.createElement('a');
                loadPostBtn.setAttribute('class', 'btn btn-default full');
                loadPostBtn.setAttribute('onclick', `getAllPosts(${res.result.nextPage})`);
                loadPostBtn.innerHTML = '再給我來一點吧';
                loadPostBtnBlock.appendChild(loadPostBtn);

                postBlock.appendChild(loadPostBtnBlock);
            }
        }
    })
    .catch((err) => {
        console.log('錯誤:', err);
    });
}

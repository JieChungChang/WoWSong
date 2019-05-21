window.fbAsyncInit = function() {
    FB.init({
        appId      : '352041075417666',
        autoLogAppEvents : true,
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v3.2' // The Graph API version to use for the call
    });

    // Now that we've initialized the JavaScript SDK, we call 
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // 下面這一段 會在 page load 的時候自動偵測是否有登入，如果有登入會自動去要 token，如果使用者不想用 FB 登入他也會自己登入。
    // 讓 user 決定要不要用 FB 登入式比較好的做法，所以 comment 掉此 func
    // FB.getLoginStatus(function(response) {
    // 	statusChangeCallback(response);
    // });
};

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
    });
}

// This is called with the results from from FB.getLoginStatus().
/**
 * 
 * @param {*} response 
 */
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI(response);
    } else {
    // The person is not logged into your app or we are unable to tell.
        document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
    }
}

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
/**
 * 
 * @param {*} serverResponse 
 */
function testAPI(serverResponse) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Client API test successful for : ' + response.name);
    });

    // 使用 FB Server Token 到後端
    let requestData = {
      'provider'     : 'Facebook',
      'access_token' : serverResponse.authResponse.accessToken,
      'user_ID'      : serverResponse.authResponse.userID,
      'email'        : serverResponse.authResponse.email // 新的 FBSIGNIN 機制會用到的 參數
    }

    let data = JSON.stringify(requestData);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/1.0/member/fbsignin', false);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = xhr.responseText;
            result = JSON.parse(result);
            window.location.replace(`/post/member?account=${result.account}`);
            // 登入後重新刷新頁面 為了讓頁面取得 TOKEN 後會自動跳轉到 user profile
        } else if (xhr.readyState === 4 && xhr.status === 403) {
            const recaptchaCheckStatus = document.getElementById('recaptchaCheck');
            recaptchaCheckStatus.innerText = result.msg;
        }
    };

    xhr.send(data);
}
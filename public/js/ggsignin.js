/**
 *
 * @param {*} googleUser
 */
function onSuccess(googleUser) {
    document.getElementById('recaptchaCheck').innerText = '';
    // console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    const profile = googleUser.getBasicProfile();
    console.log(profile);
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    const id_token = googleUser.getAuthResponse().id_token;
    console.log(id_token);

    // 使用 Google Server Token 到後端
    const requestData = {
        'provider': 'Google',
        'access_token': id_token,
        'user_ID': profile.getId(),
        'email': profile.getEmail()
    };

    const data = JSON.stringify(requestData);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/1.0/member/ggsignin', false);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = xhr.responseText;
            console.log(result);
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
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 267,
        'height': 40,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

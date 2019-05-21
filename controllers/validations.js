const validations = {};

validations.newPostValidate = function newPostValidate(access_token, video_id, content) {
    if (!access_token ) {
        return {result: false, information: {statusCode: 403, message: 'Token Not Existed!'}};
    }
    if (typeof access_token !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of token'}};
    }
    if (!video_id) {
        return {result: false, information: {statusCode: 400, message: 'Wrong video ID!'}};
    }
    if (typeof video_id !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of video id'}};
    }
    if (typeof content !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of content'}};
    }
    if (content.length<5 || content.length >50) {
        return {result: false, information: {statusCode: 400, message: 'Content need at least 5 words and less than 50 words'}};
    }

    return {result: true};
};

validations.deletePostValidate = function deletePostValidate(access_token, post_id) {
    if (!access_token) {
        return {result: false, information: {statusCode: 403, message: 'Token Not Existed!'}};
    }
    if (typeof access_token !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of token'}};
    }
    if (isNaN(post_id)) {
        return {result: false, information: {statusCode: 400, message: 'Wrong post ID!'}};
    }
    return {result: true};
};

validations.updatePostValidate = function updatePostValidate(access_token, post_id, content) {
    if (!access_token) {
        return {result: false, information: {statusCode: 403, message: 'Token Not Existed!'}};
    }
    if (typeof access_token !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of token'}};
    }
    if (typeof content !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of content'}};
    }
    if (isNaN(post_id)) {
        return {result: false, information: {statusCode: 400, message: 'Wrong post ID!'}};
    }
    if (content.length<5 || content.length >50) {
        return {result: false, information: {statusCode: 400, message: 'Content need at least 5 words and less than 50 words'}};
    }
    return {result: true};
};

validations.commentValidate = function commentValidate(access_token, post_id, commet) {
    if (!access_token) {
        return {result: false, information: {statusCode: 403, message: 'Token Not Existed!'}};
    }
    if (typeof access_token !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of token'}};
    }
    if (typeof commet !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of commet'}};
    }
    if (isNaN(post_id)) {
        return {result: false, information: {statusCode: 400, message: 'Wrong post ID!'}};
    }
    if (commet.length<1 || commet.length >30) {
        return {result: false, information: {statusCode: 400, message: 'Comment need at least 1 words and less than 30 words'}};
    }
    return {result: true};
};

validations.likepostValidate = function likepostValidate(access_token, post_id, like_post) {
    if (!access_token) {
        return {result: false, information: {statusCode: 403, message: 'Token Not Existed!'}};
    }
    if (isNaN(post_id)) {
        console.log(post_id);
        return {result: false, information: {statusCode: 400, message: 'Wrong post ID!'}};
    }
    if (typeof like_post !== 'boolean') {
        console.log(typeof like_post);
        return {result: false, information: {statusCode: 400, message: 'like post is not a boolean value!'}};
    }
    if (typeof access_token !== 'string') {
        return {result: false, information: {statusCode: 400, message: 'Wrong data type of token'}};
    }
    return {result: true};
};

validations.signupValidate = function signupValidate(memberInfo) {
    const {name}            = memberInfo;
    const {account}         = memberInfo;
    const {mail}            = memberInfo;
    const {password}        = memberInfo;
    const {passwordConfirm} = memberInfo;
    const {recaptchaRes}    = memberInfo;

    if (typeof name !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 0,
                msg: 'Name 資料型態不正確'
            }
        };
    }
    if (typeof account !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 1,
                msg: '帳號資料型態不正確'
            }
        };
    }
    if (escape(account).indexOf('%u') !== -1) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 1,
                msg: '帳號不能包含任何中文'
            }
        };
    }
    if (typeof mail !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 2,
                msg: 'mail 資料型態不正確'
            }
        };
    }
    if (typeof password !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 3,
                msg: 'password 資料型態不正確'
            }
        };
    }
    if (typeof passwordConfirm !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 4,
                msg: 'password confirm 資料型態不正確'
            }
        };
    }
    if (typeof recaptchaRes !== 'string') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 5,
                msg: 'recaptcha 資料型態不正確'
            }
        };
    }

    // reCAPTCHA
    if (
        recaptchaRes === undefined ||
        recaptchaRes === '' ||
        recaptchaRes === null
    ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 5,
                msg: '沒有取得 reCAPTCHA 驗證結果'
            }
        };
    }

    // 判斷
    if ( name.length > 10 || name === '') {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 0,
                msg: '名稱長度必須超過 0 個字或是少於 10 個字'
            }
        };
    }

    if ( account.length > 15 || account.length < 6 ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 1,
                msg: '帳號長度必須超過 6 個字或是少於 15 個字'
            }
        };
    }

    const emailValidateRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const emailValidation = mail.search( emailValidateRule );
    if ( emailValidation === -1 ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 2,
                msg: '請確實輸入 E-Mail'
            }
        };
    }

    const passwordValidateRule = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9!@#$%^&]{6,20})$/;
    const passwordValidation = password.search( passwordValidateRule );
    if ( passwordValidation === -1 ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 3,
                msg: '密碼需要滿足 6～20 個字，並且至少包含 1 個英文字母 1 個數字。'
            }
        };
    }

    const passwordConfirmValidation = passwordConfirm.search( passwordValidateRule );
    if ( passwordConfirmValidation === -1 ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 4,
                msg: '密碼需要滿足 6～20 個字，並且至少包含 1 個英文字母 1 個數字。'
            }
        };
    }

    if ( password !== passwordConfirm ) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 4,
                msg: '確認密碼不符合'
            }
        };
    }
    // 判斷 End

    return {result: true};
};

validations.nativesigninValidate = function nativesigninValidate(memberInfo) {
    const {account}      = memberInfo;
    const {password}     = memberInfo;
    const {recaptchaRes} = memberInfo;

    if (typeof account !== 'string') {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 0,
                msg: '帳號資料型態不正確'
            }
        };
    }
    if (typeof password !== 'string') {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 1,
                msg: 'Password 資料型態不正確'
            }
        };
    }
    if (typeof recaptchaRes !== 'string') {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 1,
                msg: 'recaptcha 資料型態不正確'
            }
        };
    }
    // reCAPTCHA
    if (
        recaptchaRes === undefined ||
        recaptchaRes === '' ||
        recaptchaRes === null
    ) {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 2,
                msg: '沒有取得 reCAPTCHA 驗證結果'
            }
        };
    }

    // 判斷
    if ( account.length > 15 || account.length < 6 ) {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 0,
                msg: '帳號長度必須超過 6 個字或是少於 15 個字'
            }
        };
    }
    if (escape(account).indexOf('%u') !== -1) {
        return {
            result: false,
            information: {
                signupResult: false,
                status: 0,
                msg: '帳號不能包含任何中文'
            }
        };
    }
    const passwordValidateRule = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9!@#$%^&]{6,20})$/;
    const passwordValidation = password.search( passwordValidateRule );
    if ( passwordValidation === -1 ) {
        return {
            result: false,
            information: {
                signinResult: false,
                status: 1,
                msg: '密碼需要滿足 6～20 個字，並且至少包含 1 個英文字母 1 個數字。'
            }
        };
    }
    // 判斷 End

    return {result: true};
};

validations.ggsigninValidate = function ggsigninValidate(memberInfo) {
    const {provider}     = memberInfo;
    const {access_token} = memberInfo;
    const {user_ID}      = memberInfo;

    if (provider !== 'Google') {
        return {
            result: false,
            message: 'Provider must be Google'
        };
    }

    if (!access_token) {
        return {
            result: false,
            message: 'Token Not Existed!'
        };
    }

    if (!user_ID) {
        return {
            result: false,
            message: 'user_ID Not Existed!'
        };
    }

    return {result: true};
};

validations.fbsigninValidate = function fbsigninValidate(memberInfo) {
    const {provider}     = memberInfo;
    const {access_token} = memberInfo;
    const {user_ID}      = memberInfo;

    if (provider !== 'Facebook') {
        return {
            result: false,
            message: 'Provider must be Facebook'
        };
    }

    if (!access_token) {
        return {
            result: false,
            message: 'Token Not Existed!'
        };
    }

    if (!user_ID) {
        return {
            result: false,
            message: 'user_ID Not Existed!'
        };
    }

    return {result: true};
};

validations.updateInfoValidate = function updateInfoValidate(access_token, memberInfo) {
    const {name}          = memberInfo;
    const {account}       = memberInfo;
    const {introduction}  = memberInfo;

    if (!access_token) {
        return {
            result: false,
            statusCode: 403,
            information: {
                message: 'Token Not Existed!'
            }
        };
    }

    if (typeof access_token !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of token'
            }
        };
    }
    if (typeof name !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of name'
            }
        };
    }
    if (typeof account !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of account'
            }
        };
    }
    if (typeof introduction !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of introduction'
            }
        };
    }

    // 判斷
    if ( name.length > 10 || name === '' ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 0,
                message: '名稱長度必須超過 0 個字或是少於 10 個字'
            }
        };
    };

    if ( account.length > 15 || account.length < 6 ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 1,
                message: '帳號長度必須超過 6 個字或是少於 15 個字'
            }
        };
    }

    if ( introduction.length > 50 ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 2,
                message: '自我介紹長度必須少於 50 個字'
            }
        };
    }
    // 判斷 End
    return {result: true};
};

validations.updateEmailValidate = function updateEmailValidate(access_token, memberInfo) {
    const {email}       = memberInfo;
    const {password}    = memberInfo;
    if (!access_token) {
        return {
            result: false,
            statusCode: 403,
            information: {
                message: 'Token Not Existed!'
            }
        };
    }

    if (typeof access_token !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of token'
            }
        };
    }

    if (typeof email !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of email'
            }
        };
    }

    if (typeof password !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of password'
            }
        };
    }

    // 判斷
    const emailValidateRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const emailValidation = email.search( emailValidateRule );

    const passwordValidateRule = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9!@#$%^&]{6,20})$/;
    const passwordValidation = password.search( passwordValidateRule );

    // 驗證結果
    if ( emailValidation === -1 ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 0,
                message: '請確實輸入 E-Mail'
            }
        };
    }
    if ( passwordValidation === -1 ) {
        console.log('false');

        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 1,
                message: '請確實輸入密碼'
            }
        };
    }
    // 判斷 End
    return {result: true};
};

validations.updatePasswordValidate = function updatePasswordValidate(access_token, memberInfo) {
    const {newPassword}        = memberInfo;
    const {newPasswordConfirm} = memberInfo;
    const {currentPassword}    = memberInfo;

    if (!access_token) {
        return {
            result: false,
            statusCode: 403,
            information: {
                message: 'Token Not Existed!'
            }
        };
    }

    if (typeof access_token !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of token'
            }
        };
    }

    if (typeof newPassword !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of newPassword'
            }
        };
    }

    if (typeof newPasswordConfirm !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of newPasswordConfirm'
            }
        };
    }
    if (typeof currentPassword !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of currentPassword'
            }
        };
    }

    // 判斷
    const passwordValidateRule = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9!@#$%^&]{6,20})$/;
    const newPasswordValidation = newPassword.search( passwordValidateRule );
    const newPasswordConfirmValidation = newPasswordConfirm.search( passwordValidateRule );
    const currentPasswordConfirmValidation = currentPassword.search( passwordValidateRule );

    if ( newPasswordValidation === -1) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 0,
                message: '新的密碼需要滿足 6～20 個字，並且至少包含 1 個英文字母 1 個數字。'
            }
        };
    }

    if ( newPasswordConfirmValidation === -1 ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 1,
                message: '確認密碼不符合'
            }
        };
    }

    if ( newPassword !== newPasswordConfirm ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 1,
                message: '確認密碼不符合'
            }
        };
    }

    if ( currentPasswordConfirmValidation === -1 ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 2,
                message: '請確實輸入您的密碼'
            }
        };
    }

    if ( newPassword === currentPassword ) {
        return {
            result: false,
            statusCode: 200,
            information: {
                updateResult: false,
                type: 0,
                message: '與目前密碼相同，不需要修正'
            }
        };
    }
    // 判斷 End
    return {result: true};
};

validations.followMemberValidate = function followMemberValidate(access_token, postBody) {
    const {account} = postBody;
    const {follow}  = postBody;

    if (!access_token) {
        return {
            result: false,
            statusCode: 403,
            information: {
                message: 'Token Not Existed!'
            }
        };
    }

    if (typeof access_token !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of token'
            }
        };
    }

    if (typeof account !== 'string') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of account'
            }
        };
    }

    if ( account.length > 25 || account.length < 6 ) {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Length og account should more than 6 and less than 25'
            }
        };
    }

    if (typeof follow !== 'boolean') {
        return {
            result: false,
            statusCode: 400,
            information: {
                message: 'Wrong data type of follow'
            }
        };
    }
    // 判斷 End
    return {result: true};
};

validations.addViewValidate = function addViewValidate(view_token, postBody) {
    const {post_id} = postBody;
    const {video_id}  = postBody;

    if (!view_token) {
        return {
            result: false,
            message: 'View Token Not Existed!'
        };
    }

    if (typeof view_token !== 'string') {
        return {
            result: false,
            message: 'Wrong data type of view token'
        };
    }

    if (isNaN(post_id)) {
        return {
            result: false,
            message: 'Wrong post ID!'
        };
    }

    if (!video_id) {
        return {
            result: false,
            message: 'Video id Not Existed!'
        };
    }

    if (typeof video_id !== 'string') {
        return {
            result: false,
            message: 'Wrong data type Video id'
        };
    }

    // 判斷 End
    return {result: true};
};

module.exports = validations;

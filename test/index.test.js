const validations    = require('../controllers/validations.js');
const getAllPostObj    = require('../controllers/post.js').getAll;
const chai           = require('chai');
const cst            = require('../util/constants.js');
const request        = require('supertest');
const server         = request.agent(cst.PROTOCOL+cst.HOST_NAME);
const {expect}       = chai;


describe('測試 驗證更新 POST 函數', ()=> {
    /**
     *
     * @param {*} res
     */
    function dataTypeValidate(res) {
        expect(res).to.have.property('result');
        expect(res).to.have.property('information');

        expect(res.result).to.be.a('boolean');

        expect(res.information).to.be.a('object');
        expect(res.information).to.have.property('statusCode');
        expect(res.information).to.have.property('message');

        expect(res.information.statusCode).to.be.a('number');
        expect(res.information.message).to.be.a('string');
    }
    it('驗證 access token 是否存在功能', ()=> {
        const res = validations.newPostValidate('', 'VideoID', 'Post content');
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.statusCode).to.equal(403);
        expect(res.information.message).to.equal('Token Not Existed!');
    });
    it('驗證 access token 資料型態', ()=> {
        const res = validations.newPostValidate(true, 'VideoID', 'Post content');
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong data type of token');
    });
    it('驗證 Video ID 是否存在功能', ()=> {
        const res = validations.newPostValidate('access token', '', 'Post content');
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong video ID!');
    });
    it('驗證 Post content 長度', ()=> {
        const res = validations.newPostValidate('access token', 'VideoID', 'Post');
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Content need at least 5 words and less than 50 words');
    });
    it('驗證正確輸入後結果', ()=> {
        const res = validations.newPostValidate('access token', 'VideoID', 'Post content');

        expect(res.result).to.equal(true);
    });
});
describe('測試 驗證更新基本資料 函數', ()=> {
    /**
     *
     * @param {*} res
     */
    function dataTypeValidate(res) {
        expect(res).to.have.property('result');
        expect(res).to.have.property('statusCode');
        expect(res).to.have.property('information');

        expect(res.result).to.be.a('boolean');

        expect(res.statusCode).to.be.a('number');

        expect(res.information).to.be.a('object');
        expect(res.information).to.have.property('message');

        expect(res.information.message).to.be.a('string');
    }

    /**
     *
     * @param {*} res
     */
    function dataTypeValidate1(res) {
        expect(res.information).to.have.property('updateResult');
        expect(res.information).to.have.property('type');

        expect(res.information.updateResult).to.be.a('boolean');
        expect(res.information.type).to.be.a('number');
    }

    it('驗證 access token 是否存在功能', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'account',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('', memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(403);
        expect(res.information.message).to.equal('Token Not Existed!');
    });
    it('驗證 access token 資料型態', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'account',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate(true, memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong data type of token');
    });
    it('驗證 name 資料型態', ()=> {
        const memberInfo = {
            'name': {},
            'account': 'account',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong data type of name');
    });
    it('驗證 account 資料型態', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': {},
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong data type of account');
    });
    it('驗證 introduction 資料型態', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'account',
            'introduction': {}
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(400);
        expect(res.information.message).to.equal('Wrong data type of introduction');
    });

    it('驗證 name 長度', ()=> {
        const memberInfo = {
            'name': 'name name name name name',
            'account': 'account',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(200);
        expect(res.information.updateResult).to.equal(false);
        expect(res.information.type).to.equal(0);
        expect(res.information.message).to.equal('名稱長度必須超過 0 個字或是少於 10 個字');
    });

    it('驗證 account 長度', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'acco',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);
        dataTypeValidate1(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(200);
        expect(res.information.updateResult).to.equal(false);
        expect(res.information.type).to.equal(1);
        expect(res.information.message).to.equal('帳號長度必須超過 6 個字或是少於 15 個字');
    });

    it('驗證 introduction 長度', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'account',
            'introduction': 'introduction introduction introduction introduction introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        dataTypeValidate(res);
        dataTypeValidate1(res);

        expect(res.result).to.equal(false);
        expect(res.statusCode).to.equal(200);
        expect(res.information.updateResult).to.equal(false);
        expect(res.information.type).to.equal(2);
        expect(res.information.message).to.equal('自我介紹長度必須少於 50 個字');
    });

    it('驗證正確輸入後結果', ()=> {
        const memberInfo = {
            'name': 'name',
            'account': 'account',
            'introduction': 'introduction'
        };
        const res = validations.updateInfoValidate('access token', memberInfo);
        expect(res.result).to.equal(true);
    });
});
describe('測試 驗證 nativesignin 函數', ()=> {
    /**
     *
     * @param {*} res
     */
    function dataTypeValidate(res) {
        expect(res).to.have.property('result');
        expect(res).to.have.property('information');

        expect(res.result).to.be.a('boolean');

        expect(res.information).to.be.a('object');
        expect(res.information).to.have.property('signinResult');
        expect(res.information).to.have.property('status');
        expect(res.information).to.have.property('msg');

        expect(res.information.signinResult).to.be.a('boolean');
        expect(res.information.status).to.be.a('number');
    }

    it('驗證 輸入 錯誤 body 資料所得到結果', ()=> {
        const memberInfo = false;
        const res = validations.nativesigninValidate(memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
    });

    it('驗證 account 資料長度', ()=> {
        const memberInfo = {
            'account': 'account account account account account account account',
            'password': 'password',
            'recaptchaRes': 'recaptchaRes'
        };
        const res = validations.nativesigninValidate(memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.signinResult).to.equal(false);
        expect(res.information.status).to.equal(0);
        expect(res.information.msg).to.equal('帳號長度必須超過 6 個字或是少於 15 個字');
    });

    it('驗證 account 資料型態', ()=> {
        const memberInfo = {
            'account': false,
            'password': 'password123',
            'recaptchaRes': 'recaptchaRes'
        };
        const res = validations.nativesigninValidate(memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.signinResult).to.equal(false);
        expect(res.information.status).to.equal(0);
        expect(res.information.msg).to.equal('帳號資料型態不正確');
    });
    it('驗證 password 資料內容', ()=> {
        const memberInfo = {
            'account': 'account',
            'password': '23123123*$%',
            'recaptchaRes': 'recaptchaRes'
        };
        const res = validations.nativesigninValidate(memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.signinResult).to.equal(false);
        expect(res.information.status).to.equal(1);
        expect(res.information.msg).to.equal('密碼需要滿足 6～20 個字，並且至少包含 1 個英文字母 1 個數字。');
    });
    it('驗證 password 資料型態', ()=> {
        const memberInfo = {
            'account': 'account',
            'password': {},
            'recaptchaRes': 'recaptchaRes'
        };
        const res = validations.nativesigninValidate(memberInfo);
        dataTypeValidate(res);

        expect(res.result).to.equal(false);
        expect(res.information.signinResult).to.equal(false);
        expect(res.information.status).to.equal(1);
        expect(res.information.msg).to.equal('Password 資料型態不正確');
    });
    it('驗證正確輸入後結果', ()=> {
        const memberInfo = {
            'account': 'account',
            'password': 'password123',
            'recaptchaRes': 'recaptchaRes'
        };
        const res = validations.nativesigninValidate(memberInfo);
        expect(res.result).to.equal(true);
    });
});

// 這個比較像整合測試，保留此段，與下面測試做比較
describe('測試 首頁貼文 API', ()=> {
    it('Test GET All posts API', function(done) {
        let paging = 0;
        loopest();
        /**
         * 用遞迴方式測試 get app posts API
        */
        function loopest() {
            server
            .get('/api/1.0/post/all')
            .query({paging: paging})
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.have.all.keys('nextPage', 'rawData');
                if (typeof res.body.result.nextPage === 'number') {
                    paging+=1;
                    expect(res.body.result.nextPage).to.equal(paging);
                    expect(res.body.result.rawData).to.be.a('array');
                    expect(res.body.result.rawData).to.have.lengthOf(3);
                    loopest();
                } else {
                    expect(res.body.result.nextPage).to.equal('');
                    expect(res.body.result.rawData).to.be.a('array');
                    expect(res.body.result.rawData).to.have.lengthOf.below(3);
                    done();
                }
            });
        }
    });
});
describe('測試將 SQL Query 結果轉成 API response data object 格式 function', ()=> {
    const post = {
        'id': 1,
        'content': 'content',
        'title': 'title',
        'picture': 'picture',
        'account': 'member_account',
        'time': 'time',
        'video_id': 'video_id',
        'member_likes': ['member1', 'member2', 'member3'],
        'comments': ['soso', 'nice', 'bad'],
        'view_times': 99
    };
    /**
    * 產生測試所需的假資料
    * @param {number} length SQL 查詢結果
    * @param {object} post 每頁資料上限
    * @return {object} 把 API 所要的結果傳送回去
    */
    function createPostsInfo(length, post) {
        const postsInfo = [];
        for (let i = 0; i<length; i++) {
            postsInfo.push(post);
        }
        return postsInfo;
    }
    // GET All posts SQl query result convert to object
    it('每頁限制為 3 時 貼文數量為 0 情況', ()=> {
        const paging = 0;
        const postsLimit = 3;
        const postNumber = 0;
        const postsInfo = createPostsInfo(postNumber, post);
        const res = getAllPostObj(postsInfo, postsLimit, paging);
        expect(res).to.be.a('object');
        expect(res).to.have.all.keys('nextPage', 'rawData');
        expect(res.nextPage).to.equal('');
    });
    it('每頁限制為 3 時 貼文數量為 1 情況', ()=> {
        const paging = 0;
        const postsLimit = 3;
        const postNumber = 1;
        const postsInfo = createPostsInfo(postNumber, post);
        const res = getAllPostObj(postsInfo, postsLimit, paging);
        expect(res).to.be.a('object');
        expect(res).to.have.all.keys('nextPage', 'rawData');
        expect(res.nextPage).to.equal('');
        expect(res.rawData[postNumber-1].like_count).to.equal(3);
        expect(res.rawData[postNumber-1].comment_count).to.equal(3);
    });
    it('每頁限制為 3 時 貼文數量為 3 情況', ()=> {
        const paging = 0;
        const postsLimit = 3;
        const postNumber = 3;
        const postsInfo = createPostsInfo(postNumber, post);
        const res = getAllPostObj(postsInfo, postsLimit, paging);
        expect(res).to.be.a('object');
        expect(res).to.have.all.keys('nextPage', 'rawData');
        expect(res.nextPage).to.equal(paging+1);
        expect(res.rawData[postNumber-1].like_count).to.equal(3);
        expect(res.rawData[postNumber-1].comment_count).to.equal(3);
    });
    it('每頁限制為 4 時 貼文數量為 4 情況', ()=> {
        const paging = 0;
        const postsLimit = 4;
        const postNumber = 4;
        const postsInfo = createPostsInfo(postNumber, post);
        const res = getAllPostObj(postsInfo, postsLimit, paging);
        expect(res).to.be.a('object');
        expect(res).to.have.all.keys('nextPage', 'rawData');
        expect(res.nextPage).to.equal(paging+1);
        expect(res.rawData[postNumber-1].like_count).to.equal(3);
        expect(res.rawData[postNumber-1].comment_count).to.equal(3);
    });
    it('SQL Query 傳入錯誤 data type 時回傳的結果', ()=> {
        const paging = 0;
        const postsLimit = 4;
        const postsInfo = undefined;
        const res = getAllPostObj(postsInfo, postsLimit, paging);
        expect(res).to.be.a('object');
        expect(res).to.have.property('error');
        expect(res.error).to.equal('Wired SQL Query Result.');
    });
});

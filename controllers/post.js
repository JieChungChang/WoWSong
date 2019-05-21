const formatDate = require('./date.js').formatDate;
const post = {};
/**
 * 產生全部 posts 資訊 object.
 * @param {object} sqlResArr SQL 查詢結果
 * @param {number} postsLimit 每頁資料上限
 * @param {number} paging 輸入 目前是第幾頁
 * @return {object} 把 API 所要的結果傳送回去
 */
post.getAll = function getAll(sqlResArr, postsLimit, paging) {
    const postsResult ={};
    if (!Array.isArray(sqlResArr)) {
        postsResult.error = 'Wired SQL Query Result.';
    } else {
        postsResult.nextPage = sqlResArr.length===postsLimit?parseInt(paging)+1:'';
        const rawData = [];
        for ( let i=0; i<sqlResArr.length; i++ ) {
            rawData[i] = {
                'id': sqlResArr[i].id,
                'content': sqlResArr[i].content,
                'title': sqlResArr[i].title,
                'picture': sqlResArr[i].picture,
                'account': sqlResArr[i].member_account,
                'time': formatDate(sqlResArr[i].time),
                'video_id': sqlResArr[i].video_id,
                'like_count': sqlResArr[i].member_likes.length,
                'comment_count': sqlResArr[i].comments.length,
                'view_times': sqlResArr[i].view_times
            };
        }
        postsResult.rawData = rawData;
    }
    return postsResult;
};

module.exports = post;

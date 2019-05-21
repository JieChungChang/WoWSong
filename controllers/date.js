const date = {};
// 時間轉為一般人看得懂的文字
/**
 * 時間轉為一般人看得懂的文字.
 * @param {number} dDate 輸入 Date number
 * @return {string} 轉換成時間字串
 */
date.formatDate = function formatDate(dDate) {
    const today = new Date(dDate);
    const dd = today.getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mm = monthNames[today.getMonth()]; // January is 0!
    const yyyy = today.getFullYear();
    const h = today.getHours();
    const m = today.getMinutes();
    return h+':'+m + ' ' + mm + ' ' + dd + ', ' + yyyy;
};

module.exports = date;

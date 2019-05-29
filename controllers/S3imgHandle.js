const multer = require('multer');
const storage = multer.memoryStorage();
const upload  = multer({storage: storage});


const aws = require('aws-sdk');
const awsCredentials = require('../util/.key/keys.js').awsCredentials;
// const awsS3 = 'https://s3-us-west-2.amazonaws.com/obeobeko-clone/';
const awsCloudFront = 'https://d2d5hp57fwbckv.cloudfront.net/';

aws.config.update({
    secretAccessKey: awsCredentials.secretAccessKey,
    accessKeyId: awsCredentials.accessKeyId,
    region: 'us-west-2'
});

const s3 = new aws.S3();//要放在這裡才能上傳

const S3ImageHandle = {};

const uploadImg = {};
uploadImg.multiPartHandle = upload;
uploadImg.s3upload = function(body, oldFilename, newFileName, bucketType, callback) {
    s3.putObject({
        Body: body,
        Key: newFileName,
        Bucket: 'obeobeko-clone/'+bucketType,
        ACL: 'public-read'
    }, function(error, data) {
        if (error) {
            console.log(error);
            callback(false, '');
        } else {
            // callback(true, awsS3+bucketType+'/'+fileName);
            deleteImg.s3delete(oldFilename, bucketType, (deleteResult)=> {
                callback(true, awsCloudFront+bucketType+'/'+newFileName);
            });
        }
    });
};
const deleteImg = {};
deleteImg.s3delete = function(fileName, bucketType, callback) {
    console.log('test test test')
    // 刪除檔案囉
    s3.deleteObject({
        Key: fileName,
        Bucket: 'obeobeko-clone/'+bucketType
    }, function(err, data) {
        if (err) {
            console.log(error);
            callback(false);
        } else {
            console.log('delete '+ fileName +' Success!.');
            callback(true);
        }
    });
};

S3ImageHandle.uploadImg = uploadImg;
S3ImageHandle.deleteImg = deleteImg;

module.exports = S3ImageHandle;

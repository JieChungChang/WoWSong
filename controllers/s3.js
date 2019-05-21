const request = require("request");
const aws = require('aws-sdk');
const awsCredentials = require('../util/.key/keys.js').awsCredentials;
const awsS3 = 'https://s3-us-east-1.amazonaws.com/obeobeko-clone/';

aws.config.update({
    secretAccessKey: awsCredentials.secretAccessKey,
    accessKeyId: awsCredentials.accessKeyId,
    region: 'us-west-2'
});

const s3 = new aws.S3();//要放在這裡才能上傳

const uploadImgToS3 = function(url, bucketType, fileName, callback){
    console.log(aws.config);
    let options = {
        url: url,
        encoding: null
    }
    request(options, function(error, response, body) {
        if (error || response.statusCode !== 200) { 
            console.log(error);
            callback(url);
        } 
        else {
            s3.putObject({
                Body: body,
                Key: fileName,
                Bucket: "obeobeko-clone/"+bucketType,
                ACL: 'public-read'
            }, function(error, data) { 
                if (error) {
                    console.log(error);
                    callback(url);
                } else {
                    callback(awsS3+bucketType+'/'+fileName);
                }
            }); 
        }   
    });
}

module.exports = uploadImgToS3;
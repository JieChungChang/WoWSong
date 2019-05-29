const multer = require('multer');
const storage = multer.memoryStorage();
const upload  = multer({storage:storage});


const aws = require('aws-sdk');
const awsCredentials = require('../util/.key/keys.js').awsCredentials;
const awsS3 = 'https://s3-us-west-2.amazonaws.com/obeobeko-clone/';
const awsCloudFront = 'https://d2d5hp57fwbckv.cloudfront.net/';

aws.config.update({
    secretAccessKey: awsCredentials.secretAccessKey,
    accessKeyId: awsCredentials.accessKeyId,
    region: 'us-west-2'
});

const s3 = new aws.S3();//要放在這裡才能上傳

const uploadImg = {};

uploadImg.multiPartHandle = upload;
uploadImg.s3upload = function(body, fileName, bucketType, callback) {
	s3.putObject({
	    Body: body,
	    Key: fileName,
	    Bucket: "obeobeko-clone/"+bucketType,
	    ACL: 'public-read'
	}, function(error, data) { 
	    if (error) {
	        console.log(error);
	        callback(false, "");
	    } else {
			// callback(true, awsS3+bucketType+'/'+fileName);
			callback(true, awsCloudFront+bucketType+'/'+fileName);
			
	    }
	}); 
}

module.exports = uploadImg;
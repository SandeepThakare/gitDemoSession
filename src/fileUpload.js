'use strict';
import { S3, DynamoDB } from 'aws-sdk';
import { readFile } from 'fs';
import fileType from 'file-type';
import sha1 from 'sha1';
import Common from '../common/common';
import StatusCode from '../common/statusCode';
import multipart from 'aws-lambda-multipart-parser';
let statusCode = new StatusCode().getStatusCode();
let s3 = new S3();

export function imageUpload(event, context, callback) {
    let eventData = {};
    if (event.body) {
        eventData = JSON.parse(event.body);
    }

    if (!event.body ) {
        callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, 'Image is required !!!'));
        return;
    }

    let myBucket = 'aws-poc-image-bucket';
    let image_buffer = eventData.image_buffer;
    let buffer = new Buffer(image_buffer.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    let fileMime = fileType(buffer);
    let file = getFile(fileMime, buffer);
    let params = file.params;

    if (fileMime === null) {
        callback(null, new Common().callbackHandler(statusCode.UNPROCESSABLE_ENTITY, 'The string supplied is not a file type !!!'));
        return;
    }

    s3.headBucket({ Bucket: myBucket }, function (err, data) {
        let path = 'https://pixabay.com/en/image-statue-brass-child-art-1465348/';

        if (err) {
            s3.createBucket({ Bucket: myBucket }, function (err, data) {

                s3.putObject(params, function (err, data) {
                    if (err) {
                        callback(null, new Common().callbackHandler(statusCode.INTERNAL_SERVER_ERROR), 'Unsuccessful operation !')
                    } else {
                        callback(null, new Common().callbackHandler(statusCode.OK, 'Successfully Uploaded !!!'));
                        return;
                    }
                });

                readFile(path, function (err, image_buffer) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    }
                });
            });
        } else {
            s3.putObject(params, function (err, data) {
                if (err) {
                    callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, err));
                } else {
                    callback(null, new Common().callbackHandler(statusCode.OK, 'Successfully Uploaded !!!'));
                    return;
                }
            });
        }
    });

    function getFile(fileMime, buffer) {
        let fileExt = fileMime.ext;
        let hash = sha1(new Buffer(new Date().toString()));
        let now = new Date();

        let filePath = hash + '/';
        let fileName = now.getTime() + '.' + fileExt;
        let fileFullName = filePath + fileName;
        let fullPath = 'aws_poc' + fileFullName;

        let params = {
            Bucket: myBucket,
            Key: `AWS_POC/${fileName}`, 
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: `image/${fileExt}`,
            ACL: 'public-read'
        };

        let uploadFile = {
            size: buffer.toString('ascii').length,
            type: fileMime.mime,
            name: fileName,
            full_path: fullPath
        };

        return {
            'params': params,
            'uploadFile': uploadFile,
            'filename': fileName
        };
    }
}
'use strict';
import { S3, DynamoDB } from 'aws-sdk';
import { readFile } from 'fs';
import fileType from 'file-type';
import sha1 from 'sha1';
import Common from '../common/common';
import StatusCode from '../common/statusCode';
import multipart from 'aws-lambda-multipart-parser';
import MultipartLambda from 'lambda-multipart';
let statusCode = new StatusCode().getStatusCode();
let s3 = new S3();

export function uploadImage(event, context, callback) {

    let createdAt = new Date().toUTCString();
    let etag = null;

    let myBucket = 'aws-poc-image-bucket';
    let url_prefix = 'https://s3.amazonaws.com';

    if (!event.pathParameters || !event.pathParameters.email || !event.pathParameters.filename) {

        callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, 'Email or File name is missing !'));
        return;
    }

    let fileDetails = multipart.parse(event, true);
    let parser = new MultipartLambda(event);

    // Begins the upload to the AWS S3
    s3.headBucket({ Bucket: myBucket }, (err, data) => {
        if (err) {
            s3.createBucket({ Bucket: myBucket }, (err, data) => {
                if (err) {
                    console.log(err);
                    callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, err));
                    return;
                }

                let params = {
                    Bucket: myBucket,
                    Key: `${event.pathParameters.email}/${event.pathParameters.filename}`,
                    Body: fileDetails.image_buffer.content,
                    ContentEncoding: 'base64',
                    ContentType: fileDetails.image_buffer.contentType,
                    ACL: 'public-read'
                };

                s3.putObject(params, function (err, data) {
                    if (err) {
                        console.log(JSON.stringify(err.undefined, 2));
                        callback(null, new Common().callbackHandler(statusCode.FORBIDDEN, err));
                        return;
                    } else {
                        console.log('Successfully uploaded data to myBucket/myKey');
                        callback(null, new Common().callbackHandler(statusCode.OK, 'Image successfully saved !!!'));
                        return;
                    }
                });
            });
        } else {
            let buff = new Buffer(parser.files[0]._readableState.buffer.head.data);
            let base64data = buff.toString('base64');

            let params = {
                Bucket: myBucket,
                Key: `${event.pathParameters.email}/${fileDetails.image_buffer.filename}`,
                Body: fileDetails.image_buffer.content,
                ContentEncoding: 'base64',
                ContentType: fileDetails.image_buffer.contentType,
                ACL: 'public-read'
            };

            s3.putObject(params, function (err, data) {

                if (err) {
                    console.log(err);
                    callback(new Common().callbackHandler(statusCode.FORBIDDEN, err));
                    return;
                } else {
                    console.log('Successfully uploaded data to myBucket/myKey');
                    etag = data.ETag;
                    callback(null, new Common().callbackHandler(statusCode.OK, 'Image successfully saved !!!'));
                }
            });
        }
    });
}
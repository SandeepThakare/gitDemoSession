require('dotenv').config({ path: '../.env' /* path to your project root folder */ });

import AWS from 'aws-sdk';

// connect to local DB if running offline

let options = {
	region: 'us-east-1',
	endpoint: process.env.DB_ENDPOINT,
};

console.log('Envoirnment ---- ', process.env.RESOURCE)

const dynamoDB = new AWS.DynamoDB.DocumentClient(options);

export default dynamoDB;
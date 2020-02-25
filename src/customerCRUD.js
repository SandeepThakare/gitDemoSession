import Common from '../common/common';
// import AWS from 'aws-sdk';
import dynamoDB from '../common/dynamodb';
import StatusCode from '../common/statusCode';
let statusCode = new StatusCode().getStatusCode();
// AWS.config.region = 'us-east-1';

export function addCustomer(event, context, callback) {

	let eventData;
	let email;
	let created_at = new Date().getTime();
	if (!event.body || !event.pathParameters.email) {
		callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, 'Event Body or email is missing !!!'));
		// callback(null, new Error('Malformed input ...'));
		return;
	} else {
		eventData = JSON.parse(event.body);
		email = event.pathParameters.email;
	}

	let Item = {
		email: decodeURIComponent(email),
		created_at: created_at,
		customerData: eventData
	};

	let postParams = new Common().postParams(process.env.CUSTOMER_INFO, Item);

	dynamoDB.put(postParams, (err, data) => {
		if (err) {
			console.log('Unable to add records in table. Error JSON: ', JSON.stringify(err, undefined, 2));
			return callback(null, new Common().callbackHandler(statusCode.NO_CONTENT, err));
		}
		callback(null, new Common().callbackHandler(statusCode.OK, { email: decodeURIComponent(email), cutsomerData: eventData }));
	});

}

export function getCustomersList(event, context, callback) {
	// context.callbackWaitsForEmptyEventLoop = false;

	let scanParams = new Common().scanParams(process.env.CUSTOMER_INFO || 'customer-info');

	dynamoDB.scan(scanParams, async (err, data) => {
		if(err) {
			console.log('Unable to scan table. ERROR JSON: ', JSON.stringify(err, undefined, 2));
			callback(null, await new Common().callbackHandler(statusCode.BAD_REQUEST, err));
			return;
		}
		// context.succeed();
		callback(null, new Common().callbackHandler(statusCode.OK, data, callback));
		return;
	});
	return;
}

export function getCustomer(event, context, callback) {

	let email = null;

	if(!event.pathParameters || !event.pathParameters.email) {
		callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST, 'Email is missing !!!'));
		return;	
	} else {
		email = decodeURIComponent(event.pathParameters.email);
	}

	let queryParams = new Common().queryParams(process.env.CUSTOMER_INFO, 'email', email);

	dynamoDB.query(queryParams, (err, result) => {
        
		if(err) {
			callback(null, new Common().callbackHandler(statusCode.BAD_REQUEST,err));
			return;
		}

		if(result.Items.length) {
			callback(null, new Common().callbackHandler(statusCode.OK, result.Items[0]));
			return;
		} else {
			callback(null, new Common().callbackHandler(statusCode.OK, 'No data associated with this ID'));
			return;
		}
	});
}
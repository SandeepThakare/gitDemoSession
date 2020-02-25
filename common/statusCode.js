export default class StatusCode {
	constructor() {
		// console.log('Inside Status code file');
	}

	getStatusCode() {
		let code_status = {
			'OK': 200,
			'CREATED': 201,
			'NO_CONTENT': 204,
			'PARTIAL_CONTENT': 206,
			'NOT_MODIFIED': 304,
			'BAD_REQUEST': 400,
			'UNAUTHORIZED': 401,
			'FORBIDDEN': 403,
			'NOT_FOUND': 404,
			'UNPROCESSABLE_ENTITY': 422,
			'INTERNAL_SERVER_ERROR': 500
		};
        
		return code_status;
	}
}
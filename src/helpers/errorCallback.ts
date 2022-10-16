import { ResponseError } from '@adarsh-mishra/node-utils/httpResponses';
import { ServerErrorResponse, StatusObject } from '@grpc/grpc-js';

export const errorCallback = (
	callback: (error: ServerErrorResponse | Partial<StatusObject> | null) => void,
	error: ResponseError<unknown>,
) =>
	callback({
		message: error.message,
		name: error.name,
		code: error.statusCode,
		stack: error.stack,
		details: error.error?.toString(),
	});

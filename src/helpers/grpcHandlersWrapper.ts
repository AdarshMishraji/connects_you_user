import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';

export const handlerWrapper =
	<T, V>(
		handler: (req: ServerUnaryCall<T, V>, callback: sendUnaryData<V>, wrappers: object) => void,
		wrappers: object,
	) =>
	(req: ServerUnaryCall<T, V>, callback: sendUnaryData<V>) => {
		// eslint-disable-next-line no-console
		handler(req, callback, wrappers);
	};

export const Endpoints = {
	auth: {
		endpoint: '/auth',
		authenticate: {
			endpoint: '/authenticate',
		},
		signout: {
			endpoint: '/signout',
		},
		refreshToken: {
			endpoint: '/refresh_token',
		},
		updateFcmToken: {
			endpoint: '/update_fcm_token',
		},
	},
	my: {
		endpoint: '/my',
		details: {
			endpoint: '/details',
		},
		appCachingData: {
			endpoint: '/app_caching_data',
		},
	},
	test: {
		endpoint: '/test',
	},
	users: {
		endpoint: '/users',
		list: {
			endpoint: '/list',
		},
		userId: {
			endpoint: '/:userId',
		},
	},
};

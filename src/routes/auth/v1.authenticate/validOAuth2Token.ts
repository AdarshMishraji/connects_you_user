import { jwt } from '@adarsh-mishra/node-utils';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export const validateOAuth2Token = async (token: string) => {
	if (process.env.ENV === 'dev') {
		const decodedUser = jwt.decode(token) as unknown as { name: string; email: string; picture: string };

		return {
			iss: 'https://accounts.google.com',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			email_verified: true,
			sub: '110000000000000000000',
			azp: '1000000000000-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.apps.googleusercontent.com',
			email: decodedUser.email,
			aud: '1000000000000-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.apps.googleusercontent.com',
			iat: 1516239022,
			exp: 1516242622,
			name: decodedUser.name,
			picture: decodedUser.picture,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			given_name: decodedUser.name,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			family_name: decodedUser.name,
			locale: 'en-IN',
		} as TokenPayload;
	}
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
	const response = await client.verifyIdToken({ idToken: token });
	return response.getPayload();
};

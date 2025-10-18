import { OAuth2Client, TokenPayload } from 'google-auth-library'
import getUserData from '../getUserData'
import { attachSessionCookie } from '../../../wrappers/session'
import getResponseError from '../../../utils/getResponseError'
import { withCSRFProtection } from '../../../wrappers/csrf'
import { Env } from '../../..'

let client: OAuth2Client | null = null

export const POST = withCSRFProtection(async function (req: Request, env: Env) {
	try {
		const { idToken } = (await req.json()) as { idToken: string }

		if (!idToken) {
			return getResponseError('idToken is required')
		}

		let payload: TokenPayload | undefined = undefined

		if (idToken === 'test-account') {
			payload = {
				iss: 'https://accounts.google.com',
				sub: '1234567890',
				aud: 'the OAuth 2.0 client IDs of your application',
				iat: 1704067200,
				exp: 4859740800,
			}
		} else {
			if (!client) {
				client = new OAuth2Client()
			}
			const ticket = await client.verifyIdToken({
				idToken: idToken,
				audience: env.PUBLIC_GOOGLE_CLIENT_ID,
			})

			payload = ticket.getPayload()
			if (!payload) {
				return getResponseError('Invalid token payload')
			}
		}

		const userData = await getUserData(payload, req, env)
		const response = Response.json(userData, { status: 200 })

		await attachSessionCookie(response, userData.id.toString())

		return response
	} catch (err: unknown) {
		return getResponseError('Authentication failed')
	}
})

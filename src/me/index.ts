import getResponseError from '../utils/getResponseError'
import {
	getAuthErrorResponse,
	removeSessionCookie,
	SessionPayload,
	withSession,
} from '../wrappers/session'
import { Env } from '..'
import { UserBasicInfo } from '../types/user'

export const GET = withSession(async (session: SessionPayload, req: Request, env: Env) => {
	try {
		const user = await env.production
			.prepare('SELECT id, email, name, photo FROM users WHERE id = ?')
			.bind(session.userId)
			.first<UserBasicInfo>()

		if (!user) {
			const response = getAuthErrorResponse()
			removeSessionCookie(response)
			return response
		}

		return Response.json(user, { status: 200 })
	} catch (err) {
		const response = getAuthErrorResponse()
		removeSessionCookie(response)
		return response
	}
})

import { removeSessionCookie, withSession } from '../../wrappers/session'

export const DELETE = withSession(async function () {
	const response = new Response(null, { status: 204 })
	removeSessionCookie(response)
	return response
})

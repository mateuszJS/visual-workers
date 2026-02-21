import crypto from 'crypto'
import { serialize } from 'cookie'

// Currently we only use CSRF for vulnerable endpoints which does not require user's session cookie
// like login. The benefits of that is when user open the mobile app,
// we can faster fetch user data, instead of waiting for CSRF token to be download firstly

export async function GET(): Promise<Response> {
	const csrfToken = crypto.randomBytes(32).toString('hex')

	const res = Response.json({ csrfToken }, { status: 200 })

	const cookie = serialize('csrf-token', csrfToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		path: '/api/auth/login',
	})

	res.headers.append('Set-Cookie', cookie)

	return res
}

import { Env } from '..'
import { parse } from 'cookie'

export function withCSRFProtection(handler: (req: Request, env: Env) => Promise<Response>) {
	return async (req: Request, env: Env) => {
		const cookie = parse(req.headers.get('Cookie') || '')
		const csrfTokenFromCookie = cookie['csrf-token']

		const csrfTokenFromHeader = req.headers.get('x-csrf-token')

		if (!csrfTokenFromCookie || csrfTokenFromCookie !== csrfTokenFromHeader) {
			return Response.json(
				{ error: 'Invalid CSRF token' },
				{
					status: 403,
				}
			)
		}

		return handler(req, env)
	}
}

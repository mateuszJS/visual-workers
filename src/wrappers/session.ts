import { SignJWT, jwtVerify } from 'jose'
import getResponseError from '../utils/getResponseError'
import { Env } from '..'
import { parse } from 'cookie'
import { env } from 'node:process'

let encodedKey: Uint8Array<ArrayBufferLike> | null = null
function getEncodedKey() {
	if (!encodedKey) {
		// session is used quite frerquently, due to that we encode the key once when worker is spawned
		const secretKey = env.SESSION_SECRET // generated with: openssl rand -base64 32

		if (!secretKey) {
			throw new Error('SESSION_SECRET is not defined in environment variables.')
		}

		encodedKey = new TextEncoder().encode(secretKey)
	}
	return encodedKey
}

export type SessionPayload = {
	userId: string
}

type RawSessionPayload = {
	userId: string
}

const SESSION_LIFETIME_DAYS = 7

function getCookie(value: string, expiresAt: Date): string {
	return `session=${value}; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}; Path=/api/`
}

export async function attachSessionCookie(res: Response, userId: string): Promise<void> {
	const tokenLifetime = Date.now() + SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000
	const expiresAt = new Date(tokenLifetime)
	const session = await encrypt({ userId })

	res.headers.append('Set-Cookie', getCookie(session, expiresAt))
}

export function removeSessionCookie(res: Response): void {
	res.headers.append('Set-Cookie', getCookie('', new Date(0)))
}

export async function encrypt(payload: RawSessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(SESSION_LIFETIME_DAYS + 'd')
		.sign(getEncodedKey())
}

async function decrypt(session = ''): Promise<SessionPayload | undefined | { error: string }> {
	if (!session) return undefined

	try {
		const { payload } = await jwtVerify<RawSessionPayload>(session, getEncodedKey(), {
			algorithms: ['HS256'],
		})

		return {
			userId: payload.userId,
		}
	} catch (error: unknown) {
		const isSessionExpired = (error as { code: string }).code === 'ERR_JWT_EXPIRED'
		return {
			error: isSessionExpired
				? 'Your session has expired. Please sign in again.'
				: 'Session is invalid. Please sign in again.',
		}
	}
}

// same response to avoid sharing any detail of what exactly went wrong while authorization/obtaining user object
export const getAuthErrorResponse = () => getResponseError('Unauthorized', 401)

export function withSession(
	handler: (session: SessionPayload, req: Request, env: Env) => Promise<Response>
) {
	return async (req: Request, env: Env) => {
		const cookie = parse(req.headers.get('Cookie') || '')

		if (!cookie.session) {
			return getAuthErrorResponse()
		}

		const session = await decrypt(cookie.session)

		if (session && 'error' in session) {
			console.error(session.error)
		}

		if (!session || 'error' in session || !session?.userId) {
			const res = getAuthErrorResponse()
			removeSessionCookie(res)
			return res
		}

		return handler(session, req, env)
	}
}

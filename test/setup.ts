import { beforeAll, vi } from 'vitest'
import { TokenPayload } from 'google-auth-library'
import { applyD1Migrations, env } from 'cloudflare:test'

await applyD1Migrations(env.production, env.TEST_MIGRATIONS)

beforeAll(async () => {
	vi.useFakeTimers()
	const date = new Date(2000, 0)
	vi.setSystemTime(date)

	vi.mock('google-auth-library', () => {
		return {
			OAuth2Client: vi.fn().mockImplementation(() => {
				return {
					verifyIdToken: vi.fn().mockImplementation(({ idToken }: { idToken: string }) => ({
						getPayload: vi.fn().mockImplementation(() => {
							if (idToken === 'new-token') {
								return {
									email: 'test@example.com',
									given_name: 'John Doe',
									picture: 'https://example.com/avatar.png',
									iss: 'https://accounts.google.com',
									sub: '2660163898',
									aud: '',
									iat: 1704067200,
									exp: 4859740800,
								} satisfies TokenPayload
							} else if (idToken === 'existing-token') {
								return {
									email: 'test@example.com',
									given_name: 'John Doe',
									picture: 'https://example.com/avatar.png',
									iss: 'https://accounts.google.com',
									sub: '1', // Alice mock user,
									aud: '',
									iat: 1704067200,
									exp: 4859740800,
								} satisfies TokenPayload
							} else if (idToken === 'error-token') {
								throw new Error('Invalid ID token')
							} else if (idToken === 'invalid-token') {
								return undefined
							}

							throw Error('Unhandled token type: ' + idToken)
						}),
					})),
				}
			}),
		}
	})

	await env.production
		.prepare(
			`INSERT INTO users (email, name, photo, is_bot, login_method, oidc_google_id)
			 VALUES (?, ?, ?, ?, ?, ?)`
		)
		.bind('alice@example.com', 'Alice', 'https://example.com/avatar.png', false, 'google', '1')
		.run()
})

export const aliceSessionToken =
	'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyIiwiaWF0Ijo5NDY2ODEyMDAsImV4cCI6OTQ3Mjg2MDAwfQ.jYtsRJtRljicKqM00YLA30ApNiHtag-8WwiafCLCM3k'

// id 23891542398
export const nonExistingUserSessionToken =
	'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyMzg5MTU0MjM5OCIsImlhdCI6OTQ2NjgxMjAwLCJleHAiOjk0NzI4NjAwMH0.qp4yXwD9K1CqhD2QagBLidzO0yiaEPP2mWjCaOlg0qA'

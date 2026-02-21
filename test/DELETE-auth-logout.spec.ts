import { env, createExecutionContext } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/index'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe('DELETE /auth/logout', () => {
	it('removes session cookie if user session cookie exists', async () => {
		const request = new IncomingRequest('http:x/api/auth/logout', {
			method: 'DELETE',
			headers: {
				Cookie:
					'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyIiwiaWF0Ijo5NDY2ODEyMDAsImV4cCI6OTQ3Mjg2MDAwfQ.jYtsRJtRljicKqM00YLA30ApNiHtag-8WwiafCLCM3k',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(response.status).toBe(204)
		expect(response.headers.get('Set-Cookie')).toBe(
			'session=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/api/'
		)
	})

	it('returns 401 if no session cookie is present', async () => {
		const request = new IncomingRequest('http:x/api/auth/logout', {
			method: 'DELETE',
			headers: {},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error: 'Unauthorized' })
	})
})

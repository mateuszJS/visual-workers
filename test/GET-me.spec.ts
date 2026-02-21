import { env, createExecutionContext } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/index'
import { aliceSessionToken, nonExistingUserSessionToken } from './setup'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe('GET /me', () => {
	it('returns user if exists in DB', async () => {
		const request = new IncomingRequest('http:x/api/me', {
			method: 'GET',
			headers: {
				Cookie: `session=${aliceSessionToken}`,
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			id: 2,
			email: 'alice@example.com',
			name: 'Alice',
			photo: 'https://example.com/avatar.png',
		})
		expect(response.status).toBe(200)
	})

	it('returns 401 if no session cookie is invalid', async () => {
		const request = new IncomingRequest('http:x/api/me', {
			method: 'GET',
			headers: {
				Cookie: 'session=invalid-token',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error: 'Unauthorized' })
	})

	it('returns 401 if no session cookie is not present', async () => {
		const request = new IncomingRequest('http:x/api/me', {
			method: 'GET',
			headers: {},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error: 'Unauthorized' })
	})

	it('returns 401 if user does not exist', async () => {
		const request = new IncomingRequest('http:x/api/me', {
			method: 'GET',
			headers: {
				Cookie: `session=${nonExistingUserSessionToken}`,
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error: 'Unauthorized' })
	})
})

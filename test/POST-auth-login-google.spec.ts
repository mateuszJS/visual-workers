import { env, createExecutionContext } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/index'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe('GET /auth/login/google', () => {
	it('creates a new user in D1 and returns the user + sets cookie session', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'new-token' }),
			headers: {
				'x-csrf-token': 'a',
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			id: 3,
			email: 'test@example.com',
			name: 'John Doe',
			photo: 'https://example.com/avatar.png',
		})
		expect(response.status).toBe(200)
		expect(response.headers.get('Set-Cookie')).toBe(
			'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIzIiwiaWF0Ijo5NDY2ODEyMDAsImV4cCI6OTQ3Mjg2MDAwfQ.Wg2bKvri4wlVeXCsoA7s4Uyhgsu8OSMAHhxhpHvaxEI; HttpOnly; Secure; SameSite=Strict; Expires=Fri, 07 Jan 2000 23:00:00 GMT; Path=/api/'
		)
	})

	it('returns user without creation if user with google account already exists in DB', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'existing-token' }),
			headers: {
				'x-csrf-token': 'a',
				Cookie: 'csrf-token=a',
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
		expect(response.headers.get('Set-Cookie')).toBe(
			'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyIiwiaWF0Ijo5NDY2ODEyMDAsImV4cCI6OTQ3Mjg2MDAwfQ.jYtsRJtRljicKqM00YLA30ApNiHtag-8WwiafCLCM3k; HttpOnly; Secure; SameSite=Strict; Expires=Fri, 07 Jan 2000 23:00:00 GMT; Path=/api/'
		)
	})

	it('fails if csrf token is wrong', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'new-token' }),
			headers: {
				'x-csrf-token': 'b',
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'Invalid CSRF token',
		})
		expect(response.status).toBe(403)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})

	it('fails if no header x-csrf-token is present', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'new-token' }),
			headers: {
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'Invalid CSRF token',
		})
		expect(response.status).toBe(403)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})

	it('fails if no cookie csrf-token is present', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'new-token' }),
			headers: {
				'x-csrf-token': 'a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'Invalid CSRF token',
		})
		expect(response.status).toBe(403)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})

	it("fails if google doesn't return a valid user", async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'invalid-token' }),
			headers: {
				'x-csrf-token': 'a',
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'Invalid token payload',
		})
		expect(response.status).toBe(400)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})

	it('fails if idToken is missing', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'x-csrf-token': 'a',
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'idToken is required',
		})
		expect(response.status).toBe(400)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})

	it('returned error if google auth lib has thrown error', async () => {
		const request = new IncomingRequest('http:x/api/auth/login/google', {
			method: 'POST',
			body: JSON.stringify({ idToken: 'error-token' }),
			headers: {
				'x-csrf-token': 'a',
				Cookie: 'csrf-token=a',
			},
		})

		const response = await worker.fetch(request, env, createExecutionContext())

		expect(await response.json()).toEqual({
			error: 'Authentication failed',
		})
		expect(response.status).toBe(400)
		expect(response.headers.get('Set-Cookie')).toBeNull()
	})
})

import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test'
import { describe, it, expect, vi } from 'vitest'
import worker from '../src/index'

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

// testes examples
// https://developers.cloudflare.com/workers/testing/vitest-integration/recipes/

// mocking and intercepting requests
// https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/

describe('GET /csrf', () => {
	it('responds with set cookie and csrf token in the response body', async () => {
		vi.mock('crypto', () => {
			return {
				default: {
					randomBytes: () => ({
						toString: () => 'a',
					}),
				},
			}
		})
		const request = new IncomingRequest('http:x/api/csrf', {
			method: 'GET',
		})

		const response = await worker.fetch(request, env, createExecutionContext())
		expect(response.status).toBe(200)
		expect(response.headers.get('Set-Cookie')).toBe(
			'csrf-token=a; Path=/api/auth/login; HttpOnly; Secure; SameSite=Strict'
		)
		expect(await response.json()).toEqual({ csrfToken: 'a' })
	})
})

/**
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('¡Hola El mundo!');
// 	},
// } satisfies ExportedHandler<Env>;

import * as csrf from './csrf'
import * as me from './me'
import * as loginGoogle from './auth/login/google'
import * as logout from './auth/logout'

// import { httpServerHandler } from "cloudflare:node";
// import { createServer } from "node:http";

// const stmt = env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?")
//   .bind("Alfreds Futterkiste", 1);

// Batched statements are SQL transactions ↗.
// If a statement in the sequence fails, then an error is returned for
// that specific statement, and it aborts or rolls back the entire sequence.
// const companyName1 = `Bs Beverages`;
// const companyName2 = `Around the Horn`;
// const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);
// const batchResult = await env.DB.batch([
//   stmt.bind(companyName1),
//   stmt.bind(companyName2)
// ]);
// return Response.json(batchResult);

// Executes one or more queries directly without prepared statements or parameter bindings.
// const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);

export interface Env {
	production: D1Database
	SESSION_SECRET: string
	PUBLIC_GOOGLE_CLIENT_ID: string
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const response = await getResponse(request, env)
		response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
		// response.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS,PUT,DELETE");
		// response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		return response
	},
} satisfies ExportedHandler<Env>

async function getResponse(request: Request, env: Env): Promise<Response> {
	const { pathname } = new URL(request.url)
	const { method } = request

	if (pathname === '/api/csrf' && method === 'GET') {
		return csrf.GET()
	} else if (pathname === '/api/me' && method === 'GET') {
		return me.GET(request, env)
	} else if (pathname === '/api/auth/login/google' && method === 'POST') {
		return loginGoogle.POST(request, env)
	} else if (pathname === '/api/auth/logout' && method === 'DELETE') {
		return logout.DELETE(request, env)
	} else {
		return new Response('Not Found', { status: 404 })
	}
}

// test migration against local DB
// https://developers.cloudflare.com/d1/best-practices/local-development/#usage-example

// bind values if are not dynamic
// const stmt = db
//   .prepare("SELECT * FROM Customers WHERE CompanyName = ? AND CustomerId = ?")
//   .bind("Alfreds Futterkiste", 1);

// perform sequentially, as transaction -> one fail, all are reverted
// const stmt = env.DB.prepare(`SELECT * FROM Customers WHERE CompanyName = ?`);
// const batchResult = await env.DB.batch([
//   stmt.bind(companyName1),
//   stmt.bind(companyName2)
// ]);
// wraps results in an additional array, same order as in .batch([])

// Executes one or more queries directly without prepared statements or parameter bindings.
// const returnValue = await env.DB.exec(`SELECT * FROM Customers WHERE CompanyName = "Bs Beverages"`);
// This method can have poorer performance (prepared statements can be reused in some cases) and, more importantly, is less safe.
// Only use this method for maintenance and one-shot tasks (for example, migration jobs).
// The input can be one or multiple queries separated by \n.

// D1PreparedStatement::first does not alter the SQL query. To improve performance,
// consider appending LIMIT 1 to your statement.

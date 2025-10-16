/**
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response('¡Hola El mundo!');
	},
} satisfies ExportedHandler<Env>;

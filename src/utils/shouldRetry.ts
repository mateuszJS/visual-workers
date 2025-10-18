// https://developers.cloudflare.com/d1/wrangler-commands/#d1-migrations-create
// D1 detects read-only queries and automatically attempts up to two retries

function shouldRetry(err: unknown, nextAttempt: number) {
	const errMsg = String(err)
	const isRetryableError =
		errMsg.includes('Network connection lost') ||
		errMsg.includes('storage caused object to be reset') ||
		errMsg.includes('reset because its code was updated')
	if (nextAttempt <= 5 && isRetryableError) {
		return true
	}
	return false
}

// import { tryWhile } from "@cloudflare/actors";
// return await Retries.tryWhile(async () => {
// 	const resp = await session.prepare("SELECT * FROM Orders").all();
// 	return Response.json(buildResponse(session, resp, tsStart));
// }, shouldRetry);

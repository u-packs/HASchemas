import fetch from 'node-fetch'

export default async function retrieveAccessToken(authCode) {
	let tokenUrl = "http://localhost:8123/auth/token"

	let headersList = {
		"Content-Type": "application/x-www-form-urlencoded"
		}

	let payload = `grant_type=authorization_code&code=${authCode}&client_id=http://localhost:8123/`

	// Get request using node-fetch
	const response = await fetch(tokenUrl, {
		method: "POST",
		headers: headersList,
		body: payload,
	})
	let body = await response.json()
	return body.access_token
}

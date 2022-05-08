import fetch from "node-fetch";
import fs from "fs";

export default async function createUser() {
	let createUserUrl = "http://localhost:8123/api/onboarding/users";

	let headersList = {
		"Content-Type": "application/json",
	};

	// Load the auth.json file
	let auth = fs.readFileSync("./setup/auth.json");

	// Get request using node-fetch
	const response = await fetch(createUserUrl, {
		method: "POST",
		headers: headersList,
		body: auth,
	});
	let body = await response.json();
	return body.auth_code;
}

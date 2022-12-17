import fetch from "node-fetch";
import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import glob from "glob";
import yaml from "js-yaml";

const token = process.env.TOKEN;
const baseUrl = "http://localhost:8123/";
let ajv: Ajv;

beforeAll(() => {
	const schemas = glob
		.sync("../schemas/**/*.yaml")
		.map((file) => yaml.load(fs.readFileSync(file, "utf8")));

	ajv = new Ajv({
		schemas: schemas as any,
		allErrors: true,
		strictSchema: true,
		strictNumbers: true,
		strictTypes: true,
		strictTuples: true,
		strictRequired: true,
		allowUnionTypes: true,
		allowMatchingProperties: true,
		validateFormats: true,
		verbose: true,
	});
	addFormats(ajv);
});

const cases = [
	{
		name: "Get state of the api",
		request_type: "GET",
		path: "api/",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/base-message.yaml",
		},
	},
	{
		name: "Get config",
		request_type: "GET",
		path: "api/config",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/config.yaml",
		},
	},
	{
		name: "Get events",
		request_type: "GET",
		path: "api/events",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/events.yaml",
		},
	},
	{
		name: "Get services",
		request_type: "GET",
		path: "api/services",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/services.yaml",
		},
	},
	{
		name: "Get history",
		request_type: "GET",
		path: "api/history/period",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/history.yaml",
		},
	},
	{
		name: "Get logbook lightweight",
		request_type: "GET",
		path: "api/logbook",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/logbook.yaml",
		},
	},
	{
		name: "Get state of entity",
		request_type: "GET",
		path: "api/states/sun.sun",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/shared/state-data.yaml",
		},
	},
	{
		name: "Get state of all entities",
		request_type: "GET",
		path: "api/states",
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/states.yaml",
		},
	},
	{
		name: "Get the state of entity that does not exist",
		request_type: "GET",
		path: "api/states/doesnotexist",
		output: {
			status_code: 404,
		},
	},
	{
		name: "Set the state of an entity",
		request_type: "POST",
		path: "api/states/sun.sun",
		input: {
			body: "./cases/payloads/state.json",
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/request/state.yaml",
		},
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/shared/state-data.yaml",
		},
	},
	{
		name: "Fire an event",
		request_type: "POST",
		path: "api/events/state_changed",
		input: {
			body: "./cases/payloads/event_state_changed.json",
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/request/event.yaml",
		},
		output: {
			status_code: 200,
			schema:
				"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/response/base-message.yaml",
		},
	},
];

test.each(cases)("$name", async (test) => {
	const url = baseUrl + test.path;
	const request_type = test.request_type;
	const output = test.output;
	let body: Buffer = Buffer.from("");

	if (test.input?.body) {
		body = fs.readFileSync(test.input.body);
	}

	let headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};

	let response;
	if (request_type === "GET") {
		response = await fetch(url, {
			method: "GET",
			headers: headers,
		});
	} else if (request_type === "POST") {
		response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: body,
		});
	} else if (request_type === "PUT") {
		response = await fetch(url, {
			method: "PUT",
			headers: headers,
			body: body,
		});
	} else if (request_type === "DELETE") {
		response = await fetch(url, {
			method: "DELETE",
			headers: headers,
		});
	}
	else {
		console.error("Invalid request_type", request_type)
		return
	}

	expect(response.status).toBe(output.status_code);

	if (output.schema) {
		// Load schema from file
		const validate = ajv.getSchema(output.schema);
		if (validate === undefined) {
			console.error("Could not find schema", output.schema)
			return
		}

		let body = await response.json();
		const valid = validate(body);

		if (!valid) {
			console.error(JSON.stringify(body), test.name);
		}
		expect(validate.errors).toBe(null);
		expect(valid).toBe(true);
	}
});

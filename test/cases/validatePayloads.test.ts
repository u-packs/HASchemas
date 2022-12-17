import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import glob from "glob";
import yaml from "js-yaml";

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
		name: "Get state of entity",
		input: "./cases/payloads/state.json",
		schema:
			"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/request/state.yaml",
	},
	{
		name: "Fire an event",
		input: "./cases/payloads/event_state_changed.json",
		schema:
			"https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/rest/request/event.yaml",
	},
];

test.each(cases)("$name", async (test) => {
	const data = JSON.parse(fs.readFileSync(test.input).toString());

	// Load schema from file
	const validate = ajv.getSchema(test.schema);
	if (validate === undefined) {
		console.error(ajv.errors)
		return
	}

	const valid = validate(data);

	expect(validate.errors).toBe(null);
	expect(valid).toBe(true);
});

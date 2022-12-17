import createUser from "./createUser.js";
import auth from "./auth.js";
import { spawn } from "child_process";
import cwd from "cwd";
import fetch from "node-fetch";

async function start() {
	console.info("Starting homeassistant");

	// Run this command in shell.
	// Every argument needs to be a separate string in an an array.
	const command = "docker";
	const cmdArguments = [
		"run",
		"--rm",
		"-d",
		"--name",
		"homeassistant",
		"--privileged",
		"--network=host",
		"-e",
		"TZ=America/Los_Angeles",
		"ghcr.io/home-assistant/home-assistant:stable",
	];
	const options = {
		shell: true,
		cwd: cwd(),
	};

	const server = spawn(command, cmdArguments, options);

	// Then I run a custom script that pings the server until it returns a 200.
	await serverReady();

	server.stdout.on("data", (data) => {
		console.log(`stdout: ${data}`);
	});

	server.stderr.on("data", (data) => {
		console.error(`stderr: ${data}`);
	});

	server.on("close", (code) => {
		console.log(`child process exited with code ${code}`);
	});

	console.info("Homeassistant is running");
}

async function serverReady() {
	const url = "http://localhost:8123";

	let response;
	while (response === undefined || response.status !== 200) {
		await delay(500);
		console.info("Waiting for homeassistant to start...");
		response = await fetch(url).catch((_) => {});
	}
}

export default async function setup(globalConfig) {
	await start();
	let auth_code = await createUser();
	let token = await auth(auth_code);

	process.env.TOKEN = token;

	return token;
}

function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

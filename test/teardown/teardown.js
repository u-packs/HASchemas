import { spawn } from 'child_process';
import cwd from 'cwd';

async function stop() {
	console.info("Stopping homeassistant")

	// Run this command in shell.
	// Every argument needs to be a separate string in an an array.
	const command = 'docker'
	const cmdArguments = [
		"stop",
		"homeassistant",
	]
	const options = {
	  shell: true,
	  cwd: cwd()
	}

	const server = spawn(
		command,
		cmdArguments,
		options,
	)

	server.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});

	server.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});

	server.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
	});
}

export default async function teardown(globalConfig) {
	await stop()
}

# generate-docs-:
# 	docker run --rm \
# 		-v $$PWD:/local openapitools/openapi-generator-cli help \
# 		generate
# # -i /local/openapi.yaml \

generate-docs-websocket:
	docker run --rm -it -v ${PWD}:/app/example -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
		asyncapi/generator:1.9.0 example/api/websocket.yaml @asyncapi/html-template -o example/docs/websocket --force-write --map-base-url https://raw.githubusercontent.com/u-packs/HASchemas/main/schemas/:/app/example/schemas/

.PHONY: test
test:
	cd ./test && npm test

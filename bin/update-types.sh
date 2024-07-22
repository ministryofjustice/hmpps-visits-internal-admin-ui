#!/bin/sh

# Download API definitions and update TypeScript files
# Also automatically tidies and fixes linting issues

APIS='{
  "apis": [
    {
      "api": "booker-registry-api",
      "url": "https://hmpps-prison-visit-booker-registry-dev.prison.service.justice.gov.uk/v3/api-docs"
    },
    {
      "api": "prisoner-contact-registry-api",
      "url": "https://prisoner-contact-registry-dev.prison.service.justice.gov.uk/v3/api-docs"
    },
    {
      "api": "prison-register-api",
      "url": "https://prison-register-dev.hmpps.service.justice.gov.uk/v3/api-docs"
    },
    {
      "api": "visit-scheduler-api",
      "url": "https://visit-scheduler-dev.prison.service.justice.gov.uk/v3/api-docs"
    }
  ]
}'

echo $APIS | jq -c '.apis[]' | while read API; do
  API_NAME=$(jq -r '.api' <<< $API)
  API_URL=$(jq -r '.url' <<< $API)

  echo "\nProcessing $API_NAME..."

  npx openapi-typescript $API_URL --output "./server/@types/$API_NAME.d.ts"

  npx eslint  "./server/@types/$API_NAME.d.ts" --fix
done

echo "\nNow running lint and type check:"
npm run lint
npm run typecheck

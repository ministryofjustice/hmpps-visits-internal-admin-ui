import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.6': 'ALLOW',
    // Cypress
    'node_modules/cypress@^15.16.0': 'ALLOW',
    // Provides native integration, supporting ability to write dtrace probes for bunyan
    'node_modules/dtrace-provider@^0.8.8': 'FORBID',
    // Needed by jest for running tests in watch mode
    'node_modules/fsevents@^2.3.3': 'FORBID',
    // Native solution to quickly resolve module paths, used by jest and eslint
    'node_modules/unrs-resolver@1.12.2': 'ALLOW',
  },
})

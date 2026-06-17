import { Agent as HttpAgent } from 'node:http'
import { Agent as HttpsAgent } from 'node:https'
import { setup, defaultClient, TelemetryClient, DistributedTracingModes, start } from 'applicationinsights'
import type { ApplicationInfo } from '../applicationInfo'

const buildProxyEnv = () => ({
  HTTP_PROXY: process.env.HTTP_PROXY,
  HTTPS_PROXY: process.env.HTTPS_PROXY,
  NO_PROXY: process.env.NO_PROXY,
  http_proxy: process.env.http_proxy,
  https_proxy: process.env.https_proxy,
  no_proxy: process.env.no_proxy,
})

const hasProxyConfig = (): boolean => {
  const hasUppercaseProxyConfig = Boolean(process.env.HTTP_PROXY && process.env.HTTPS_PROXY)
  const hasLowercaseProxyConfig = Boolean(process.env.http_proxy && process.env.https_proxy)
  return hasUppercaseProxyConfig || hasLowercaseProxyConfig
}

function configureProxyAgents(): void {
  if (!hasProxyConfig()) {
    return
  }

  const proxyEnv = buildProxyEnv()

  // Force the SDK onto Node's core proxy-aware agents instead of its own
  // legacy proxyUrl path, which rewrites HTTPS requests incorrectly for Envoy.
  defaultClient.config.proxyHttpUrl = ''
  defaultClient.config.proxyHttpsUrl = ''
  defaultClient.config.httpAgent = new HttpAgent({ keepAlive: true, proxyEnv })
  defaultClient.config.httpsAgent = new HttpsAgent({ keepAlive: true, proxyEnv })
}

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
    configureProxyAgents()
    start()
  }
}

export function buildAppInsightsClient(
  { applicationName, buildNumber }: ApplicationInfo,
  overrideName?: string,
): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = overrideName || applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber
    return defaultClient
  }
  return null
}

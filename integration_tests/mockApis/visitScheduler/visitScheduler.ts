import { stubFor } from '../wiremock'

export default {
  stubVisitSchedulerPing: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/visitScheduler/health/ping',
      },
      response: {
        status: 200,
      },
    })
  },
}

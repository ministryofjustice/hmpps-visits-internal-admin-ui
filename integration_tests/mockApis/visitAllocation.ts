import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubVisitAllocationPing: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/visitAllocation/health/ping',
      },
      response: {
        status: 200,
      },
    })
  },
}

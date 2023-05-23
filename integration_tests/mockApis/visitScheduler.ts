import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'

export default {
  stubSupportedPrisonIds: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/visitScheduler/config/prisons/supported',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.supportedPrisonIds(),
      },
    })
  },
}

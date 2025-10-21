import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { PrisonNegativeBalanceCountDto } from '../../server/data/visitAllocationApiTypes'
import TestData from '../../server/routes/testutils/testData'

export default {
  stubResetNegativeBalances: ({ prisonCode = 'HEI' }: { prisonCode: string }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/visitAllocation/admin/prison/${prisonCode}/reset`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubGetNegativeBalanceCount: ({
    prisonCode = 'HEI',
    prisonNegativeBalanceCount = TestData.prisonNegativeBalanceCount(),
  }: {
    prisonCode: string
    prisonNegativeBalanceCount: PrisonNegativeBalanceCountDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitAllocation/admin/prison/${prisonCode}/reset/count`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonNegativeBalanceCount,
      },
    })
  },

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

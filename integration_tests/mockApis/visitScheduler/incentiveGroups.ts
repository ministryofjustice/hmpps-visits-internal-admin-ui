import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { IncentiveGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubIncentiveGroups: ({
    prisonCode,
    body = [],
  }: {
    prisonCode: string
    body: Array<IncentiveGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/incentive-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
}

import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import { IncentiveLevelGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubIncentiveGroups: ({
    prisonCode,
    body = [TestData.incentiveLevelGroup()],
  }: {
    prisonCode: string
    body: Array<IncentiveLevelGroup>
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

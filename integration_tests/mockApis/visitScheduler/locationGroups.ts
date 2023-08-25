import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import { LocationGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubLocationGroups: ({
    prisonCode,
    body = [TestData.locationGroup()],
  }: {
    prisonCode: string
    body: Array<LocationGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/location-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
}

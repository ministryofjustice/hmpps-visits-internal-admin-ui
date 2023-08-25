import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import { CategoryGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubCategoryGroups: ({
    prisonCode,
    body = [TestData.categoryGroup()],
  }: {
    prisonCode: string
    body: Array<CategoryGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/category-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
}

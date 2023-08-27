import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { CategoryGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubCategoryGroups: ({
    prisonCode,
    body = [],
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

import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { CategoryGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubGetCategoryGroups: ({
    prisonCode,
    body = [],
  }: {
    prisonCode: string
    body: CategoryGroup[]
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
  stubGetSingleCategoryGroup: (categoryGroup: CategoryGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/category-groups/group/${categoryGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: categoryGroup,
      },
    })
  },
  stubDeleteCategoryGroup: (categoryGroup: CategoryGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/visitScheduler/admin/category-groups/group/${categoryGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
  stubCreateCategoryGroup: ({
    prisonCode,
    categoryGroup,
  }: {
    prisonCode: string
    categoryGroup: CategoryGroup
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/category-groups/group',
        bodyPatterns: [
          {
            equalToJson: {
              categories: categoryGroup.categories,
              name: categoryGroup.name,
              prisonId: prisonCode,
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: categoryGroup,
      },
    })
  },
}

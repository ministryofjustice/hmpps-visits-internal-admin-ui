import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { IncentiveGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubGetSingleIncentiveGroup: (incentiveGroup: IncentiveGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/incentive-groups/group/${incentiveGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: incentiveGroup,
      },
    })
  },
  stubCreateIncentiveGroup: ({
    prisonCode,
    incentiveGroup,
  }: {
    prisonCode: string
    incentiveGroup: IncentiveGroup
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/incentive-groups/group',
        bodyPatterns: [
          {
            equalToJson: {
              incentiveLevels: incentiveGroup.incentiveLevels,
              name: incentiveGroup.name,
              prisonId: prisonCode,
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: incentiveGroup,
      },
    })
  },
  stubDeleteIncentiveGroup: (incentiveGroup: IncentiveGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/visitScheduler/admin/incentive-groups/group/${incentiveGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
  stubGetIncentiveGroups: ({
    prisonCode,
    body = [],
  }: {
    prisonCode: string
    body: IncentiveGroup[]
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

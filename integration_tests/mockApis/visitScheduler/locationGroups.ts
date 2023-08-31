import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { LocationGroup } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubSingleLocationGroup: (locationGroup: LocationGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/location-groups/group/${locationGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: locationGroup,
      },
    })
  },
  stubCreateLocationGroup: ({
    prisonCode,
    locationGroup,
  }: {
    prisonCode: string
    locationGroup: LocationGroup
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/location-groups/group',
        bodyPatterns: [
          {
            equalToJson: {
              locations: locationGroup.locations,
              name: locationGroup.name,
              prisonId: prisonCode,
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: locationGroup,
      },
    })
  },
  stubDeleteLocationGroup: (locationGroup: LocationGroup): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/visitScheduler/admin/location-groups/group/${locationGroup.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
  stubLocationGroups: ({
    prisonCode,
    body = [],
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

import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { ContactDto } from '../../server/data/prisonerContactRegistryApiTypes'

export default {
  stubGetSocialContacts: ({
    prisonerId,
    contacts,
    approvedOnly,
  }: {
    prisonerId: string
    contacts: ContactDto[]
    approvedOnly: boolean
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/prisonerContactRegistry/prisoners/${prisonerId}/contacts/social`,
        queryParameters: {
          approvedVisitorsOnly: { equalTo: approvedOnly.toString() },
          hasDateOfBirth: { equalTo: 'true' },
          withAddress: { equalTo: 'false' },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: contacts,
      },
    })
  },
}

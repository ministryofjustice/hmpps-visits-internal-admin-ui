import { RequestHandler } from 'express'
import { BookerService, PrisonerContactsService, PrisonService } from '../../../services'
import { ContactDto } from '../../../data/prisonerContactRegistryApiTypes'
import { responseErrorToFlashMessages } from '../../../utils/utils'

type Visitor = {
  visitorId: number
  name: string
  dateOfBirth: string
  approved: string
  restrictions: ContactDto['restrictions']
  active: boolean
}
export default class BookerDetailsController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonerContactsService: PrisonerContactsService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params
      const backLinkHref = req.query.from === 'search-results' ? '/bookers/search/results' : '/bookers'

      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

      const prisoner = booker.permittedPrisoners[0] ?? undefined
      const prisonName =
        prisoner && (await this.prisonService.getPrisonName(res.locals.user.username, prisoner.prisonCode))

      let contacts: ContactDto[]
      try {
        contacts = prisoner
          ? await this.prisonerContactsService.getSocialContacts({
              username: res.locals.user.username,
              prisonerId: prisoner.prisonerId,
              approvedOnly: false,
            })
          : []
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        contacts = []
      }

      const visitors: Visitor[] = prisoner?.permittedVisitors.map(visitor => {
        const matchedContact = contacts.find(contact => contact.personId === visitor.visitorId)

        return matchedContact
          ? {
              visitorId: visitor.visitorId,
              name: `${matchedContact.firstName} ${matchedContact.lastName}`,
              dateOfBirth: matchedContact.dateOfBirth,
              approved: matchedContact.approvedVisitor ? 'Yes' : 'No',
              restrictions: matchedContact.restrictions,
              active: visitor.active,
            }
          : {
              visitorId: visitor.visitorId,
              name: 'UNKNOWN',
              dateOfBirth: '',
              approved: '',
              restrictions: [],
              active: visitor.active,
            }
      })

      return res.render('pages/bookers/booker/details', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        backLinkHref,
        booker,
        prisonName,
        visitors,
      })
    }
  }

  public clear(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params

      await this.bookerService.clearBookerDetails(res.locals.user.username, reference)

      req.flash('messages', {
        variant: 'success',
        title: 'Booker details cleared',
        text: 'Booker details have been cleared',
      })

      return res.redirect(`/bookers/booker/${reference}`)
    }
  }
}

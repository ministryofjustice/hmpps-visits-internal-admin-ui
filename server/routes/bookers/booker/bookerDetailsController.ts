import { RequestHandler } from 'express'
import { BookerService, PrisonerContactsService, PrisonService } from '../../../services'
import { ContactDto } from '../../../data/prisonerContactRegistryApiTypes'
import { responseErrorToFlashMessage } from '../../../utils/utils'

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
      const { email } = req.session.booker

      // TODO handle more than one booker record for an email address
      const booker = (await this.bookerService.getBookersByEmail(res.locals.user.username, email))[0]
      req.session.booker = booker

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
        req.flash('errors', responseErrorToFlashMessage(error))
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
        message: req.flash('message')?.[0] || {},
        booker,
        prisonName,
        visitors,
      })
    }
  }

  public clear(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      req.session.booker = await this.bookerService.clearBookerDetails(res.locals.user.username, booker.reference)
      req.flash('message', { text: 'Booker details have been cleared', type: 'success' })

      return res.redirect('/bookers/booker/details')
    }
  }
}

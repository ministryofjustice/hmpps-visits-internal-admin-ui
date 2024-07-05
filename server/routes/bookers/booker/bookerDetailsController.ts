import { RequestHandler } from 'express'
import { BookerService, PrisonerContactsService } from '../../../services'

export default class BookerDetailsController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonerContactsService: PrisonerContactsService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { email } = req.session.booker

      const booker = await this.bookerService.getBookerByEmail(res.locals.user.username, email)
      req.session.booker = booker

      const prisoner = booker.permittedPrisoners[0] ?? undefined

      const contacts = prisoner
        ? await this.prisonerContactsService.getSocialContacts({
            username: res.locals.user.username,
            prisonerId: prisoner.prisonerId,
            approvedOnly: false,
          })
        : []

      const visitors: { visitorId: number; name: string; dateOfBirth: string; approved: string; active: boolean }[] =
        prisoner?.permittedVisitors.map(visitor => {
          const matchedContact = contacts.find(contact => contact.personId === visitor.visitorId)

          return matchedContact
            ? {
                visitorId: visitor.visitorId,
                name: `${matchedContact.firstName} ${matchedContact.lastName}`,
                dateOfBirth: matchedContact.dateOfBirth,
                approved: matchedContact.approvedVisitor ? 'Yes' : 'No',
                active: visitor.active,
              }
            : {
                visitorId: visitor.visitorId,
                name: `UNKNOWN (visitor ID: ${visitor.visitorId})`,
                dateOfBirth: '',
                approved: '',
                active: visitor.active,
              }
        })

      return res.render('pages/bookers/booker/details', {
        message: req.flash('message')?.[0] || {},
        booker,
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

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
export default class BookerPrisonerDetailsController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonerContactsService: PrisonerContactsService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params

      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

      const prisoner = booker.permittedPrisoners.find(permittedPrisoner => permittedPrisoner.prisonerId === prisonerId)

      if (!prisoner) {
        return res.redirect(`/bookers/booker/${reference}`)
      }

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

      return res.render('pages/bookers/booker/bookerPrisonerDetails', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        booker,
        prisoner,
        prisonName,
        visitors,
      })
    }
  }
}

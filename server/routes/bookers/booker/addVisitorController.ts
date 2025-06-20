import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService, PrisonerContactsService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { ContactDto } from '../../../data/prisonerContactRegistryApiTypes'

export default class AddVisitorController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonerContactsService: PrisonerContactsService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params
      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)
      const prisoner = booker.permittedPrisoners.find(permittedPrisoner => permittedPrisoner.prisonerId === prisonerId)

      if (!prisoner) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has no prisoner',
          text: 'This booker has no prisoner set',
        })
        return res.redirect(`/bookers/booker/${reference}`)
      }

      let allContacts: ContactDto[]
      try {
        allContacts = await this.prisonerContactsService.getSocialContacts({
          username: res.locals.user.username,
          prisonerId: prisoner.prisonerId,
          approvedOnly: true,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        allContacts = []
      }

      const existingVisitorIds = prisoner.permittedVisitors.map(visitor => visitor.visitorId)
      const filteredContacts = allContacts.filter(contact => !existingVisitorIds.includes(contact.personId))

      return res.render('pages/bookers/booker/addVisitor', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        booker,
        contacts: filteredContacts,
        prisoner,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}/add-visitor`)
      }

      const { visitorId }: { visitorId: number } = req.body
      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

      try {
        await this.bookerService.addVisitor(res.locals.user.username, booker.reference, prisonerId, visitorId)
        req.flash('messages', {
          variant: 'success',
          title: 'Visitor added',
          text: 'Visitor added',
        })

        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}/add-visitor`)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('visitorId', 'Select a contact').toInt().notEmpty()]
  }
}

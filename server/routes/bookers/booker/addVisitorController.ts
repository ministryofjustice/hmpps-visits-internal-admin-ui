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
      const { booker } = req.session

      if (booker.permittedPrisoners.length !== 1) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has no prisoner',
          text: 'This booker has no prisoner set',
        })
        return res.redirect('/bookers/booker/details')
      }

      let allContacts: ContactDto[]
      try {
        allContacts = await this.prisonerContactsService.getSocialContacts({
          username: res.locals.user.username,
          prisonerId: booker.permittedPrisoners[0].prisonerId,
          approvedOnly: true,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        allContacts = []
      }

      const existingVisitorIds = booker.permittedPrisoners[0].permittedVisitors.map(visitor => visitor.visitorId)
      const filteredContacts = allContacts.filter(contact => !existingVisitorIds.includes(contact.personId))

      return res.render('pages/bookers/booker/addVisitor', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        booker,
        contacts: filteredContacts,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add-visitor')
      }

      const { booker } = req.session
      const { visitorId }: { visitorId: number } = req.body

      try {
        await this.bookerService.addVisitor(
          res.locals.user.username,
          booker.reference,
          booker.permittedPrisoners[0].prisonerId,
          visitorId,
        )
        req.flash('messages', {
          variant: 'success',
          title: `Visitor added`,
          text: `Visitor added`,
        })

        return res.redirect('/bookers/booker/details')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add-visitor')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('visitorId', 'Select a contact').toInt().notEmpty()]
  }
}

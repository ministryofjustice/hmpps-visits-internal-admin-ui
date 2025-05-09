import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonContactDetails } from '../../../data/prisonRegisterApiTypes'

export default class AddEditContactDetailsController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { action, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const existingContactDetails: Partial<PrisonContactDetails> =
        action === 'edit' ? await this.prisonService.getPrisonContactDetails(res.locals.user.username, prison.code) : {}

      const formValues = {
        emailAddress: existingContactDetails?.emailAddress,
        phoneNumber: existingContactDetails?.phoneNumber,
        webAddress: existingContactDetails?.webAddress,
        ...req.flash('formValues')?.[0],
      }

      return res.render('pages/prisons/configuration/addEditContactDetails', {
        errors: req.flash('errors'),
        prison,
        action,
        formValues,
      })
    }
  }

  public addSubmit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration/contact-details/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { emailAddress, phoneNumber, webAddress } = req.body
      const contactDetailsAreEmpty = emailAddress === '' && phoneNumber === '' && webAddress === ''

      if (contactDetailsAreEmpty) {
        req.flash('messages', {
          variant: 'information',
          title: 'No contact details added',
          text: 'No contact details added (none entered)',
        })
        return res.redirect(`/prisons/${prisonId}/configuration`)
      }

      try {
        await this.prisonService.createPrisonContactDetails(res.locals.user.username, prisonId, {
          type: 'SOCIAL_VISIT',
          emailAddress,
          phoneNumber,
          webAddress,
        })

        req.flash('messages', { variant: 'success', title: 'Contact details added', text: 'Contact details added' })

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)

        return res.redirect(originalUrl)
      }
    }
  }

  public editSubmit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration/contact-details/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { emailAddress, phoneNumber, webAddress } = req.body
      const contactDetailsAreEmpty = emailAddress === '' && phoneNumber === '' && webAddress === ''

      try {
        if (contactDetailsAreEmpty) {
          await this.prisonService.deletePrisonContactDetails(res.locals.user.username, prisonId)
          req.flash('messages', {
            variant: 'success',
            title: 'Contact details removed',
            text: 'Contact details removed (all values set to empty)',
          })
        } else {
          await this.prisonService.updatePrisonContactDetails(res.locals.user.username, prisonId, {
            type: 'SOCIAL_VISIT',
            emailAddress,
            phoneNumber,
            webAddress,
          })
          req.flash('messages', {
            variant: 'success',
            title: 'Contact details updated',
            text: 'Contact details updated',
          })
        }

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('emailAddress', 'Enter a valid email address').trim().isEmail().optional({ values: 'falsy' }),
      body('phoneNumber', 'Enter a valid phone number')
        .trim()
        .matches(/^(?:0|\+?44)(?:\d\s?){9,10}$/)
        .optional({ values: 'falsy' }),
      body('webAddress', 'Enter a valid web address')
        .trim()
        .isURL({ require_protocol: true })
        .optional({ values: 'falsy' }),
    ]
  }
}

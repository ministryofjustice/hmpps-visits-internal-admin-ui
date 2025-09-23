import express from 'express'
import { FieldValidationError } from 'express-validator'
import nunjucksSetup from './nunjucksSetup'

describe('Nunjucks Filters', () => {
  const app = express()
  const njk = nunjucksSetup(app, null)

  describe('errorSummaryList', () => {
    it('should map errors to text and href', () => {
      const errors = <FieldValidationError[]>[
        { msg: 'Field 1 message', path: 'field1' },
        { msg: 'Field 2 message', path: 'field2' },
      ]
      const expectedResult = [
        { text: 'Field 1 message', href: '#field1-error' },
        { text: 'Field 2 message', href: '#field2-error' },
      ]

      const result = njk.getFilter('errorSummaryList')(errors)
      expect(result).toEqual(expectedResult)
    })

    it('should map error with no path to text with no href', () => {
      const errors = <FieldValidationError[]>[{ msg: 'Field 1 message with no path' }]
      const expectedResult = [{ text: 'Field 1 message with no path' }]

      const result = njk.getFilter('errorSummaryList')(errors)
      expect(result).toEqual(expectedResult)
    })

    it('should handle empty errors object', () => {
      const result = njk.getFilter('errorSummaryList')(undefined)
      expect(result).toEqual([])
    })
  })

  describe('findError', () => {
    it('should find specified error and return errorMessage for GDS components', () => {
      const errors = <FieldValidationError[]>[
        { msg: 'Field 1 message', path: 'field1' },
        { msg: 'Field 2 message', path: 'field2' },
      ]
      const expectedResult = { text: 'Field 2 message' }

      const result = njk.getFilter('findError')(errors, 'field2')
      expect(result).toEqual(expectedResult)
    })

    it('should handle empty errors object and missing form field', () => {
      const result = njk.getFilter('findError')(undefined)
      expect(result).toEqual(null)
    })
  })

  describe('pluralise', () => {
    describe('Regular plurals', () => {
      it('should return plural form when count is 0', () => {
        const result = njk.getFilter('pluralise')('table', 0)
        expect(result).toEqual('tables')
      })

      it('should return singular form when count is 1', () => {
        const result = njk.getFilter('pluralise')('table', 1)
        expect(result).toEqual('table')
      })

      it('should return plural form when count is 2', () => {
        const result = njk.getFilter('pluralise')('table', 2)
        expect(result).toEqual('tables')
      })
    })

    describe('Irregular plurals', () => {
      it('should return plural form when count is 0', () => {
        const result = njk.getFilter('pluralise')('child', 0, 'children')
        expect(result).toEqual('children')
      })

      it('should return singular form when count is 1', () => {
        const result = njk.getFilter('pluralise')('child', 1, 'children')
        expect(result).toEqual('child')
      })

      it('should return plural form when count is 2', () => {
        const result = njk.getFilter('pluralise')('child', 2, 'children')
        expect(result).toEqual('children')
      })
    })
  })

  describe('voRestrictionText', () => {
    it('should return "VO or PVO" when input is VO_PVO', () => {
      const result = njk.getFilter('voRestrictionText')('VO_PVO')
      expect(result).toEqual('VO or PVO')
    })

    it('should return "VO only" when input is VO', () => {
      const result = njk.getFilter('voRestrictionText')('VO')
      expect(result).toEqual('VO only')
    })

    it('should return "PVO only" when input is PVO', () => {
      const result = njk.getFilter('voRestrictionText')('PVO')
      expect(result).toEqual('PVO only')
    })

    it('should return "This session does not use a visiting order" when input is NONE', () => {
      const result = njk.getFilter('voRestrictionText')('NONE')
      expect(result).toEqual('This session does not use a visiting order')
    })

    it('should return "Unsupported type" when input is XXX', () => {
      const result = njk.getFilter('voRestrictionText')('xxx')
      expect(result).toEqual('Unsupported type')
    })
  })
})

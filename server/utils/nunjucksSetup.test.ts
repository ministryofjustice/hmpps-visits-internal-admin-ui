import * as cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from './nunjucksSetup'

describe('Nunjucks Filters', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks(null)

  describe('initialiseName', () => {
    it('should return null if full name is not provided', () => {
      viewContext = {}
      const nunjucksString = '{{ fullName | initialiseName }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('')
    })

    it('should return formatted name', () => {
      viewContext = {
        fullName: 'Joe Bloggs',
      }
      const nunjucksString = '{{ fullName | initialiseName }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('J. Bloggs')
    })
  })

  describe('errorSummaryList', () => {
    it('should map errors to text and href', () => {
      viewContext = {
        errors: [
          {
            msg: 'Field 1 message',
            path: 'field1',
          },
          {
            msg: 'Field 2 message',
            path: 'field2',
          },
        ],
      }
      const nunjucksString = '{{ errors | errorSummaryList | dump }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe(
        JSON.stringify([
          {
            text: 'Field 1 message',
            href: '#field1-error',
          },
          {
            text: 'Field 2 message',
            href: '#field2-error',
          },
        ]),
      )
    })

    it('should handle empty errors object', () => {
      viewContext = {}
      const nunjucksString = '{{ errors | errorSummaryList }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('')
    })
  })

  describe('findError', () => {
    it('should find specified error and return errorMessage for GDS components', () => {
      viewContext = {
        errors: [
          {
            msg: 'Field 1 message',
            path: 'field1',
          },
          {
            msg: 'Field 2 message',
            path: 'field2',
          },
        ],
      }
      const nunjucksString = '{{ errors | findError("field2") | dump }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe(JSON.stringify({ text: 'Field 2 message' }))
    })

    it('should handle empty errors object and missing form field', () => {
      viewContext = {}
      const nunjucksString = '{{ errors | findError }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('')
    })
  })
})

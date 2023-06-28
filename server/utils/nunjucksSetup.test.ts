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

    it('should map error with no path to text with no href', () => {
      viewContext = {
        errors: [
          {
            msg: 'Field 1 message with no path',
          },
        ],
      }
      const nunjucksString = '{{ errors | errorSummaryList | dump }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe(
        JSON.stringify([
          {
            text: 'Field 1 message with no path',
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

  describe('formatDate', () => {
    it('should format a date using default format', () => {
      viewContext = {
        date: '2022-02-14T10:00:00',
      }
      const nunjucksString = '{{ date | formatDate }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('14 February 2022')
    })

    it('should format a date using specified format', () => {
      viewContext = {
        date: '2022-02-14T10:00:00',
      }
      const nunjucksString = '{{ date | formatDate("yy MMM d") }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('22 Feb 14')
    })

    it('should handle missing date', () => {
      viewContext = {}
      const nunjucksString = '{{ date | formatDate }}'
      compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)
      const $ = cheerio.load(compiledTemplate.render(viewContext))
      expect($('body').text()).toBe('')
    })
  })

  describe('pluralise', () => {
    describe('Regular plurals', () => {
      it('should return plural form when count is 0', () => {
        compiledTemplate = nunjucks.compile('{{ "table" | pluralise(0) }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('tables')
      })

      it('should return singular form when count is 1', () => {
        compiledTemplate = nunjucks.compile('{{ "table" | pluralise(1) }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('table')
      })

      it('should return plural form when count is 2', () => {
        compiledTemplate = nunjucks.compile('{{ "table" | pluralise(2) }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('tables')
      })
    })

    describe('Irregular plurals', () => {
      it('should return plural form when count is 0', () => {
        compiledTemplate = nunjucks.compile('{{ "child" | pluralise(0, "children") }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('children')
      })

      it('should return singular form when count is 1', () => {
        compiledTemplate = nunjucks.compile('{{ "child" | pluralise(1, "children") }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('child')
      })

      it('should return plural form when count is 2', () => {
        compiledTemplate = nunjucks.compile('{{ "child" | pluralise(2, "children") }}', njkEnv)
        const $ = cheerio.load(compiledTemplate.render())
        expect($('body').text()).toBe('children')
      })
    })
  })
})

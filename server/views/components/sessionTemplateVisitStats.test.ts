import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import express from 'express'
import TestData from '../../routes/testutils/testData'
import nunjucksSetup from '../../utils/nunjucksSetup'
import { VisitStatsSummary } from '../../@types/visits-admin'

const app = express()
const njkEnv = nunjucksSetup(app, null)
const nunjucksString = `
  {%- from "components/sessionTemplateVisitStats.njk" import sessionTemplateVisitStats -%}
  {{ sessionTemplateVisitStats(visitStats) }}
`
const compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)

let visitStats: VisitStatsSummary
const viewContext = { visitStats }

describe('sessionTemplateVisitStats(visitStats) macro', () => {
  it('should handle missing visit stats', () => {
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($.text()).toBe('')
  })

  it('should render booked and cancelled totals and future visits by date date list', () => {
    viewContext.visitStats = TestData.visitStatsSummary({
      bookedCount: 6,
      cancelCount: 4,
      dates: {
        '2024-01-15': { booked: 3 },
        '2024-01-20': { cancelled: 1 },
        '2024-01-25': { booked: 2, cancelled: 4 },
      },
    })
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($.text().trim()).toContain('6 booked visits')
    expect($.text().trim()).toContain('4 cancelled visits')
    expect($.text().trim()).toContain('15 January 2024 – 3 booked')
    expect($.text().trim()).toContain('20 January 2024 – 1 cancelled')
    expect($.text().trim()).toContain('25 January 2024 – 2 booked and 4 cancelled')
  })
})

import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import express from 'express'
import { SessionTemplateVisitStatsDto } from '../../data/visitSchedulerApiTypes'
import TestData from '../../routes/testutils/testData'
import nunjucksSetup from '../../utils/nunjucksSetup'

const app = express()
const njkEnv = nunjucksSetup(app, null)
const nunjucksString = `
  {%- from "components/sessionTemplateVisitStats.njk" import sessionTemplateVisitStats -%}
  {{ sessionTemplateVisitStats(visitStats) }}
`
const compiledTemplate = nunjucks.compile(nunjucksString, njkEnv)

let visitStats: SessionTemplateVisitStatsDto
const viewContext = { visitStats }

describe('sessionTemplateVisitStats(visitStats) macro', () => {
  it('should handle missing visit stats', () => {
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($.text()).toBe('')
  })

  it('should render cancelled visit count', () => {
    viewContext.visitStats = TestData.visitStats({
      cancelCount: 1,
      visitCount: 0,
      visitsByDate: [],
    })
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($.text().trim()).toContain('0 booked visits')
    expect($.text().trim()).toContain('1 cancelled visit')
    expect($.text().trim()).not.toContain('Future booked visits')
  })

  it('should render booked visit count and future visits by date date list', () => {
    viewContext.visitStats = TestData.visitStats()
    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($.text().trim()).toContain('7 booked visits')
    expect($.text().trim()).toContain('0 cancelled visits')
    expect($.text().trim()).toContain('Future booked visits')
    expect($.text().trim()).toContain('8 January 2023 – 0 cancelled, 4 open and 3 closed')
  })
})


import { Prison } from '../@types/model-objects'

import {
  SessionCapacity,
  SessionSchedule, VisitSession,
} from '../data/visitSchedulerApiTypes'

import {
    HmppsAuthClient,
    RestClientBuilder,
    VisitSchedulerApiClient,
} from '../data'
import PrisonRegisterApiClient from "../data/prisonRegisterApiClient";
import UserService from "./userService";

export default class AdminService {

  private dayInMs = 24 * 60 * 60 * 1000
  private prisonsCache: Prison[]
  private lastUpdated = 0

  constructor(
      private readonly visitSchedulerApiClientBuilder: RestClientBuilder<VisitSchedulerApiClient>,
      private readonly prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient>,
      private readonly userService : UserService
  ) {}

  async getVisitSessions({
    username,
    offenderNo,
    prisonId,
  }: {
    username: string
    offenderNo: string
    prisonId: string
  }):  Promise<VisitSession[]> {
    const token = await this.userService.getToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientBuilder(token)
    const visitSessions = await visitSchedulerApiClient.getVisitSessions(offenderNo, prisonId)
    return visitSessions
  }

  async getSessionSchedule({
    username,
    prisonId,
    date,
  }: {
    username: string
    prisonId: string
    date: string
  }): Promise<SessionSchedule[]> {
    const token = await this.userService.getToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientBuilder(token)

    return visitSchedulerApiClient.getSessionSchedule(prisonId, date)
  }

  async getVisitSessionCapacity(
    username: string,
    prisonId: string,
    sessionDate: string,
    sessionStartTime: string,
    sessionEndTime: string,
  ): Promise<SessionCapacity> {
    const token = await this.userService.getToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientBuilder(token)
    return visitSchedulerApiClient.getVisitSessionCapacity(prisonId, sessionDate, sessionStartTime, sessionEndTime)
  }

  async getSupportedPrisons(username: string): Promise<Record<string, string>> {
    const prisons = await this.getPrisons(username)
    const supportedPrisonIds = await this.getSupportedPrisonIds(username)

    const supportedPrisons = {}

    supportedPrisonIds.forEach(prisonId => {
      const supportedPrison = prisons.find(prison => prison.prisonId === prisonId)
      if (supportedPrison) {
        supportedPrisons[supportedPrison.prisonId] = supportedPrison.prisonName
      }
    })

    return supportedPrisons
  }

  private async getSupportedPrisonIds(username: string): Promise<string[]> {
    const token = await this.userService.getToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientBuilder(token)
    return visitSchedulerApiClient.getSupportedPrisonIds()
  }

  private async getPrisons(username: string): Promise<Prison[]> {

    if (this.lastUpdated <= Date.now() - this.dayInMs) {
      let localPrisons = null
      const token = await this.userService.getToken(username)
      const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(token)
      localPrisons = (await prisonRegisterApiClient.getPrisons()).map(prison => {
        return { prisonId: prison.prisonId, prisonName: prison.prisonName }
      })
      this.lastUpdated = Date.now()
      this.prisonsCache = localPrisons
    }
    return this.prisonsCache
  }

}

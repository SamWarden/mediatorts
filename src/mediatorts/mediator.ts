import { Event } from "./interface/event"
import { EventHandler, Handler } from "./interface/handler"
import { Ioc } from "./interface/ioc"
import { Mediator } from "./interface/mediator"
import { Request } from "./interface/request"

export type RequestsMap = { [key: string]: any}
export type EventsMap = { [key: string]: any[]}


export class MediatorImpl implements Mediator {
  constructor(
    private readonly requestsMap: RequestsMap,
    private readonly eventsMap: EventsMap,
    private readonly ioc: Ioc,
  ) {}

  async send<R extends Request<Res>, Res>(request: R): Promise<Res> {
    const handlerType = this.requestsMap[request.constructor.name]
    if (!handlerType) {
      throw new Error(`Handler for request ${request.constructor.name} not found`)
    }
    return await this.ioc.provide(handlerType, async (handler: Handler<R, Res>) => {
      return await handler.handle(request)
    })
  }

  async publish(events: Event[]): Promise<void> {
    for (const event of events) {
      const handlersTypes = this.eventsMap[event.constructor.name]
      for (const handlerType of handlersTypes) {
        await this.ioc.provide(handlerType, async (handler: EventHandler<Event>) => {
          await handler.handle(event)
        })
      }
    }
  }
}

export class MediatorFactory {
  private readonly requestsMap: RequestsMap
  private readonly eventsMap: EventsMap

  constructor() {
    this.requestsMap = {}
    this.eventsMap = {}
  }

  registerRequest<
    Res,
    Req extends Request<Res>,
    ReqHandler extends Handler<Req, Res>,
    RequestType extends new(...args: any) => Req,
    HandlerType extends new(...args: any) => ReqHandler
  >(
    requestType: RequestType,
    handler: HandlerType,
  ): void {
    this.requestsMap[requestType.name] = handler
  }

  registerEvents<
    E extends Event,
    EHandler extends EventHandler<E>,
    EventType extends new(...args: any) => E,
    EHandlerType extends new(...args: any) => EHandler,
    >(
    eventType: EventType,
    handler: EHandlerType[],
  ): void {
    this.eventsMap[eventType.name] = handler
  }

  createMediator(ioc: Ioc): Mediator {
    return new MediatorImpl(this.requestsMap, this.eventsMap, ioc)
  }
}

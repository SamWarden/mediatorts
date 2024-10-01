# Mediatorts

A simple mediator to send requests and publish events


### Example

```ts
import {Handler, IocFactory, MediatorFactory, Request} from "@meamone/mediatorts"

class GetUserById implements Request<string> {
  constructor(
    public readonly userId: number,
  ) {}
}

class GetUserByIdHandler implements Handler<GetUserById, string> {
  constructor(
    private readonly users: {[key: number]: string},
  ) {}

  async handle(request: GetUserById): Promise<string> {
    return this.users[request.userId]
  }
}

async function main() {
  const iocFactory = new IocFactory()
  iocFactory.register(GetUserByIdHandler, async (ctx, callback) => callback(new GetUserByIdHandler({1: "Jack Bolt"})))
  const mediatorFactory = new MediatorFactory()
  mediatorFactory.registerRequest(GetUserById, GetUserByIdHandler)
  const result = await iocFactory.createIoc(async (ioc) => {
    const mediator = mediatorFactory.createMediator(ioc)
    const result = await mediator.send(new GetUserById(1))
    return result
  }, {})
  console.log("Result:", result)  // "Result: Jack Bolt"
}

main()
```

import { CallbackDependency, Class, DependenciesFactories, DependencyFactory, Ioc, IocContext } from "./interface/ioc"

export type IocCallback<Res> = (ioc: Ioc) => Promise<Res>

export class IocImpl implements Ioc {
  constructor(
    private readonly dependenciesFactories: DependenciesFactories,
    public readonly context: IocContext,
  ) {}

  async provide<Dependency>(cls: Class<Dependency>, callback: CallbackDependency<Dependency>): Promise<any> {
    const factory = this.dependenciesFactories.get(cls)
    if (factory === undefined) {
      throw TypeError(`Factory is undefined for this dependency: ${cls}`)
    }
    return await factory(this.context, callback)
  }
}

export class IocFactory {
  private readonly dependenciesFactories: DependenciesFactories

  constructor(
    private readonly singletoneContext: IocContext = {},
  ) {
    this.dependenciesFactories = new Map()
  }

  register<
    Dependency,
    DependencyType extends Class<Dependency>,
  >(cls: DependencyType, factory: DependencyFactory<Dependency>): void {
    this.dependenciesFactories.set(cls, factory)
  }

  async createIoc<Res>(callback: IocCallback<Res>, additionalContext: IocContext = {}): Promise<Res> {
    const context: IocContext = {
      ...this.singletoneContext,
      ...additionalContext,
    }
    const ioc = new IocImpl(this.dependenciesFactories, context)
    return await callback(ioc)
  }
}

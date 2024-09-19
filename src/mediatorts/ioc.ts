import { CallbackDependency, DependenciesFactories, DependencyFactory, Ioc, IocContext } from "./interface/ioc"

export type IocCallback<Res> = (ioc: Ioc) => Promise<Res>

export class IocImpl implements Ioc {
  constructor(
    private readonly dependenciesFactories: DependenciesFactories,
    public readonly context: IocContext,
  ) {}

  async provide<Dependency extends { name: string }>(cls: Dependency, callback: CallbackDependency<Dependency>): Promise<Dependency> {
    const factory: DependencyFactory<Dependency> = this.dependenciesFactories[cls.name]
    return await factory(this.context, callback)
  }
}

export class IocFactory {
  private readonly dependenciesFactories: DependenciesFactories

  constructor(
    private readonly singletoneContext: IocContext = {},
  ) {
    this.dependenciesFactories = {}
  }

  register<
    Dependency,
    DependencyType extends new(...args: any) => Dependency,
  >(cls: DependencyType, factory: DependencyFactory<Dependency>): void {
    this.dependenciesFactories[cls.name] = factory
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

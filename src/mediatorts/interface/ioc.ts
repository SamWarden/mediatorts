export type IocContext = { [key: string]: any }
export type CallbackDependency<Dependency> = (handler: Dependency) => Promise<any>
export type DependencyFactory<Dependency> = (context: IocContext, callback: CallbackDependency<Dependency>) => Promise<Dependency>
export type DependenciesFactories = { [key: string]: DependencyFactory<any> }

export interface Ioc {
  provide<Dependency extends { name: string }>(cls: Dependency, callback: CallbackDependency<Dependency>): Promise<Dependency>
}

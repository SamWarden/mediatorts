export type IocContext = { [key: string]: any }
export type CallbackDependency<Dependency> = (handler: Dependency) => Promise<any>
export type DependencyFactory<Dependency> = (context: IocContext, callback: CallbackDependency<Dependency>) => Promise<any>
export type Class<T> = new(...args: any[]) => T
export type DependenciesFactories = Map<Class<any>, DependencyFactory<any>>

export interface Ioc {
  provide<Dependency>(cls: Class<Dependency>, callback: CallbackDependency<Dependency>): Promise<any>
}

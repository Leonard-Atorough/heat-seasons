export class ServiceLocator {
  private services: Map<string, any> = new Map();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name) as T;
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  clear(): void {
    this.services.clear();
  }
}

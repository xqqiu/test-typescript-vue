# 依赖注入 (Dependency Injection, DI)
依赖注入是一种实现控制反转 (IoC) 的设计模式，它将对象的依赖关系从内部创建改为外部注入，从而提高代码的可测试性、可维护性和灵活性。

### 核心概念
1. **依赖 (Dependency)**: 一个对象需要的其他对象
2. **注入 (Injection)**: 通过构造函数、属性或方法提供依赖
3. **容器 (Container)**: 管理依赖创建和生命周期的组件
   
### TypeScript 实现方式
#### 1. 手动依赖注入
````typescript
    // 定义服务接口
    interface Logger {
        log(message: string): void;
    }

    // 具体实现
    class ConsoleLogger implements Logger {
        log(message: string): void {
            console.log(`[LOG] ${message}`);
        }
    }

    class FileLogger implements Logger {
        log(message: string): void {
            // 模拟写入文件
            console.log(`[FILE] ${message} (written to file)`);
        }
    }

    // 服务类
    class UserService {
        constructor(private logger: Logger) {}  // 依赖通过构造函数注入

        createUser(username: string) {
            this.logger.log(`Creating user: ${username}`);
            // 创建用户逻辑...
        }
    }

    // 手动注入依赖
    const logger = new ConsoleLogger();  // 可以轻松替换为 FileLogger
    const userService = new UserService(logger);

    userService.createUser("Alice");
````

#### 2. 使用 IoC 容器
````typescript
    // 简单的IoC容器实现
    class Container {
        private services: Map<string, any> = new Map();

        register(name: string, service: any): void {
            this.services.set(name, service);
        }

        resolve<T>(name: string): T {
            const service = this.services.get(name);
            if (!service) {
                throw new Error(`Service ${name} not found`);
            }
            return service;
        }
    }

    // 注册服务
    const container = new Container();
    container.register('logger', new ConsoleLogger());
    container.register('userService', new UserService(container.resolve<Logger>('logger')));

    // 使用服务
    const userService = container.resolve<UserService>('userService');
    userService.createUser("Bob");
````

#### 3. 基于装饰器的依赖注入
````typescript
    // 使用 reflect-metadata 支持装饰器元数据
    import 'reflect-metadata';

    // 服务标识符号
    const TYPES = {
        Logger: Symbol.for('Logger'),
        UserService: Symbol.for('UserService')
    };

    // 可注入装饰器
    function injectable() {
        return function(target: any) {
            Reflect.defineMetadata('injectable', true, target);
        };
    }

    // 注入装饰器
    function inject(token: symbol) {
        return function(target: any, key: string, index: number) {
            Reflect.defineMetadata(`inject_${index}`, token, target);
        };
    }

    // 装饰器版容器
    class DecoratorContainer {
        private instances: Map<symbol, any> = new Map();

        bind<T>(token: symbol, service: T): void {
            this.instances.set(token, service);
        }

        get<T>(token: symbol): T {
            const instance = this.instances.get(token);
            if (!instance) {
                throw new Error(`No binding for ${token.toString()}`);
            }
            return instance;
        }

        resolve<T>(target: any): T {
            // 检查是否可注入
            if (!Reflect.getMetadata('injectable', target)) {
                throw new Error('Target is not injectable');
            }

            // 获取构造函数参数
            const params: any[] = Reflect.getMetadata('design:paramtypes', target) || [];
            
            // 解析依赖
            const injections = params.map((_, index) => {
                const token = Reflect.getMetadata(`inject_${index}`, target);
                if (!token) {
                    throw new Error(`No injection token for parameter ${index}`);
                }
                return this.get(token);
            });

            // 创建实例
            return new target(...injections);
        }
    }

    // 使用装饰器
    @injectable()
    class DecoratedUserService {
        constructor(@inject(TYPES.Logger) private logger: Logger) {}

        createUser(username: string) {
            this.logger.log(`Decorated service creating user: ${username}`);
        }
    }

    // 配置容器
    const decoratorContainer = new DecoratorContainer();
    decoratorContainer.bind(TYPES.Logger, new FileLogger());

    // 解析服务
    const decoratedService = decoratorContainer.resolve<DecoratedUserService>(DecoratedUserService);
    decoratedService.createUser("Charlie");
````

### 依赖注入的优势
1. 松耦合: 类不直接创建依赖，而是接收它们
2. 可测试性: 可以轻松注入模拟对象进行单元测试
3. 可维护性: 依赖关系明确，易于重构
4. 可配置性: 可以在不修改代码的情况下更改实现
5. 生命周期管理: 容器可以管理对象的创建和销毁
   
### 实际应用建议
1. 选择合适的DI库:
    - 小型项目: 手动注入或简单容器
    - 大型项目: 使用成熟的DI库如 inversify 或 tsyringe
2. 设计原则:
    - 依赖于抽象(接口)，而不是具体实现
    - 保持构造函数简单，避免业务逻辑
    - 考虑使用单例作用域减少对象创建开销
3. 最佳实践:
````typescript
    // 推荐 - 基于接口编程
    interface IUserRepository {
        save(user: User): void;
    }

    class UserService {
        constructor(private repo: IUserRepository) {}
    }

    // 不推荐 - 依赖具体实现
    class UserService {
        constructor(private repo: MySQLUserRepository) {}  // 紧耦合
    }
````
### 与中介者模式、事件驱动架构的比较
| 特性     | 事件驱动架构       | 中介者模式               | 中介者模式          |
| -------- | ------------------ | ------------------------ | ------------------- |
| 主要目的 | 管理对象依赖关系   | 集中控制组件交互         | 异步事件处理        |
| 通信方向 | 单向(注入依赖)     | 双向(通过中介者)         | 单向(事件发布/订阅) |
| 耦合度   | 低(接口耦合)       | 中(知道中介者)           | 极低(不知道消费者)  |
| 典型应用 | 服务层、数据访问层 | UI组件交互、复杂业务流程 | 微服务、实时系统    |
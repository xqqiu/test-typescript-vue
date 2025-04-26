import type { Component as VueComponent } from "vue"

interface Component {
    name: string;
}

type THelloWorld = string
type Num = number
type Bool = boolean
type Null = null
type Undefined = undefined
type name = string
type age = number

type UserType = {
    name: name,
    age: age
}

type User = UserType | string | number | boolean | null | undefined

type MyFunction = (a: THelloWorld, b: Num) => User

type someNoReturn = (a: THelloWorld, b: Num) => void

type LockState = "locked" | "unlocked" | "unknown"


type StringArray = Array<string>

// 从对象的角度来说 我们为什么要定义接口？
// 因为接口就是一个对象的类型定义，它可以帮助我们更好地理解和使用对象。
interface Backpack<Type> {
    add: (obj: Type) => void
    get: () => Type
}

// 面向对象编程（Object-Oriented Programming）
// 面向对象编程是一种编程范式，它使用“对象”来表示数据和操作。

// 对象是什么？
// 对象是包含数据和方法的实例，可以通过类来创建。
// 对象可以包含属性（数据）和方法（操作），可以通过对象来访问和操作数据。

// 为什么要定义对象？
// 如果说函数是面向过程编程的基本单位，那么对象就是面向对象编程的基本单位。可以说，面向对象编程就是将数据和操作封装在一起的过程。


// 为什么使用面向对象编程？
// 1. 代码复用性：可以通过继承和组合来复用代码，减少重复代码的编写。
// 2. 可维护性：通过将数据和操作封装在一起，代码更易于理解和维护。
// 3. 可扩展性：可以通过添加新的类和方法来扩展功能，而不需要修改现有代码。
// 4. 抽象：可以通过抽象类和接口来定义通用的行为和属性，从而提高代码的灵活性。
// 5. 封装：可以将数据和操作封装在一起，从而提高代码的安全性和可读性。
// 6. 多态：可以通过方法重载和方法覆盖来实现多态，从而提高代码的灵活性和可读性。


// 什么是封装
// 封装是将数据和操作封装在一起的过程，可以通过类来实现。
// 封装的好处：
// 1. 数据隐藏：可以将数据隐藏在类内部，从而提高数据的安全性。
// 2. 数据完整性：可以通过 getter 和 setter 方法来保护数据，从而提高数据的完整性。
class BankAccount {
    // protected 属性可以在子类中访问，但不能在类外部访问。
    // private 属性只能在类内部访问，不能在子类中访问，也不能在类外部访问。
    protected _balance: number = 0

    constructor(initialBalance: number) {
        this._balance = initialBalance
    }

    public deposit(amount: number): void {
        if (amount > 0) {
            this._balance += amount
        } else {
            console.log("Deposit amount must be positive.")
        }
    }

    // Getter 方法:
    public get Balance(): number {
        return this._balance
    }
}

const account = new BankAccount(1000)
account.deposit(500)
account.Balance // 1500

// 子类可以访问父类的 protected 属性和方法，但不能访问 private 属性和方法。
// 子类可以重写父类的方法，但不能重写父类的属性。
// 子类可以使用 super 关键字来调用父类的方法和属性。
// 子类可以使用 this 关键字来访问自己的属性和方法。
class BankAccount2 extends BankAccount {
    constructor(initialBalance: number) {
        super(initialBalance)
    }
    public withdraw(amount: number): void {
        if (amount > 0 && amount <= this.Balance) {
            this._balance -= amount
        } else {
            console.log("Withdraw amount must be positive and less than balance.")
        }
    }
}
const account2 = new BankAccount2(1000)
account2.deposit(500)
account2.withdraw(200)
account2.Balance // 1300

// 多态 （Polymorphism）
// 多态是指同一操作作用于不同的对象，可以产生不同的结果。
// 多态的好处：
// 1. 提高代码的灵活性和可读性。
class shape {
    // 构造函数参数前的 public 修饰符会自动创建并初始化同名属性
    constructor(public x: number, public y: number) { }
    public getArea(): number {
        return this.x * this.y
    }
    // abstract getArea(): number // 抽象方法，子类必须实现
}
class Circle extends shape {
    constructor(public radius: number) {
        super(radius, radius)
    }
    public getArea(): number {
        return Math.PI * this.radius * this.radius
    }
}
class Square extends shape {
    constructor(public side: number) {
        super(side, side)
    }
    public getArea(): number {
        return this.x * this.y
    }
}

const circle = new Circle(5)
const square = new Square(5)
console.log(circle.getArea()) // 78.53981633974483
console.log(square.getArea()) // 25



// 抽象类
// 抽象类是不能被实例化的类，它只能被继承。
// 抽象类可以包含抽象方法和非抽象方法。
// 抽象方法是没有实现的方法，它只能在抽象类中定义，不能在子类中实现。
// 抽象方法必须在子类中实现。

// 什么是抽象？
//  - 简化复杂性的工具：隐藏不必要的细节，只展示关键特征
//  - 契约与实现分离：定义"做什么"而不指定"如何做"
//  - 多态的基础：允许不同实现遵循相同接口

// 为什么使用抽象？
//  - 降低系统复杂度
//  - 提高代码可维护性
//  - 增强模块间的独立性
//  - 方便团队协作开发

// 避免过度抽象
//  - 只在确实需要变体时才创建抽象
//  - "你需要的抽象比你想象的少" - Kevlin Henney
abstract class Department {
    protected constructor(public name: string) { } // 防止直接实例化但允许继承
    abstract printName(): void // 抽象方法，子类必须实现
    printMeeting(): void {
        console.log(`Department Name: ${this.name}`)
    }
}

class AccountmentsDepartment extends Department {
    constructor() {
        super("Accountments")
    }
    printName(): void {
        console.log("Accountments Department")
    }
}
class ITDepartment extends Department {
    constructor() {
        super("IT")
    }
    printName(): void {
        console.log("IT Department")
    }
}

const accountments = new AccountmentsDepartment()
const it = new ITDepartment()
accountments.printName() // Accountments Department
it.printName() // IT Department



// 五大设计原则
// 1. 单一职责原则（Single Responsibility Principle）
//   - 每个类应该只有一个职责，即一个类应该只有一个原因引起变化。
//   - 也就是说，一个类应该只负责一个功能或任务，避免将多个功能或任务混合在一起。
// 2. 开放封闭原则（Open/Closed Principle）
//   - 软件实体（类、模块、函数等）应该对扩展开放，对修改关闭。
//   - 也就是说，软件实体应该可以通过添加新代码来扩展功能，而不需要修改现有代码。
// 3. 里氏替换原则（Liskov Substitution Principle）
//   - 子类对象应该可以替换父类对象，并且程序的行为不变。
//   - 也就是说，子类应该可以替换父类，并且程序的行为不变。
// 4. 接口隔离原则（Interface Segregation Principle）
//   - 不应该强迫一个类依赖于它不需要的接口。
//   - 也就是说，一个类应该只依赖于它需要的接口，而不是依赖于不需要的接口。
// 5. 依赖倒置原则（Dependency Inversion Principle）
//   - 高层模块不应该依赖于低层模块，二者都应该依赖于抽象。
//   - 也就是说，高层模块应该依赖于抽象，而不是依赖于具体实现。

// 组合优于继承
// 特性                 接口实现 (组合)                     抽象类实现 (继承)
// 耦合度	            低耦合，仅依赖契约	                较高耦合，绑定类层次结构
// 灵活性	            策略类可自由实现多个接口	        受限于单继承，不能同时继承其他类
// 代码复用	            无复用，需各自实现全部方法	         可在抽象类中提供部分实现
// 扩展性	            容易添加新策略	                    添加新策略需要继承抽象类
// 测试便利性	        容易mock接口	                    需要mock或创建测试子类

// 组合表达的是"使用"关系，继承表达的是"是"关系
// 组合能创造更加灵活的代码结构，允许在运行时动态地改变对象的行为
// 继承则提供了一种更强的代码复用机制，但可能导致更高的耦合度和更复杂的类层次结构 

// 优先使用组合的场景
// 1. "has-a"（拥有）关系时
// 2. 需要运行时动态改变行为
// 3. 共享多个来源的能力时
// 4. 避免层次过深的继承链

// 优先使用继承的场景
// 1. "is-a"（是）关系且行为需要多态时
// 2. 需要完全继承并扩展基类行为
// 3. 框架需要明确类层次结构时

// 使用组合构建灵活的游戏对象
class GameObject {
    private components: Map<string, Component> = new Map();

    addComponent(component: Component) {
        this.components.set(component.name, component);
    }

    getComponent<T extends Component>(name: string): T | undefined {
        return this.components.get(name) as T;
    }
}

class RenderComponent implements Component {
    name: string = "RenderComponent";
}
class PhysicsComponent implements Component {
    name: string = "PhysicsComponent";
}

const player = new GameObject();
player.addComponent(new PhysicsComponent());
player.addComponent(new RenderComponent());


/************************************************************************************************************ */
// 耦合是指软件系统中各个模块/组件之间的依赖关系程度，是衡量代码质量的重要指标。

// 紧耦合（高耦合）
// 更换数据库需要修改 UserService 代码
class MySQLDatabaseCoupling {
    save(data: string) {
        console.log(`Saving ${data} to MySQL`);
    }
}
class UserServiceCoupling {
    private db: MySQLDatabaseCoupling = new MySQLDatabaseCoupling(); // 直接依赖具体实现

    createUser(name: string) {
        this.db.save(name); // 紧密绑定MySQL实现
    }
}

// 松耦合（低耦合）
interface DatabaseLow {
    save(data: string): void;
}
class MySQLDatabaseCouplingLow implements DatabaseLow {
    save(data: string) {
        console.log(`Saving ${data} to MySQL`);
    }
}
class UserServiceCouplingLow {
    constructor(private db: DatabaseLow) { } // 依赖抽象接口

    createUser(name: string) {
        this.db.save(name); // 不关心具体实现
    }
}
// 轻松替换为其他Database实现
const userService = new UserServiceCouplingLow(new MySQLDatabaseCouplingLow());

// 解耦技术
// 1. 依赖注入（Dependency Injection）

// 定义接口（抽象）
interface Logger {
    log(message: string): void;
}
// 具体实现
class ConsoleLogger implements Logger {
    log(message: string) {
        console.log(message);
    }
}
// 通过构造函数注入依赖
class UserServiceDI {
    constructor(private logger: Logger) { }

    createUser(name: string) {
        this.logger.log(`User created: ${name}`);
        // 创建用户逻辑
    }
}
// 使用
new UserServiceDI(new ConsoleLogger());


// 容器管理
class Container {
    private services = new Map<string, any>();

    register(key: string, instance: any) {
        this.services.set(key, instance);
    }

    resolve<T>(key: string): T {
        return this.services.get(key);
    }
}
// 配置容器
const container = new Container();
container.register('logger', new ConsoleLogger());
// 自动解析依赖
class ProductService {
    constructor(private logger = container.resolve<Logger>('logger')) { }
}


// 2. 面向接口编程（Interface Segregation Principle）

interface DataStorage {
    save(data: string): boolean;
    retrieve(id: string): string | null;
}
// 不同实现
class LocalStorage implements DataStorage {
    save(data: string): boolean {
        /*...*/
        return true;
    }
    retrieve(id: string): string | null {
        // Example implementation: return null if not found
        return null;
    }
}
class DatabaseStorage implements DataStorage {
    save(data: string): boolean {
        /*...*/
        return true;
    }
    retrieve(id: string): string | null {
        // Example implementation: return null if not found
        return null;
    }
}
// 业务逻辑只依赖接口
class DataProcessor {
    constructor(private storage: DataStorage) { }

    process(data: string) {
        this.storage.save(data);
    }
}

// 3. 事件驱动架构（Event-Driven Architecture）

type EventHandler = (payload?: any) => void;

class EventBus {
    private handlers = new Map<string, EventHandler[]>();

    on(event: string, handler: EventHandler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }

    emit(event: string, payload?: any) {
        this.handlers.get(event)?.forEach(handler => handler(payload));
    }
}

// 使用
const bus = new EventBus();

// 组件A
bus.on('user.created', (user) => {
    console.log('Send welcome email to', user.email);
});

// 组件B
class UserServiceEDA {
    constructor(private eventBus: EventBus) { }
    createUser(user: User) {
        // 创建用户逻辑
        this.eventBus.emit('user.created', user);
    }
}


// 4. 中介者模式（Mediator Pattern）

class Mediator {
    private components = new Map<string, ComponentMP>();

    register(name: string, component: ComponentMP) {
        this.components.set(name, component);
        component.setMediator(this);
    }

    notify(sender: string, event: string, data?: any) {
        // 根据业务规则路由消息
        this.components.forEach((component, name) => {
            if (name !== sender) {
                component.receive(event, data);
            }
        });
    }
}

abstract class ComponentMP {
    constructor(protected mediator?: Mediator) { }

    setMediator(mediator: Mediator) {
        this.mediator = mediator;
    }

    abstract notify(event: string, data?: any): void;
    abstract receive(event: string, data?: any): void;

    // Add handleData method with a default implementation
    handleData?(data?: any): void {
        console.log("Default handleData implementation", data);
    }
}


// 5.观察者模式（Observer Pattern）
interface Observer {
    update(data: any): void;
}

class Subject {
    private observers: Observer[] = [];

    addObserver(observer: Observer) {
        this.observers.push(observer);
    }

    notifyAll(data: any) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class LogObserver implements Observer {
    update(data: any) {
        console.log('Logging:', data);
    }
}

// 使用
const subject = new Subject();
subject.addObserver(new LogObserver());
subject.notifyAll({ event: 'system_start' });


// 6. 适配器模式（Adapter Pattern）

// 旧系统接口
class LegacyAPI {
    fetchData() {
        return { old: 'format' };
    }
}
// 新系统期望的接口
interface ModernAPI {
    getData(): { new: 'format' };
}
// 适配器
class LegacyAdapter implements ModernAPI {
    constructor(private legacy: LegacyAPI) { }
    getData() {
        const data = this.legacy.fetchData();
        // 例如：将旧格式转换为新格式
        return { new: "format" as const, ...data };
    }
}

// 使用
const modernAPI: ModernAPI = new LegacyAdapter(new LegacyAPI());


// 7. 模块化设计（Modular Design）

// service.ts
export interface UserServiceMD {
    getUser(id: string): Promise<User>;
}

// logger.ts
export interface LoggerMD {
    log(message: string): void;
}

// 主模块通过导入使用
// import type { UserService } from './service';
// import type { Logger } from './logger';

class App {
    constructor(
        private userService: UserServiceMD,
        private logger: LoggerMD
    ) { }
}
/************************************************************************************************************ */


// 前端应该使用interface规范化数据交互 使用type定义数据类型

abstract class TestAbstractClass {
    constructor(private dbName: string) { }
    abstract save(a: string): void
}

// 定义了一个接口 Database，表示一个数据库的操作
interface Database {
    dbName: string // 属性定义在接口中
    save: (data: string) => void
}

interface Database2 {
    delete: (data: string) => void
}

// 定义了一个数据库的实现类 MySQLDatabase，表示一个 MySQL 数据库的操作
// 实现了 Database 接口的 save 方法
class MySQLDatabase implements Database {
    dbName: string = "MySQL" // 属性定义在类中
    save(data: string): void {
        console.log(`Saving data to MySQL: ${data}`)
    }
}

// 定义了一个用户服务类 UserService，表示一个用户服务的操作
class UserService {
    constructor(private db: Database) { } // 依赖注入
    saveUser(user: string): void {
        this.db.save(user)
    }
}

// 创建一个 UserService 实例
new UserService(new MySQLDatabase())



/**
 *
 *
 * @param {*} a
 * @param {*} b
 * @return {*} 
 */
const myFunction: MyFunction = (a, b) => {
    const user: UserType = {
        name: a,
        age: b
    }
    // const lock: LockState = "locked" as const
    const lock: LockState = "locked"

    return user
}

// console.log(myFunction(obj, 123)) 

export type { MyFunction, Backpack, THelloWorld, Num, Null, name, Undefined, age, UserType, User, Bool, LockState, StringArray, someNoReturn }
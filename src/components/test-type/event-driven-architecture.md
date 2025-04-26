# 事件驱动架构 (Event-Driven Architecture, EDA)
事件驱动架构是一种以事件的产生、检测、消费和响应为核心的软件架构模式，它通过事件的异步传递来实现系统组件间的松耦合交互。

### 核心概念
#### 1. 基本组件
- **事件生产者 (Event Producer/Publisher)**: 产生事件的组件
- **事件消费者 (Event Consumer/Subscriber)**: 处理事件的组件
- **事件通道 (Event Channel)**: 事件传输的媒介
- **事件处理器 (Event Processor)**: 负责路由和处理事件

#### 2. 事件类型
- **简单事件**: 表示状态变化的通知
- **复杂事件**: 由多个简单事件组合或推导得出


### TypeScript 实现示例
#### 1. 基本事件总线实现
````typescript
    // 定义事件类型
    type EventHandler = (payload: any) => void
    class EventBus {
        private events: Map<string, EventHandler[]> = new Map();
        // 订阅事件
        subscribe(eventName: string, handler: EventHandler): void {
            const handlers = this.events.get(eventName) || [];
            handlers.push(handler);
            this.events.set(eventName, handlers)
        }
        // 发布事件
        publish(eventName: string, payload: any): void {
            const handlers = this.events.get(eventName);
            if(handlers) {
                handlers.forEach(handler => {
                    try{
                        handler(payload);
                    }catch(error) {
                        console.error(`Error handling event ${eventName}:`, error);
                    }
                })
            }
        }
    }
````

#### 2. 使用示例
````typescript
    // 创建事件总线实例
    const eventbus = new EventBus()
    // 用户服务 - 事件生产者
    class UserService {
        constructor(private eventbus: EventBus){}
        registerUser(userName: string): void {
            console.log(`Registering user: ${username}`);
            // 用户注册后发布事件
            eventbus.publish('user.registered', {
                userName,
                timestamp: new Date()
            })
        }
    }
    // 邮件服务 - 事件消费者
    class EmailService {
        constructor(private eventbus: EventBus) {
            this.eventbus.subscribe('user.registered', this.sendWelcomeEmail);
        }
        private sendWelcomeEmail(payload: {userName: string}): void {
            console.log(`Sending welcome email to: ${payload.username}`);
        }
    }
    // 分析服务 - 事件消费者
    class AnalyticsService {
        constructor(private eventbus: EventBus) {
            this.eventBus.subscribe('user.registered', this.trackRegistration);
        }

        private trackRegistration(payload: { username: string, timestamp: Date }) {
            console.log(`Tracking registration for: ${payload.username} at ${payload.timestamp}`);
        }
    }
    // 初始化服务
    const emailService = new EmailService(eventbus);
    const analyticsService = new AnalyticsService(eventbus);
    const userService = new UserService(eventbus);

    // 触发事件
    userService.registerUser("Alice");
````

#### 输出结果:
````
    Registering user: Alice
    Sending welcome email to: Alice
    Tracking registration for: Alice at [当前时间戳]
````

### 高级模式实现
#### 1. 支持通配符的事件总线
````typescript
    class AdvancedEventBus extends EventBus {
        publish(eventName: string, payload?: any): void {
            super.publish(eventName, payload);
            
            // 支持通配符订阅
            const wildcardHandlers = this.events.get('*');
            if (wildcardHandlers) {
                wildcardHandlers.forEach(handler => {
                    try {
                        handler({ eventName, payload });
                    } catch (error) {
                        console.error(`Error handling wildcard event:`, error);
                    }
                });
            }
        }
    }
````
#### 2. 使用高级事件总线
````typescript
    const advancedBus = new AdvancedEventBus();

    // 日志服务 - 监听所有事件
    class LoggingService {
        constructor(eventbus: EventBus) {
            this.eventbus.subscribe('*', this.logAllEvents);
        }

        private logAllEvents(event: { eventName: string, payload?: any }) {
            console.log(`[LOG] Event "${event.eventName}" occurred with payload:`, event.payload);
        }
    }

    const loggingService = new LoggingService(advancedBus);
    advancedBus.publish('test.event', { data: 'some data' });
````
### 事件驱动架构的优势
1. **松耦合**: 生产者和消费者不需要知道彼此的存在
2. **可扩展性**: 容易添加新的事件消费者而不影响现有系统
3. **响应性**: 系统可以实时响应事件
4. **弹性**: 组件故障不会导致整个系统崩溃
5. **可追溯性**: 事件日志可以用于审计和重放

### 常见应用场景
1. **微服务通信**: 服务间通过事件进行异步通信
2. **实时数据处理**: 如股票行情分析、IoT数据处理
3. **用户界面交互:**: 前端组件间的事件通信
4. **工作流系统**: 业务流程的状态转换
5. **变更数据捕获**: 数据库变更通知  

### 与中介者模式的比较
| 特性     | 事件驱动架构             | 中介者模式           |
| -------- | ------------------------ | -------------------- |
| 通信方式 | 异步，通过事件           | 同步，通过方法调用   |
| 耦合度   | 极低(生产者不知道消费者) | 较低(同事知道中介者) |
| 复杂性   | 较高(需要事件基础设施)   | 较低                 |
| 适用规模 | 大型分布式系统           | 单个应用内的组件交互 |
| 典型实现 | 消息队列、事件总线       | 中心协调类           |

### 实际项目建议
1. **选择合适的事件总线**:
   - 小型应用: 使用内存事件总线(如上面的示例)
   - 大型应用: 考虑专业的消息系统(RabbitMQ, Kafka等)
2. **事件设计原则**:
   - 事件应该表示"某事已发生"，而不是"请做某事"
   - 保持事件小而专注
   - 使用明确的事件命名规范
3. **错误处理**:
   - 实现死信队列处理失败事件
   - 考虑事件重试机制
   - 添加全面的日志记录
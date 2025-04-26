# 中介者模式 (Mediator Pattern)   
中介者模式是一种行为设计模式，它通过引入一个中介者对象来减少对象之间的直接通信依赖，使对象间通信通过中介者进行，从而降低耦合度。   
### 基本概念
- **Mediator (中介者)**: 定义对象间通信的接口
- **ConcreteMediator (具体中介者)**: 实现中介者接口，协调各对象间的交互
- **Colleague (同事类)**: 知道其中介者对象，与其他同事对象通信时通过中介者转发
### 适用场景
- 当对象间存在复杂的网状引用关系时
- 当需要集中控制多个对象间的交互时
- 当系统组件间通信过于复杂，难以理解和管理时
  
### TypeScript 实现示例
#### 1. 定义中介者接口
````typescript
    // 中介者接口 - 聊天室
    interface ChatRoomMediator {
        showMessage(user: User, message: string): void;
    }
````

#### 2. 实现具体中介者
````typescript
    // 具体中介者 - 实现聊天室
    class ChatRoom implements ChatRoomMediator {
        showMessage(user: User, message: string): void {
            const time = new Date().toLocaleTimeString();
            const sender = user.getName();
            
            console.log(`[${time}] ${sender}: ${message}`);
        }
    }
````

#### 3. 定义基础同事类
````typescript
    // 同事类 - 用户
    class User {
        constructor(
            private name: string,
            private chatMediator: ChatRoomMediator
        ) {}

        getName(): string {
            return this.name;
        }

        send(message: string): void {
            this.chatMediator.showMessage(this, message);
        }
    }
````

#### 5. 客户端使用
````typescript
    // 创建中介者（聊天室）
    const chatRoom = new ChatRoom();

    // 创建用户并关联到同一个聊天室
    const user1 = new User("Alice", chatRoom);
    const user2 = new User("Bob", chatRoom);
    const user3 = new User("Charlie", chatRoom);

    // 用户发送消息（通过聊天室中介）
    user1.send("Hi everyone!");
    user2.send("Hey Alice!");
    user3.send("What's up?");
````   
#### 输出示例
````
    [10:30:25 AM] Alice: Hi everyone!
    [10:30:26 AM] Bob: Hey Alice!
    [10:30:27 AM] Charlie: What's up?
````

### 更复杂的聊天室扩展
````typescript
    // 增强版聊天室中介者
    class AdvancedChatRoom implements ChatRoomMediator {
        private users: User[] = [];

        addUser(user: User): void {
            this.users.push(user);
        }

        showMessage(user: User, message: string): void {
            const time = new Date().toLocaleTimeString();
            const sender = user.getName();
            
            // 广播给所有用户
            this.users.forEach(u => {
                if (u !== user) {  // 不发送给自己
                    console.log(`[${time}] ${sender} to ${u.getName()}: ${message}`);
                }
            });
        }

        // 新增私聊功能
        privateMessage(sender: User, receiverName: string, message: string): void {
            const receiver = this.users.find(u => u.getName() === receiverName);
            if (receiver) {
                const time = new Date().toLocaleTimeString();
                console.log(`[${time}] [Private] ${sender.getName()} to ${receiverName}: ${message}`);
            }
        }
    }

    // 增强版用户类
    class AdvancedUser extends User {
        constructor(
            name: string,
            private advancedChatMediator: AdvancedChatRoom
        ) {
            super(name, advancedChatMediator);
        }

        sendPrivate(receiverName: string, message: string): void {
            (this.advancedChatMediator as AdvancedChatRoom).privateMessage(this, receiverName, message);
        }
    }

    // 使用增强版聊天室
    const advancedChat = new AdvancedChatRoom();

    const alice = new AdvancedUser("Alice", advancedChat);
    const bob = new AdvancedUser("Bob", advancedChat);
    const charlie = new AdvancedUser("Charlie", advancedChat);

    advancedChat.addUser(alice);
    advancedChat.addUser(bob);
    advancedChat.addUser(charlie);

    alice.send("Hello everyone!");
    bob.sendPrivate("Alice", "This is a secret message");
    charlie.send("Can everyone see this?");
````

#### 增强版输出示例
````
    [11:15:32 AM] Alice to Bob: Hello everyone!
    [11:15:32 AM] Alice to Charlie: Hello everyone!
    [11:15:33 AM] [Private] Bob to Alice: This is a secret message
    [11:15:34 AM] Charlie to Alice: Can everyone see this?
    [11:15:34 AM] Charlie to Bob: Can everyone see this?
````
#### 没有中介者模式的情况：
````typescript
    // 用户直接相互引用
    class UserWithoutMediator {
        constructor(private name: string) {}

        sendTo(receiver: UserWithoutMediator, message: string) {
            console.log(`${this.name} to ${receiver.name}: ${message}`);
        }
    }

    // 使用时需要维护所有引用
    const alice = new UserWithoutMediator("Alice");
    const bob = new UserWithoutMediator("Bob");

    alice.sendTo(bob, "Hello");
    bob.sendTo(alice, "Hi there");
````

### 优点
1. **减少类间依赖**：将网状依赖变为星状依赖，降低耦合
2. **集中控制交互**：将对象间交互逻辑集中在中介者中
3. **简化对象协议**：用一对多的中介者交互替代多对多的同事交互

### 缺点
1. **中介者可能变得复杂**：随着交互逻辑增加，中介者可能变得臃肿
2. **性能考虑**：所有通信都通过中介者，可能影响性能

### 实际应用场景
- 聊天室应用（用户不直接通信，通过聊天室中介）
- GUI组件交互（按钮、输入框等通过对话框中介交互）
- 航空交通管制系统（飞机通过塔台中介通信）


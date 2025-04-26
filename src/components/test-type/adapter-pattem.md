# 适配器模式（Adapter Pattern）
配器模式（Adapter Pattern）是一种结构型设计模式，它允许不兼容接口的对象之间进行协作。

适配器模式就像现实世界中的电源适配器，让不同规格的插头能够插入插座。它主要解决以下问题：  
1. 接口不匹配：当现有类的接口不符合需求时  
2. 复用旧代码：需要复用一些已经存在的类，但其接口与新系统不兼容  
3. 统一接口：需要为多个具有不同接口的类似类提供统一接口  

#### 1. 类适配器（通过继承）

````typescript
    // 旧的不兼容类
    class LegacyPrinter {
        printText(text: string): void {
            console.log(`Legacy Printing: ${text}`);
        }
    }
    // 新系统期望的接口
    interface Printer {
        print(content: string): void;
    }
    // 适配器类（继承旧类，实现新接口）
    class PrinterAdapter extends LegacyPrinter implements Printer {
        print(content: string): void {
            // 调用旧方法，并转换参数
            this.printText(content.toUpperCase());
        }
    }
    // 使用
    const printer: Printer = new PrinterAdapter();
    printer.print("Hello Adapter"); // 输出: LEGACY PRINTING: HELLO ADAPTER
````

#### 2. 对象适配器（通过组合，更推荐）

````typescript
    // 旧的不兼容类
    class LegacyPayment {
        makePayment(amount: number): string {
            return `Processed legacy payment of $${amount}`;
        }
    }
    // 新系统期望的接口
    interface PaymentProcessor {
        process(amount: number): { status: string; amount: number };
    }
    // 适配器类（组合旧类，实现新接口）
    class PaymentAdapter implements PaymentProcessor {
        constructor(private legacyPayment: LegacyPayment) { }
        process(amount: number): { status: string; amount: number; } {
            // 转换接口调用旧方法
            const result = this.legacyPayment.makePayment(amount);
            // 解析旧方法的返回值并转换为新接口的格式
            return { status: "success", amount: amount };
        }

    }
    // 使用
    const legacy = new LegacyPayment();
    const processor: PaymentProcessor = new PaymentAdapter(legacy);
    console.log(processor.process(100));
````

### TypeScript实现方式

#### 1. 接口适配器（Interface Adapter）

````typescript
    type ComplexData = {
        id: string;
        name: string;
        details: {
            description: string;
            createdAt: Date;
        };
    }
    type Data = {
        id: string;
        name: string;
    }
    // 第三方库的复杂接口
    interface ThirdPartyService {
        fetchData(options: {
            id: string;
            filter?: boolean;
            page?: number;
        }): Promise<ComplexData>;
    }
    // 我们需要的简单接口
    interface SimpleService {
        getById(id: string): Promise<Data>;
    }
    // 适配器实现
    class ServiceAdapter implements SimpleService {
        constructor(private service: ThirdPartyService) { }

        async getById(id: string): Promise<Data> {
            const data = await this.service.fetchData({ id });
            return this.transformData(data);
        }

        private transformData(data: ComplexData): Data {
            // 数据转换逻辑
            return {
                id: data.id,
                name: data.name,
            };
        }
    }
    class MockService implements ThirdPartyService {
        async fetchData(options: { id: string; filter?: boolean; page?: number; }): Promise<ComplexData> {
            return {
                id: options.id,
                name: "Mock Name",
                details: {
                    description: "Mock Description",
                    createdAt: new Date(),
                },
            };
        }
    }
    const serviceAdapter = new ServiceAdapter(new MockService());
    serviceAdapter.getById("123").then(data => {
        console.log(data); // { id: '123', name: 'Mock Name' }
    });
````

#### 2. 函数适配器（Function Adapter）
````typescript
    // 旧的回调风格函数
    function legacyFetch(url: string, callback: (err: Error | null, data?: string) => void) {
        // ...
    }
    // 适配为Promise风格
    function promisifyLegacyFetch(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            legacyFetch(url, (err, data) => {
                if (err) reject(err);
                else resolve(data!);
            });
        });
    }
    // 使用
    async function modernCode() {
        try {
            const data = await promisifyLegacyFetch("https://example.com");
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    }
````

### 实际应用场景
#### 1. 适配器模式在前端开发中常用于处理不同版本的API，尤其是在与后端服务交互时。
````typescript
    // 旧API响应格式
    interface LegacyApiResponse {
        success: boolean;
        payload: any;
        timestamp: number;
    }
    // 新API期望格式
    interface StandardApiResponse<T> {
        data: T;
        meta: {
            isOk: boolean;
            requestedAt: string;
        };
    }
    // 适配器实现 转换数据结构
    class ApiResponseAdapter<T> {
        static adaptLegacy<T>(legacy: LegacyApiResponse): StandardApiResponse<T> {
            return {
                data: legacy.payload as T,
                meta: {
                    isOk: legacy.success,
                    requestedAt: new Date(legacy.timestamp).toISOString()
                }
            };
        }
    }
````

#### 2. UI组件适配
````typescript
    // 设计系统的新Button组件props
    interface NewButtonProps {
        variant: 'primary' | 'secondary';
        onClick?: () => void;
        children: ReactNode;
    }

    // 旧Button组件的props
    interface OldButtonProps {
        type: 'submit' | 'button';
        handleClick?: () => void;
        text: string;
    }

    class ButtonAdapter extends React.Component<NewButtonProps> {
        render() {
            const { variant, onClick, children } = this.props;

            const oldProps: OldButtonProps = {
                type: variant === 'primary' ? 'submit' : 'button',
                handleClick: onClick,
                text: children.toString()
            };

            return <OldButton { ...oldProps } />;
        }
    }
````


### 最佳实践
1. 优先使用对象适配器（组合而非继承）：
   \- 更灵活，可以适配多个不同的类 
   \- 避免多重继承的复杂性
2. 保持适配器的职责单一：
   \- 适配器只负责转换接口，不应包含业务逻辑
   \- 一个适配器只处理一个特定接口的转换
3. 考虑双向适配器：
   \- 如果需要在两个不同的接口之间进行转换，可以考虑实现双向适配器
4. 命名清晰：
   \- 使用Adapter后缀，如PaymentGatewayAdapter
5. TypeScript类型增强：
   \- 使用泛型增强适配器灵活性
````typescript
    interface Adapter<T, U> {
        adapt(input: T): U;
    }
````


# 观察者模式（Observer Pattern）  
观察者模式是一种行为设计模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。当主题对象状态发生变化时，它会通知所有观察者对象，使它们能够自动更新自己。   
### 核心概念   
1. **Subject（主题）**: 也称为被观察者或可观察对象，它维护一组观察者，提供添加和删除观察者的方法，以及通知观察者的方法。    
2. **Observer（观察者）**: 为所有具体观察者定义一个接口，在得到主题通知时更新自己。   
3. **ConcreteSubject（具体主题）**: 存储对观察者对象来说有意义的状态，当状态改变时向观察者发出通知。    
4. **ConcreteObserver（具体观察者）**: 实现观察者接口，维护一个指向具体主题的引用，存储与主题状态一致的状态，实现更新接口以使自身状态与主题状态保持一致。    

### 实现方式
#### 1. 推模型（Push Model）
主题将详细的变化信息推送给观察者，无论观察者是否需要。   
#### 2. 拉模型（Pull Model）
主题只通知观察者状态已改变，观察者根据需要从主题中拉取所需信息。   

### 基本实现
#### 1. 定义接口
````typescript
    // 观察者接口
    interface Observer {
        update(data: any): void;
    }

    // 主题接口
    interface Subject {
        registerObserver(observer: Observer): void;
        removeObserver(observer: Observer): void;
        notifyObservers(): void;
    }
````

#### 2. 实现具体主题
````typescript
    class ConcreteSubject implements Subject {
        // 观察者数组
        private observers: Observer[] = [];
        private state: any;
        public registerObserver(observer: Observer): void {
            this.observers.push(observer)
        }
        public removeObserver(observer: Observer): void {
            const index = this.observers.indexOf(observer)
            if(index > -1) {
                this.observers.splice(index, 1)
            }
        }
        public notifyObservers() : void {
            for(const observer of this.observers) {
                observer.update(this.state)
            }
        }
        public setState(state: any) : void {
            this.state = state;
            this.notifyObservers();
        }
        public getState(): any {
            return this.state;
        }
    }
````

#### 3. 实现具体观察者
````typescript
    class ConcreteObserver implements Observer {
        constructor(private name : string) {}
        update(data: any) : void {
            console.log(`${this.name} received data:`, data);
        }
    }
````

#### 4. 使用示例
````typescript
    const subject = new ContreteSubject();
    const observer1 = new ContreteObserver();
    const observer2 = new ContreteObserver();
    // 注册观察者
    subject.registerObserver(observer1);
    subject.registerObserver(observer2);
    // 改变主题状态，观察者会自动收到通知
    subject.setState({message: 'First notification'});
    // 移除一个观察者
    subject.removeObserver(observer2);
    // 再次改变状态
    subject.setState({message: 'Second notification'});
````

### 更实用的例子：天气预报系统
````typescript
    // 天气数据主题
    class WeatherData implements Subject {
        private observers: Observer[] = [];
        private temperature: number = 0;
        private humidity: number = 0;
        private pressure: number = 0;

        registerObserver(observer: Observer): void {
            this.observers.push(observer);
        }

        removeObserver(observer: Observer): void {
            const index = this.observers.indexOf(observer);
            if (index > -1) {
            this.observers.splice(index, 1);
            }
        }
        // 将变化信息推送给所有观察者
        notifyObservers(): void {
            for (const observer of this.observers) {
            observer.update({
                temperature: this.temperature,
                humidity: this.humidity,
                pressure: this.pressure
            });
            }
        }

        measurementsChanged(): void {
            this.notifyObservers();
        }

        setMeasurements(temperature: number, humidity: number, pressure: number): void {
            this.temperature = temperature;
            this.humidity = humidity;
            this.pressure = pressure;
            this.measurementsChanged();
        }
    }

    // 当前天气状况显示
    class CurrentConditionsDisplay implements Observer {
        private temperature: number = 0;
        private humidity: number = 0;
        // 生成实例时注册观察者
        constructor(private weatherData: Subject) {
            this.weatherData.registerObserver(this);
        }

        update(data: { temperature: number; humidity: number; pressure: number }): void {
            this.temperature = data.temperature;
            this.humidity = data.humidity;
            this.display();
        }

        display(): void {
            console.log(`Current conditions: ${this.temperature}°C and ${this.humidity}% humidity`);
        }
    }

    // 使用示例
    const weatherData = new WeatherData();
    const currentDisplay = new CurrentConditionsDisplay(weatherData);

    // 模拟天气数据变化
    weatherData.setMeasurements(25, 65, 1013);
    weatherData.setMeasurements(26, 70, 1012);
    weatherData.setMeasurements(24, 90, 1014);
````

### TypeScript 特有的优化
#### 1. 使用泛型改进类型安全
````typescript
    interface Observer<T> {
        update(data: T): void;
    }

    interface Subject<T> {
        registerObserver(observer: Observer<T>): void;
        removeObserver(observer: Observer<T>): void;
        notifyObservers(): void;
    }

    class WeatherData implements Subject<WeatherInfo> {
        // ... 其他代码相同
        
        notifyObservers(): void {
            for (const observer of this.observers) {
            observer.update({
                temperature: this.temperature,
                humidity: this.humidity,
                pressure: this.pressure
            });
            }
        }
    }

    interface WeatherInfo {
        temperature: number;
        humidity: number;
        pressure: number;
    }
````

#### 2. 使用 RxJS 实现观察者模式
TypeScript 生态中常用的 RxJS 库本身就是基于观察者模式的：
````typescript
    import { Subject } from 'rxjs';

    // 创建主题
    const weatherSubject = new Subject<WeatherInfo>();

    // 创建观察者
    const subscription1 = weatherSubject.subscribe(data => {
        console.log('Observer 1:', data);
    });

    const subscription2 = weatherSubject.subscribe(data => {
        console.log('Observer 2:', data);
    });

    // 发布数据
    weatherSubject.next({ temperature: 25, humidity: 65, pressure: 1013 });
    weatherSubject.next({ temperature: 26, humidity: 70, pressure: 1012 });

    // 取消订阅
    subscription1.unsubscribe();

    // 再次发布
    weatherSubject.next({ temperature: 24, humidity: 90, pressure: 1014 });
````


### 在 React/Vue/Angular 中的应用
#### 在 React 中的应用
React 的 Context API 和状态管理库（如 Redux）都使用了观察者模式的变体：
````typescript
    // 使用 React Context
    const WeatherContext = React.createContext<WeatherInfo | null>(null);

    // 提供者组件（相当于Subject）
    function WeatherProvider({ children }: { children: React.ReactNode }) {
        const [weather, setWeather] = useState<WeatherInfo>({
            temperature: 25,
            humidity: 65,
            pressure: 1013
        });

        useEffect(() => {
            const interval = setInterval(() => {
            setWeather(prev => ({
                ...prev,
                temperature: prev.temperature + Math.random() - 0.5
            }));
            }, 1000);
            return () => clearInterval(interval);
        }, []);

        return (
            <WeatherContext.Provider value={weather}>
            {children}
            </WeatherContext.Provider>
        );
    }

    // 消费者组件（相当于Observer）
    function WeatherDisplay() {
        const weather = useContext(WeatherContext);
        return (
            <div>
            Temperature: {weather?.temperature.toFixed(1)}°C
            </div>
        );
    }
````

### 类型推论
如果没有明确的指定类型，那么 TypeScript 会依照类型推论（Type Inference）的规则推断出一个类型。
### 匿名函数
匿名函数与函数声明有点不同。当一个函数出现在 TypeScript 可以确定如何调用它的地方时，该函数的参数会自动被赋予类型。
### 类型断言
有时你会得到关于 TypeScript 无法知道的值类型的信息。   
例如，如果你使用的是 document.getElementById，TypeScript 只知道这将返回某种 HTMLElement，但你可能知道你的页面将始终具有具有给定 ID 的 HTMLCanvasElement。   
在这种情况下，你可以使用类型断言来指定更具体的类型：  
````typescript
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
````
TypeScript 只允许类型断言转换为更具体或更不具体的类型版本。此规则可防止 “impossible” 强制，例如：
````typescript
const x = "hello" as number;
````
### 字面类型
除了通用类型 string 和 number 之外，我们还可以在类型位置引用特定的字符串和数字。
通过将字面量组合成联合，你可以表达更有用的概念 - 例如，仅接受一组特定已知值的函数：
````typescript
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
````
当然，你可以将这些与非字面类型结合使用：
````typescript
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
````

### 字面推断
当你使用对象初始化变量时，TypeScript 假定该对象的属性可能会在以后更改值。例如，如果你编写如下代码：
````typescript
declare function handleRequest(url: string, method: "GET" | "POST"): void;
 
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
````
在上面的例子中，req.method 被推断为 string，而不是 "GET"。因为可以在 req 的创建和 handleRequest 的调用之间评估代码，这可以将一个新的字符串（如 "GUESS" 分配给 req.method），TypeScript 认为此代码有错误。   
有两种方法可以解决这个问题。
````typescript
// Change 1:
const req = { url: "https://example.com", method: "GET" as "GET" };
// Change 2
handleRequest(req.url, req.method as "GET");
// 使用 as const 将整个对象转换为类型字面
const req = { url: "https://example.com", method: "GET" } as const;
handleRequest(req.url, req.method);
````
### 非空断言运算符（后缀 ! ）
TypeScript 还具有一种特殊的语法，可以在不进行任何显式检查的情况下从类型中删除 null 和 undefined。在任何表达式之后写 ! 实际上是一个类型断言，该值不是 null 或 undefined：
````typescript
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed());
}
````
就像其他类型断言一样，这不会改变代码的运行时行为，所以当你知道值不能是 null 或 undefined 时，只使用 ! 很重要。

## 类型缩小
### typeof
在 TypeScript 中，检查 typeof 返回的值是一种类型保护
````typescript
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
````

### 相等性缩小
JavaScript 对 == 和 != 的更宽松的相等性检查也正确地缩小了类型。如果你不熟悉，检查某物 == null 是否实际上不仅检查它是否是值 null - 它还检查它是否可能是 undefined。这同样适用于 == undefined：它检查一个值是 null 还是 undefined。
````typescript
interface Container {
  value: number | null | undefined;
}
 
function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type.
  if (container.value != null) {
    console.log(container.value); 
    // Now we can safely multiply 'container.value'.
    container.value *= factor;
  }
}
````

#### in
JavaScript 有一个运算符来确定对象或其原型链是否具有名称属性：in 运算符。TypeScript 将这一点视为缩小潜在类型的一种方式。
````typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };
 
function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }
 
  return animal.fly();
}
````

### instanceof
JavaScript 有一个运算符用于检查一个值是否是另一个值的 “instance”。更具体地说，在 JavaScript 中，x instanceof Foo 检查 x 的原型链是否包含 Foo.prototype。
````typescript
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
               
  } else {
    console.log(x.toUpperCase());
               
  }
}
````

### 使用类型谓词
````typescript
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
````
pet is Fish 是本例中的类型谓词。谓词采用 parameterName is Type 的形式，其中 parameterName 必须是当前函数签名中的参数名称。

任何时候使用某个变量调用 isFish 时，如果基础类型兼容，TypeScript 就会将该变量缩小到该特定类型。

### 断言函数
断言函数是 TypeScript 中一种特殊的函数，它用于在运行时检查某个条件是否为真，并在不满足条件时抛出错误。如果条件满足，TypeScript 的类型系统会"记住"这个断言，并相应地缩小类型范围。
1. **简单断言函数**：
````typescript
function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
````
2. **类型谓词断言函数**：
````typescript
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error("Value must be a string");
    }
}
````
#### 使用示例
````typescript
function processValue(value: number | null) {
    assert(value !== null, "Value cannot be null");
    // 这里 TypeScript 知道 value 是 number 类型
    console.log(value.toFixed(2));
}
````
````typescript
function loadConfig(config: unknown) {
    assertIsString(config);
    // 这里 TypeScript 知道 config 是 string 类型
    return JSON.parse(config);
}
````

#### 实际应用场景
1. **验证函数参数：**
````typescript
function createUser(name: unknown, age: unknown) {
    assert(typeof name === "string", "Name must be a string");
    assert(typeof age === "number", "Age must be a number");
    // 现在 name 和 age 的类型已被正确推断
    return { name, age };
}
````
2. **状态验证：**
````typescript
type State = "idle" | "loading" | "ready";

let currentState: State = "idle";

function assertIsReady(state: State): asserts state is "ready" {
    if (state !== "ready") {
        throw new Error("System is not ready");
    }
}

function performAction() {
    assertIsReady(currentState);
    // 这里 TypeScript 知道 currentState 是 "ready"
    console.log("Performing action...");
}
````

#### 与类型守卫的区别
1. 类型守卫返回布尔值，用于条件判断：
````typescript
function isString(value: unknown): value is string {
    return typeof value === "string";
}

if (isString(value)) {
    // value 是 string
}
````
2. 断言函数不返回值，直接抛出错误或改变类型推断：
````typescript
function assertIsString(value: unknown): asserts value is string {
    if (!isString(value)) throw new Error();
}

assertIsString(value);
// value 现在是 string 类型
````

#### 最佳实践
1. 提供有用的错误信息：总是包含描述性的错误消息
2. 避免过度使用：只在真正需要强制类型转换的地方使用
3. 考虑性能：频繁的断言检查可能影响性能
4. 测试覆盖：确保测试所有可能的断言失败情况

### never
never 类型可分配给每个类型；但是，没有类型可分配给 never（never 本身除外）。这意味着你可以使用缩小范围并依靠出现的 never 在 switch 语句中进行详尽检查。
````typescript
type Shape = Circle | Square;
 
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
````

## 函数
### 函数类型表达式
````typescript
type GreetFunction = (a: string) => void;
function greeter(fn: GreetFunction) {
  // ...
}
````
### 调用签名
在 JavaScript 中，函数除了可调用之外还可以具有属性。但是，函数类型表达式语法不允许声明属性。如果我们想用属性描述可调用的东西，我们可以在对象类型中编写调用签名：
````typescript
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}
 
function myFunc(someArg: number) {
  return someArg > 3;
}
myFunc.description = "default description";
 
doSomething(myFunc);
````
### 构造签名
JavaScript 函数也可以使用 new 运算符调用。TypeScript 将它们称为构造函数，因为它们通常会创建一个新对象。你可以通过在调用签名前添加 new 关键字来编写构造签名：
````typescript
type SomeConstructor = {
  new (s: string): SomeObject;
};
function fn(ctor: SomeConstructor) {
  return new ctor("hello");
}
````
一些对象，比如 JavaScript 的 Date 对象，可以在有或没有 new 的情况下调用。你可以任意组合相同类型的调用和构造签名：
````typescript
interface CallOrConstruct {
  (n?: number): string;
  new (s: string): Date;
}
 
function fn(ctor: CallOrConstruct) {
    // Passing an argument of type `number` to `ctor` matches it against
    // the first definition in the `CallOrConstruct` interface.
    console.log(ctor(10));             
    // (n?: number) => string

    // Similarly, passing an argument of type `string` to `ctor` matches it
    // against the second definition in the `CallOrConstruct` interface.
    console.log(new ctor("10"));                 
    // new (s: string) => Date
}
 
fn(Date);
````
### 泛型函数
通常会编写一个函数，其中输入的类型与输出的类型相关，或者两个输入的类型以某种方式相关。让我们考虑一个返回数组第一个元素的函数：
````typescript
function firstElement(arr: any[]) {
  return arr[0];
}
````
在 TypeScript 中，当我们想要描述两个值之间的对应关系时，会使用泛型。我们通过在函数签名中声明一个类型参数来做到这一点
````typescript
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
````
通过向该函数添加类型参数 Type 并在两个地方使用它，我们在函数的输入（数组）和输出（返回值）之间创建了一个链接。现在当我们调用它时，会出现一个更具体的类型：
````typescript
// s is of type 'string'
const s = firstElement(["a", "b", "c"]);
// n is of type 'number'
const n = firstElement([1, 2, 3]);
// u is of type undefined
const u = firstElement([]);
````

请注意，我们不必在此示例中指定 Type。类型被推断 - 自动选择 - 通过 TypeScript。    
我们也可以使用多个类型参数。例如，map 的独立版本如下所示：   
````typescript
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}

// Parameter 'n' is of type 'string'
// 'parsed' is of type 'number[]'
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
````

### 约束条件
我们编写了一些泛型函数，可以处理任何类型的值。有时我们想关联两个值，但只能对某个值的子集进行操作。在这种情况下，我们可以使用约束来限制类型参数可以接受的类型种类。
````typescript
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}
 
// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'alice' | 'bob'
const longerString = longest("alice", "bob");
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100);
// Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
````

在这个例子中有一些有趣的事情需要注意。我们允许 TypeScript 推断 longest 的返回类型。返回类型推断也适用于泛型函数。

因为我们将 Type 限制为 { length: number }，所以我们可以访问 a 和 b 参数的 .length 属性。如果没有类型约束，我们将无法访问这些属性，因为这些值可能是没有长度属性的其他类型。

longerArray 和 longerString 的类型是根据参数推断出来的。请记住，泛型就是将两个或多个具有相同类型的值关联起来！

最后，正如我们所愿，对 longest(10, 100) 的调用被拒绝，因为 number 类型没有 .length 属性。


### 使用约束值
这是使用泛型约束时的一个常见错误：
````typescript
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    // error 应该返回类型Type而不是只有约束条件
    return { length: minimum };
  }
}

// 'arr' gets value { length: 6 }
const arr = minimumLength([1, 2, 3], 6);
// and crashes here because arrays have
// a 'slice' method, but not the returned object!
console.log(arr.slice(0));
````

### 指定类型参数
````typescript
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
// error
const arr = combine([1, 2, 3], ["hello"]);
// 直接指定参数入参类型
const arr = combine<string | number>([1, 2, 3], ["hello"]);
````

### 编写良好泛型函数的指南

#### 下推类型参数
````typescript
function firstElement1<Type>(arr: Type[]) {
  return arr[0];
}
 
function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0];
}
 
// a: number (good)
const a = firstElement1([1, 2, 3]);
// b: any (bad)
const b = firstElement2([1, 2, 3]);
````

乍一看，这些似乎相同，但 firstElement1 是编写此函数的更好方法。它推断的返回类型是 Type，但 firstElement2 的推断返回类型是 any。   
因为 TypeScript 必须使用约束类型来解析 arr[0] 表达式，而不是 “等待” 在调用期间解析元素。  

> 规则：When possible, use the type parameter itself rather than constraining it


#### 使用更少的类型参数
````typescript
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func);
}
 
function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func);
}
````

我们创建了一个不关联两个值的类型参数 Func。这总是一个危险信号，因为这意味着想要指定类型参数的调用者必须无缘无故地手动指定额外的类型参数。Func 没有做任何事情，只是让函数更难阅读和推断！

> 规则：始终使用尽可能少的类型参数

#### 类型参数应该出现两次
有时我们忘记了函数可能不需要是泛型的：
````typescript
function greet<Str extends string>(s: Str) {
  console.log("Hello, " + s);
}
 
greet("world");
````

请记住，类型参数用于关联多个值的类型。如果一个类型参数只在函数签名中使用一次，它就没有任何关系。
这包括推断的返回类型；例如，如果 Str 是 greet 的推断返回类型的一部分，它将关联参数和返回类型，因此尽管在书面代码中只出现一次，但它会被使用两次。

> If a type parameter only appears in one location, strongly reconsider if you actually need it

### 可选参数
JavaScript 中的函数通常采用可变数量的参数。例如，number 的 toFixed 方法采用可选的位数计数：
我们可以通过使用 ? 将参数标记为可选来在 TypeScript 中对此进行建模：
````typescript
function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK
````
尽管参数被指定为 number 类型，但 x 参数实际上将具有 number | undefined 类型，因为 JavaScript 中未指定的参数获取值 undefined。

你还可以提供参数默认值：
````typescript
function f(x = 10) {
  // ...
}
````
> When writing a function type for a callback, never write an optional parameter unless you intend to call the function without passing that argument

### 函数重载
可以以各种参数计数和类型调用一些 JavaScript 函数。例如，你可以编写一个函数来生成一个 Date，它采用时间戳（一个参数）或月/日/年规范（三个参数）。

在 TypeScript 中，我们可以通过编写重载签名来指定一个可以以不同方式调用的函数。为此，请编写一些函数签名（通常是两个或更多），然后是函数的主体：
````typescript
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
// error No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.
const d3 = makeDate(1, 3);
````
¥In this example, we wrote two overloads: one accepting one argument, and another accepting three arguments. These first two signatures are called the overload signatures.   
Then, we wrote a function implementation with a compatible signature. Functions have an implementation signature, but this signature can’t be called directly. Even though we wrote a function with two optional parameters after the required one, it can’t be called with two parameters!

### 重载签名和实现签名
这是一个常见的混淆来源。很多时候人们会写这样的代码，却不明白为什么会出现错误：
````typescript
function fn(x: string): void;
function fn() {
  // ...
}
// Expected to be able to call with zero arguments
fn();
````
Again, the signature used to write the function body can’t be “seen” from the outside.

> The signature of the implementation is not visible from the outside. When writing an overloaded function, you should always have two or more signatures above the implementation of the function.

The implementation signature must also be compatible with the overload signatures. For example, these functions have errors because the implementation signature doesn’t match the overloads in a correct way:

````typescript
function fn(x: boolean): void;
// Argument type isn't right
function fn(x: string): void;
// This overload signature is not compatible with its implementation signature.
function fn(x: boolean) {}
````
````typescript
function fn(x: string): string;
// Return type isn't right
function fn(x: number): boolean;
// This overload signature is not compatible with its implementation signature.
function fn(x: string | number) {
  return "oops";
}
````

### 编写好的重载
与泛型一样，在使用函数重载时应该遵循一些准则。遵循这些原则将使你的函数更易于调用、更易于理解和更易于实现.  

> 尽可能使用联合类型的参数而不是重载


### 在函数中声明 this
ypeScript 将通过代码流分析推断函数中的 this 应该是什么，例如：
````typescript
const user = {
  id: 123,
 
  admin: false,
  becomeAdmin: function () {
    this.admin = true;
  },
};
````
TypeScript 理解函数 user.becomeAdmin 有一个对应的 this，它是外部对象 user。this，呵呵，很多情况下就够用了，但是很多情况下，你需要更多的控制 this 代表什么对象。JavaScript 规范规定你不能有一个名为 this 的参数，因此 TypeScript 使用该语法空间让你在函数体中声明 this 的类型。
````typescript
interface User {
  id: number;
  name: string;
  age: number;
}

interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

function getDB(): DB {
  // 模拟数据库数据
  const users: User[] = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
    { id: 3, name: "Charlie", age: 35 }
  ];

  return {
    filterUsers(filter: (this: User) => boolean): User[] {
      return users.filter(user => filter.call(user));
    }
  };
}

// 使用示例
const db = getDB();
const adults = db.filterUsers(function() {
  return this.age >= 30;  // 注意这里必须用 function() 而不是箭头函数
});

console.log(adults); // 输出: [{ id: 2, name: "Bob", age: 30 }, { id: 3, name: "Charlie", age: 35 }]
````

#### 关键点说明
1. **this 参数的特殊性**:
    - 在 <em>filterUsers</em> 的实现中，我们使用 filter.call(user) 来确保回调函数中的 this 指向当前用户对象
    - 调用时必须使用普通函数（<em>function()</em>），箭头函数会忽略 this 绑定
2. **类型安全**：
    - 实现完全符合 <em>DB</em> 接口定义
    - TypeScript 会验证 <em>filter</em> 回调函数的 <em>this</em> 类型确实是 <em>User</em>
3. **数据封装**:
    - <em>users</em> 数组被封装在闭包中，外部无法直接访问
    - 只能通过 <em>filterUsers</em> 方法访问数据

#### 变体实现（更灵活的方式）
````typescript
function createDB(users: User[]): DB {
  return {
    filterUsers(filter: (this: User) => boolean): User[] {
      return users.filter(user => filter.call(user));
    }
  };
}

// 使用
const db = createDB([
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 }
]);
````

#### 为什么这样设计有意义？
这种模式特别适合：
- 需要保持数据不可变性的场景
- 需要明确指定回调函数中 <em>this</em> 类型的场景
- 创建领域特定语言(DSL)时

#### unknown
unknown 类型代表任何值。这类似于 any 类型，但更安全，因为使用 unknown 值做任何事情都是不合法的：
````typescript
function f1(a: any) {
  a.b(); // OK
}
// 'a' is of type 'unknown'.
function f2(a: unknown) {
  a.b();
}
````
你可以描述一个返回未知类型值的函数：
````typescript
function safeParse(s: string): unknown {
  return JSON.parse(s);
}
 
// Need to be careful with 'obj'!
const obj = safeParse(someRandomString);
````
#### never
有些函数从不返回值：
````typescript
function fail(msg: string): never {
  throw new Error(msg);
}
````
never 类型表示从未观察到的值。在返回类型中，这意味着函数抛出异常或终止程序的执行。
当 TypeScript 确定联合中没有任何内容时，never 也会出现。
````typescript
function fn(x: string | number) {
  if (typeof x === "string") {
    // do something
  } else if (typeof x === "number") {
    // do something else
  } else {
    x; // has type 'never'!
  }
}
````

#### Function
The global type Function describes properties like bind, call, apply, and others present on all function values in JavaScript. It also has the special property that values of type Function can always be called; these calls return <em>any</em>:
````typescript
function doSomething(f: Function) {
  return f(1, 2, 3);
}
````
这是一个无类型的函数调用，通常最好避免，因为不安全的 any 返回类型。

如果你需要接受任意函数但不打算调用它，则类型 () => void 通常更安全。

#### 剩余形参和实参
除了使用可选参数或重载来制作可以接受各种固定参数计数的函数之外，我们还可以使用剩余参数定义接受无限数量参数的函数。
````typescript
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}
// 'a' gets value [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
````
在 TypeScript 中，这些参数上的类型注释隐式为 any[] 而不是 any，并且给出的任何类型注释必须采用 Array<T> 或 T[] 形式，或者元组类型（稍后我们将了解）。

#### 剩余实参
相反，我们可以使用扩展语法从可迭代对象（例如数组）中提供可变数量的参数。例如，数组的 push 方法接受任意数量的参数：
````typescript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
````
请注意，通常，TypeScript 并不假定数组是不可变的。这可能会导致一些令人惊讶的行为：
````typescript
// Inferred type is number[] -- "an array with zero or more numbers",
// not specifically two numbers
const args = [8, 5];
// error A spread argument must either have a tuple type or be passed to a rest parameter.
const angle = Math.atan2(...args);
````
这种情况的最佳解决方案取决于你的代码，但通常 const 上下文是最直接的解决方案：
````typescript
// Inferred as 2-length tuple
const args = [8, 5] as const;
// OK
const angle = Math.atan2(...args);
````
#### 参数解构
你可以使用参数解构来方便地将作为参数提供的对象解包到函数体中的一个或多个局部变量中。在 JavaScript 中，它看起来像这样：
````typescript
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
````
对象的类型注释遵循解构语法：

````typescript
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
````

#### 函数的可赋值性

函数的 void 返回类型可能会产生一些不寻常但预期的行为。

返回类型为 void 的上下文类型不会强制函数不返回某些内容。另一种说法是具有 void 返回类型 (type voidFunc = () => void) 的上下文函数类型，当实现时，可以返回任何其他值，但会被忽略。

因此，() => void 类型的以下实现是有效的：

````typescript
type voidFunc = () => void;
 
const f1: voidFunc = () => {
  return true;
};
 
const f2: voidFunc = () => true;
 
const f3: voidFunc = function () {
  return true;
};

const v1 = f1();
 
const v2 = f2();
 
const v3 = f3();
````

还有另一种特殊情况需要注意，当字面量函数定义具有 void 返回类型时，该函数不得返回任何内容。
````typescript
function f2(): void {
  // @ts-expect-error
  return true;
}
 
const f3 = function (): void {
  // @ts-expect-error
  return true;
};
````

## 对象
### 属性修饰符
很多时候，我们会发现自己在处理可能具有属性集的对象。在这些情况下，我们可以通过在其名称末尾添加问号 (?) 来将这些属性标记为可选。
````typescript
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}
 
function paintShape(opts: PaintOptions) {
  // ...
}
 
const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
````

我们还可以从这些属性中读取 - 但是当我们在 strictNullChecks 下进行操作时，TypeScript 会告诉我们它们可能是 undefined。
在 JavaScript 中，即使属性从未被设置过，我们仍然可以访问它 - 它只会给我们值 undefined。我们可以通过检查来专门处理 undefined。

````typescript
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
  // ...
}
````

这里我们使用 解构模式 作为 paintShape 的参数，并为 xPos 和 yPos 提供了 默认值。现在 xPos 和 yPos 都肯定存在于 paintShape 的主体中，但对于 paintShape 的任何调用者都是可选的。
请注意，目前没有办法在解构模式中放置类型注释。这是因为下面的语法在 JavaScript 中已经有了不同的含义。
在对象解构模式中，shape: Shape 表示“获取属性 shape 并将其在本地重新定义为名为 Shape 的变量”。 同样，xPos: number 创建一个名为 number 的变量，其值基于参数的 xPos。
````typescript
function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
    // Cannot find name 'shape'. Did you mean 'Shape'?
    render(shape);
    // Cannot find name 'xPos'.
    render(xPos);
}
````

#### readonly
对于 TypeScript，属性也可以标记为 readonly。虽然它不会在运行时改变任何行为，但在类型检查期间无法写入标记为 readonly 的属性。
````typescript
interface SomeType {
  readonly prop: string;
}
 
function doSomething(obj: SomeType) {
  // We can read from 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`);
 
  // But we can't re-assign it.
  obj.prop = "hello";
  // Cannot assign to 'prop' because it is a read-only property.
}
````

使用 readonly 修饰符并不一定意味着值是完全不可变的 - 或者换句话说，其内部内容无法更改。这只是意味着属性本身不能被重写。
````typescript
interface Home {
  readonly resident: { name: string; age: number };
}
 
function visitForBirthday(home: Home) {
  // We can read and update properties from 'home.resident'.
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}
 
function evict(home: Home) {
  // But we can't write to the 'resident' property itself on a 'Home'.
  home.resident = {
    // Cannot assign to 'resident' because it is a read-only property.
    name: "Victor the Evictor",
    age: 42,
  };
}
````

管理对 readonly 含义的期望很重要。在 TypeScript 的开发期间触发关于如何使用对象的意图很有用。TypeScript 在检查两种类型是否兼容时不会考虑这两种类型的属性是否为 readonly，因此 readonly 属性也可以通过别名来更改。

````typescript
interface Person {
  name: string;
  age: number;
}
 
interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}
 
let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};
 
// works
let readonlyPerson: ReadonlyPerson = writablePerson;
 
console.log(readonlyPerson.age); // prints '42'
writablePerson.age++;
console.log(readonlyPerson.age); // prints '43'
````

### 索引签名
有时你并不提前知道类型属性的所有名称，但你确实知道值的形状。
在这些情况下，你可以使用索引签名来描述可能值的类型，例如：

````typescript
interface StringArray {
  [index: number]: string;
}
 
const myArray: StringArray = getStringArray();
const secondItem = myArray[1];
````

上面，我们有一个 StringArray 接口，它有一个索引签名。这个索引签名表明当一个 StringArray 被一个 number 索引时，它将返回一个 string。

索引签名属性只允许使用某些类型：string、number、symbol、模板字符串模式以及仅由这些组成的联合类型。

#### 可以支持多种类型的索引器
请注意，当同时使用 `number` 和 `string` 索引器时，从数字索引器返回的类型必须是从字符串索引器返回的类型的子类型。这是因为当使用 `number` 进行索引时，JavaScript 在索引到对象之前实际上会将其转换为 `string`。这意味着使用 `XSPACE100`（ `number`）建立索引与使用 `"100"`（ `string`）建立索引是一样的，因此两者需要保持一致。

````typescript
interface Animal {
  name: string;
}
 
interface Dog extends Animal {
  breed: string;
}
 
// Error: indexing with a numeric string might get you a completely separate type of Animal!
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}
````

虽然字符串索引签名是描述 “dictionary” 模式的强大方式，但它们还强制所有属性与其返回类型匹配。这是因为字符串索引声明 `obj.property` 也可用作 `obj["property"]`。在下面的例子中，`name` 的类型与字符串索引的类型不匹配，类型检查器给出错误：
````typescript
interface NumberDictionary {
  [index: string]: number;
  length: number; // ok
  // Property 'name' of type 'string' is not assignable to 'string' index type 'number'.
  name: string;
}
````

但是，如果索引签名是属性类型的联合，则可以接受不同类型的属性：
````typescript
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // ok, length is a number
  name: string; // ok, name is a string
}
````

最后，你可以使索引签名 readonly 以防止分配给它们的索引：
````typescript
interface ReadonlyStringArray {
  readonly [index: number]: string;
}
 
let myArray: ReadonlyStringArray = getReadOnlyStringArray();
// Index signature in type 'ReadonlyStringArray' only permits reading.
myArray[2] = "Mallory";

````

#### 为什么使用索引签名
1.  **处理动态属性名**
````typescript
interface StringDictionary {
  [key: string]: string; // 键是字符串，值也是字符串
}

const colors: StringDictionary = {
  primary: "blue",
  secondary: "green",
  // 可以添加任意数量的string:string键值对
};
````
2.  **表示字典/映射数据结构**
````typescript
interface NumberMap {
  [key: string]: number;
}

const scores: NumberMap = {
  Alice: 95,
  Bob: 87,
  // 可以动态添加
};
scores["Charlie"] = 91;
````

3.  **类型安全地访问动态属性**
````typescript
interface Cache {
  [key: string]: any; // 值可以是任意类型
  timeout: number; // 也可以包含已知属性
}

const cache: Cache = {
  timeout: 5000,
  // 其他动态属性
};
cache["userData"] = { name: "Alice" };
````

4.  **与数组类似的对象**
````typescript
interface StringArray {
  [index: number]: string; // 数字索引
}

const myArray: StringArray = ["a", "b", "c"];
const firstItem = myArray[0]; // 类型安全地访问
````

5.  **混合已知和未知属性**
````typescript
interface MixedProps {
  name: string; // 已知属性
  age: number;  // 已知属性
  [prop: string]: string | number; // 其他动态属性
}

const person: MixedProps = {
  name: "Alice",
  age: 25,
  occupation: "Engineer", // 动态添加
  experienceYears: 5      // 动态添加
};
````

6.  **确保类型一致性**
````typescript
interface Config {
  [key: string]: boolean | string;
  debug: boolean; // 必须符合索引签名
}

// 正确
const config: Config = {
  debug: true,
  environment: "production"
};

// 错误 - 值不能是number
const badConfig: Config = {
  debug: true,
  port: 8080  // 错误: number不兼容boolean | string
};
````

#### 使用注意事项
1. **键类型限制**：索引签名的键只能是 **`string`** **`number`** 或 **`Symbol`** 类型
2. **值类型约束**：所有显式声明的属性类型必须兼容索引签名类型
3. **谨慎使用 `any`**：**`[key: string]: any`** 会失去类型安全性
4. **替代方案**：考虑使用 **`Record<Keys, Type>`** 工具类型
````typescript
// 使用Record的等价写法
type StringDictionary = Record<string, string>;
````

### 溢出属性检查
Typescript会在创建对象时更彻底地验证对象并在创建期间将其分配给对象类型。
````typescript
interface SquareConfig {
  color?: string;
  width?: number;
}
 
function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// Object literal may only specify known properties, but 'colour' does not exist in type 'SquareConfig'. Did you mean to write 'color'?
let mySquare = createSquare({ colour: "red", width: 100 });
````

绕过这些检查实际上非常简单。最简单的方法是只使用类型断言：
````typescript
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
````

但是，如果你确定该对象可以具有一些以某种特殊方式使用的额外属性，则更好的方法可能是添加字符串索引签名。如果 SquareConfig 可以具有上述类型的 color 和 width 属性，但也可以具有任意数量的其他属性，那么我们可以这样定义它：
````typescript
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: unknown;
}
````
这里我们说 `SquareConfig` 可以有任意数量的属性，只要它们不是 `color` 或 `width`，它们的类型并不重要。

绕过这些检查的最后一种方法（可能有点令人惊讶）是将对象分配给另一个变量：由于分配 squareOptions 不会进行溢出属性检查，因此编译器不会给你错误：
````typescript
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
````

### 扩展类型
`interface` 上的 `extends` 关键字允许我们有效地从其他命名类型复制成员，并添加我们想要的任何新成员。这对于减少我们必须编写的类型声明样板的数量以及表明同一属性的几个不同声明可能相关的意图很有用。例如，AddressWithUnit 不需要重复 `street` 属性，因为 `street` 源自 `BasicAddress`，所以读者会知道这两种类型在某种程度上是相关的。
````typescript
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
 
interface AddressWithUnit extends BasicAddress {
  unit: string;
}
````

`interface` 还可以从多种类型扩展。
````typescript
interface Colorful {
  color: string;
}
 
interface Circle {
  radius: number;
}
 
interface ColorfulCircle extends Colorful, Circle {}
 
const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
````

### 交叉类型
`interface` 允许我们通过扩展其他类型来构建新类型。TypeScript 提供了另一种称为交叉类型的构造，主要用于组合现有的对象类型。
交叉类型是使用 `&` 运算符定义的。
````typescript
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
 
type ColorfulCircle = Colorful & Circle;

function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}
````

### 泛型对象类型
我们可以创建一个声明类型参数的泛型 `Box` 类型。
````typescript
interface Box<Type> {
  contents: Type;
}
````
你可能会将其理解为“`Type` 的 `Box` 是其 `contents` 具有类型 `Type` 的东西”。稍后，当我们引用 `Box` 时，我们必须给出一个类型参数来代替 `Type`。
````typescript
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}
 
let boxA: Box<string> = { contents: "hello" };
let boxB: StringBox = { contents: "world" };
````

`Box` 是可重用的，因为 `Type` 可以用任何东西代替。这意味着当我们需要一个新类型的盒子时，我们根本不需要声明一个新的 `Box` 类型（尽管如果我们愿意，我们当然可以）。
````typescript
interface Box<Type> {
  contents: Type;
}
 
interface Apple {
  // ....
}
 
// Same as '{ contents: Apple }'.
type AppleBox = Box<Apple>;
````

### ReadonlyArray
`ReadonlyArray` 是一种特殊类型，用于描述不应更改的数组。
````typescript
// Property 'push' does not exist on type 'readonly string[]'.
function doStuff(values: ReadonlyArray<string>) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);
 
  // ...but we can't mutate 'values'.
  values.push("hello!");
}
````

### 元组类型
元组类型是另一种 `Array` 类型，它确切地知道它包含多少个元素，以及它在特定位置包含哪些类型。
````typescript
type StringNumberPair = [string, number];

function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;
 
  console.log(inputString);
                  
  console.log(hash);
      
}
````
这里，`StringNumberPair` 是 `string` 和 `number` 的元组类型。与 `ReadonlyArray` 一样，它在运行时没有表示，但对 TypeScript 很重要。对于类型系统，`StringNumberPair` 描述了 `0` 索引包含 `string` 和 `1` 索引包含 `number` 的数组。

> 元组类型在大量基于约定的 API 中很有用，其中每个元素的含义都是 “明确的”。这使我们在解构变量时可以灵活地命名变量。在上面的示例中，我们可以将元素 0 和 1 命名为我们想要的任何名称。
>但是，由于并非每个用户都对显而易见的事物持有相同的看法，因此可能值得重新考虑使用具有描述性属性名称的对象是否更适合你的 API。

你可能感兴趣的另一件事是元组可以通过写出问号（元素类型后的 ?）来具有可选属性。可选的元组元素只能放在最后，也会影响 length 的类型。
````typescript
type Either2dOr3d = [number, number, number?];
 
function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;
              
// const z: number | undefined
 
  console.log(`Provided coordinates had ${coord.length} dimensions`);
                                                  
// (property) length: 2 | 3
}
````

元组也可以有剩余元素，它们必须是数组/元组类型。
````typescript
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
````

- StringNumberBooleans 描述了一个元组，其前两个元素分别是 string 和 number，但后面可以有任意数量的 boolean。

- StringBooleansNumber 描述一个元组，其第一个元素是 string，然后是任意数量的 boolean，最后以 number 结尾。

- BooleansStringNumber 描述了一个元组，其起始元素是任意数量的 boolean，并以 string 和 number 结尾。

为什么可选的和剩余的元素可能有用？好吧，它允许 TypeScript 将元组与参数列表对应起来。元组类型可以在 剩余形参和实参 中使用，因此如下：
````typescript
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
````
基本上相当于：
````typescript
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
````

#### readonly 元组类型
在大多数代码中，元组往往被创建并保持不变，因此尽可能将类型注释为 `readonly` 元组是一个很好的默认设置。这一点也很重要，因为带有 `const` 断言的数组字面将使用 `readonly` 元组类型来推断。

````typescript
let point = [3, 4] as const;
 
function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}
// error Argument of type 'readonly [3, 4]' is not assignable to parameter of type '[number, number]'. The type 'readonly [3, 4]' is 'readonly' and cannot be assigned to the mutable type '[number, number]'.
distanceFromOrigin(point);
````

## 类型操作
### 泛型
#### 泛型类型
泛型函数的类型和非泛型函数的类型一样，类型参数先列出，类似于函数声明：
````typescript
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: <Type>(arg: Type) => Type = identity;
````

我们也可以为类型中的泛型类型参数使用不同的名称，只要类型变量的数量和类型变量的使用方式一致。
````typescript
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: <Input>(arg: Input) => Input = identity;
````

我们还可以将泛型类型写为对象字面量类型的调用签名：
````typescript
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: { <Type>(arg: Type): Type } = identity;
````

这导致我们编写我们的第一个泛型接口。让我们从前面的示例中获取对象字面量并将其移动到接口：
````typescript
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
}
 
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: GenericIdentityFn = identity;
````

在类似的示例中，我们可能希望将泛型参数移动为整个接口的参数。这让我们可以看到我们是泛型的类型（例如 `Dictionary<string>` 而不仅仅是 `Dictionary`）。这使得类型参数对接口的所有其他成员可见。
````typescript
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}
 
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: GenericIdentityFn<number> = identity;
````
请注意，我们的示例已更改为略有不同。我们现在有一个非泛型函数签名，它是泛型类型的一部分，而不是描述泛型函数。当我们使用 `GenericIdentityFn` 时，我们现在还需要指定相应的类型参数（此处：`number`），从而有效锁定底层调用签名将使用的内容。了解何时将类型参数直接放在调用签名上以及何时将其放在接口本身将有助于描述类型的哪些方面是泛型的。

除了`泛型接口`，我们还可以创建`泛型类`。请注意，无法创建泛型枚举和命名空间。


### 泛型类

````typescript
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}
 
let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
````

### 泛型约束

````typescript
interface Lengthwise {
  length: number;
}
 
function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}

loggingIdentity({ length: 10, value: 3 });
````

### 在泛型约束中使用类型参数
你可以声明受另一个类型参数约束的类型参数。例如，在这里我们想从一个给定名称的对象中获取一个属性。We’我想确保我们’ 不会意外获取 obj 上不存在的属性，因此我们将在两种类型之间放置约束：
````typescript
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}
 
let x = { a: 1, b: 2, c: 3, d: 4 };
 
getProperty(x, "a");
// error Argument of type '"m"' is not assignable to parameter of type '"a" | "b" | "c" | "d"'.
getProperty(x, "m");
````

### 在泛型中使用类类型
在 TypeScript 中使用泛型创建工厂时，需要通过其构造函数引用类类型。例如，
````typescript
function create<Type>(c: { new (): Type }): Type {
  return new c();
}
````

一个更高级的示例使用原型属性来推断和约束构造函数和类类型的实例端之间的关系。
此模式用于为 `混入` 设计模式提供动力。
````typescript
class BeeKeeper {
  hasMask: boolean = true;
}
 
class ZooKeeper {
  nametag: string = "Mikle";
}
 
class Animal {
  numLegs: number = 4;
}
 
class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}
 
class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}
 
function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}
 
createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
````

### 泛型参数默认值
通过声明泛型类型参数的默认值，你可以选择指定相应的类型参数。例如，创建新 `HTMLElement` 的函数。调用不带参数的函数会生成 `HTMLDivElement`；使用元素作为第一个参数调用函数会生成参数类型的元素。你也可以选择传递子项列表。以前你必须将函数定义为：
````typescript
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
````

使用泛型参数默认值，我们可以将其简化为：
````typescript
declare function create<T extends HTMLElement = HTMLDivElement, U extends HTMLElement[] = T[]>(
  element?: T,
  children?: U
): Container<T, U>;
 
const div = create();
      
// const div: Container<HTMLDivElement, HTMLDivElement[]>
 
const p = create(new HTMLParagraphElement());
     
// const p: Container<HTMLParagraphElement, HTMLParagraphElement[]>
````

泛型参数默认值遵循以下规则：
- 如果一个类型参数有一个默认值，它就被认为是可选的。
- 必需的类型参数不能跟在可选的类型参数之后。
- 类型参数的默认类型必须满足类型参数的约束（如果存在）。
- 指定类型参数时，只需为需要的类型参数指定类型参数即可。未指定的类型参数将解析为其默认类型。
- 如果指定了默认类型并且推断无法选择候选者，则推断默认类型。
- 与现有类或接口声明合并的类或接口声明可能会为现有类型参数引入默认值。
- 与现有类或接口声明合并的类或接口声明可以引入新的类型参数，只要它指定默认值即可。


### keyof 类型运算符
`keyof` 运算符采用对象类型并生成其键的字符串或数字字面联合。以下类型 `P` 与 `type P = "x" | "y"` 类型相同：
````typescript
type Point = { x: number; y: number };
type P = keyof Point;
````

如果该类型具有 string 或 number 索引签名，则 keyof 将返回这些类型：
````typescript
type Arrayish = { [n: number]: unknown };
// type A = number
type A = keyof Arrayish;

type Mapish = { [k: string]: boolean };
// type M = string | number
type M = keyof Mapish;
    
````

### typeof 类型运算符
TypeScript 添加了一个 `typeof` 运算符，你可以在类型上下文中使用它来引用变量或属性的类型：
````typescript
let s = "hello";
// let n: string
let n: typeof s;
````

这对于基本类型不是很有用，但结合其他类型运算符，你可以使用 `typeof` 方便地表达许多模式。例如，让我们从查看预定义类型 `ReturnType<T>` 开始。它接受一个函数类型并产生它的返回类型：
````typescript
type Predicate = (x: unknown) => boolean;
// type K = boolean
type K = ReturnType<Predicate>; 
````

请记住，值和类型不是一回事。要引用值 f 所具有的类型，我们使用 typeof：
````typescript
function f() {
  return { x: 10, y: 3 };
}
// type P = {
//     x: number;
//     y: number;
// }
type P = ReturnType<typeof f>;
````


### 索引访问类型
我们可以使用索引访问类型来查找另一种类型的特定属性：
````typescript
type Person = { age: number; name: string; alive: boolean };
// type Age = number
type Age = Person["age"];    
````

索引类型本身就是一种类型，所以我们可以完全使用联合、keyof 或其他类型：
````typescript
// type I1 = string | number
type I1 = Person["age" | "name"];
     
// type I2 = string | number | boolean
type I2 = Person[keyof Person];
     
type AliveOrName = "alive" | "name";
// type I3 = string | boolean
type I3 = Person[AliveOrName];
````

使用任意类型进行索引的另一个示例是使用 `number` 来获取数组元素的类型。我们可以将它与 `typeof` 结合起来，以方便地捕获数组字面量的元素类型：
````typescript
const MyArray = [
  { name: "Alice", age: 15 },
  { name: "Bob", age: 23 },
  { name: "Eve", age: 38 },
];
 
// type Person = {
//     name: string;
//     age: number;
// }
type Person = typeof MyArray[number];
       
// type Age = number
type Age = typeof MyArray[number]["age"];
     
// type Age2 = number
type Age2 = Person["age"];   
````

### 条件类型
当 `extends` 左边的类型可以赋值给右边的类型时，就会得到第一个分支（`“true”` 分支）的类型；否则，你将在后一个分支（`“false”` 分支）中获得类型。

条件类型的强大之处在于将它们与泛型一起使用。

例如，让我们以下面的 `createLabel` 函数为例：
````typescript
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
 
function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
  throw "unimplemented";
}
````
createLabel 的这些重载描述了一个 JavaScript 函数，该函数根据其输入的类型进行选择。注意几点：
1. 如果一个库必须在其 API 中一遍又一遍地做出相同的选择，这将变得很麻烦。
2. 我们必须创建三个重载：当我们确定类型时（一个用于 `string`，一个用于 `number`），一个用于每种情况，一个用于最一般的情况（采用 `string | number`）。对于 `createLabel` 可以处理的每个新类型，重载的数量呈指数增长。

相反，我们可以将该逻辑编码为条件类型：
````typescript
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;

function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}
 
let a = createLabel("typescript");
   
// let a: NameLabel
 
let b = createLabel(2.8);
   
// let b: IdLabel
 
let c = createLabel(Math.random() ? "hello" : 42);
// let c: NameLabel | IdLabel
````

#### 条件类型约束

通常，条件类型的检查会为我们提供一些新信息。就像使用类型保护进行缩小可以为我们提供更具体的类型一样，条件类型的真正分支将通过我们检查的类型进一步限制泛型。

例如，让我们采取以下措施：
````typescript
// error Type '"message"' cannot be used to index type 'T'.
type MessageOf<T> = T["message"];
````

在这个例子中，TypeScript 出错是因为 T 不知道有一个名为 message 的属性。我们可以约束 T，TypeScript 将不再抗诉：
````typescript
type MessageOf<T extends { message: unknown }> = T["message"];
 
interface Email {
  message: string;
}
 
// type EmailMessageContents = string
type EmailMessageContents = MessageOf<Email>;
              
````

但是，如果我们希望 `MessageOf` 采用任何类型，并且在 `message` 属性不可用时默认为类似 `never` 的东西怎么办？我们可以通过移出约束并引入条件类型来做到这一点：
````typescript
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;
 
interface Email {
  message: string;
}
 
interface Dog {
  bark(): void;
}
 
// type EmailMessageContents = string
type EmailMessageContents = MessageOf<Email>;
              
// type DogMessageContents = never
type DogMessageContents = MessageOf<Dog>;
             
````

再举一个例子，我们还可以编写一个名为 Flatten 的类型，将数组类型展平为它们的元素类型，但不处理它们：
````typescript
type Flatten<T> = T extends any[] ? T[number] : T;
 
// Extracts out the element type.
// type Str = string
type Str = Flatten<string[]>;
     
// Leaves the type alone.
// type Num = number
type Num = Flatten<number>;
     
````

#### 在条件类型中推断

我们刚刚发现自己使用条件类型来应用约束，然后提取类型。这最终成为一种常见的操作，条件类型使它更容易。

条件类型为我们提供了一种使用 `infer` 关键字从我们在 `true` 分支中比较的类型进行推断的方法。例如，我们可以推断出 `Flatten` 中的元素类型，而不是使用索引访问类型从 `“manually”` 中获取它：
````typescript
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
````

在这里，我们使用 infer 关键字声明性地引入了一个名为 Item 的新泛型类型变量，而不是指定如何在 true 分支中检索 Type 的元素类型。这使我们不必考虑如何挖掘和探索我们感兴趣的类型的结构。

我们可以使用 infer 关键字编写一些有用的辅助类型别名。例如，对于简单的情况，我们可以从函数类型中提取返回类型：
````typescript
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
  ? Return
  : never;
 
// type Num = number
type Num = GetReturnType<() => number>;
     
// type Str = string
type Str = GetReturnType<(x: string) => string>;
     
// type Bools = boolean[]
type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
      
````

当从具有多个调用签名的类型（例如重载函数的类型）进行推断时，会根据最后一个签名进行推断（这可能是最宽松的包罗万象的情况）。无法根据参数类型列表执行重载决议。
````typescript
declare function stringOrNum(x: string): number;
declare function stringOrNum(x: number): string;
declare function stringOrNum(x: string | number): string | number;
 
// type T1 = string | number
type T1 = ReturnType<typeof stringOrNum>;
     
````

#### 分布式条件类型

当条件类型作用于泛型类型时，它们在给定联合类型时变得可分配。例如，采取以下措施：
````typescript
type ToArray<Type> = Type extends any ? Type[] : never;
````

如果我们将联合类型插入 ToArray，那么条件类型将应用于该联合的每个成员。
````typescript
type ToArray<Type> = Type extends any ? Type[] : never;
 
// type StrArrOrNumArr = string[] | number[]
type StrArrOrNumArr = ToArray<string | number>;           
````

这里发生的是 `ToArray` 分布在：
````typescript
string | number;
````

并将联合的每个成员类型映射到有效的内容：
````typescript
ToArray<string> | ToArray<number>;
````

这给我们留下了：
````typescript
string[] | number[];
````

通常，分配性是期望的行为。为避免这种行为，你可以用方括号将 extends 关键字的每一侧括起来。
````typescript
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
 
// 'ArrOfStrOrNum' is no longer a union.
// type ArrOfStrOrNum = (string | number)[]
type ArrOfStrOrNum = ToArrayNonDist<string | number>;
````

### 映射类型
当你不想重复自己时，有时一种类型需要基于另一种类型。

映射类型建立在索引签名的语法之上，用于声明未提前声明的属性类型：
````typescript
type OnlyBoolsAndHorses = {
  [key: string]: boolean | Horse;
};
 
const conforms: OnlyBoolsAndHorses = {
  del: true,
  rodney: false,
};
````

映射类型是一种泛型类型，它使用 `PropertyKey` 的联合（经常创建的 通过 `keyof`）来迭代键来创建类型：
````typescript
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
````

在此示例中，OptionsFlags 将获取 Type 类型的所有属性并将其值更改为布尔值。
````typescript
type Features = {
  darkMode: () => void;
  newUserProfile: () => void;
};
 
// type FeatureOptions = {
//     darkMode: boolean;
//     newUserProfile: boolean;
// }
type FeatureOptions = OptionsFlags<Features>;       
````

#### 映射修饰符
在映射期间可以应用两个额外的修饰符：`readonly` 和 `?` 分别影响可变性和可选性。

你可以通过添加前缀 `-` 或 `+` 来移除或添加这些修饰符。如果你不添加前缀，则假定为 `+`。
````typescript
// Removes 'readonly' attributes from a type's properties
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};
 
type LockedAccount = {
  readonly id: string;
  readonly name: string;
};
 
// type UnlockedAccount = {
//     id: string;
//     name: string;
// }
type UnlockedAccount = CreateMutable<LockedAccount>;       
````

````typescript
// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};
 
type MaybeUser = {
  id: string;
  name?: string;
  age?: number;
};
 
// type User = {
//     id: string;
//     name: string;
//     age: number;
// }
type User = Concrete<MaybeUser>;  
````

#### 通过 `as` 重新映射键

在 TypeScript 4.1 及更高版本中，你可以使用映射类型中的 `as` 子句重新映射映射类型中的键：
````typescript
type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as NewKeyType]: Type[Properties]
}
````

你可以利用 `模板字面类型` 等功能从以前的属性名称中创建新的属性名称：
````typescript
type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};
 
interface Person {
    name: string;
    age: number;
    location: string;
}
 
// type LazyPerson = {
//     getName: () => string;
//     getAge: () => number;
//     getLocation: () => string;
// }
type LazyPerson = Getters<Person>;     
````

你可以通过条件类型生成 `never` 来过滤掉键：
````typescript
// Remove the 'kind' property
type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};
 
interface Circle {
    kind: "circle";
    radius: number;
}
 
// type KindlessCircle = {
//     radius: number;
// }
type KindlessCircle = RemoveKindField<Circle>;       
````

你可以映射任意联合，不仅是 `string` | `number` | `symbol` 的联合，还可以映射任何类型的联合：
````typescript
type EventConfig<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (event: E) => void;
}
 
type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };
 
// type Config = {
//     square: (event: SquareEvent) => void;
//     circle: (event: CircleEvent) => void;
// }
type Config = EventConfig<SquareEvent | CircleEvent>   
````

#### 进一步探索

映射类型与此类型操作部分中的其他功能配合得很好，例如这里是 使用条件类型的映射类型，它返回 `true` 或 `false`，具体取决于对象是否将属性 `pii` 设置为字面 `true`：
````typescript
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};
 
type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};
 
// type ObjectsNeedingGDPRDeletion = {
//     id: false;
//     name: true;
// }
type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;             
````

### 模板字面类型
模板字面类型建立在 字符串字面类型 之上，并且能够通过联合扩展成许多字符串。

当在插值位置使用联合时，类型是可以由每个联合成员表示的每个可能的字符串字面的集合：
````typescript
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
 
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
````

对于模板字面中的每个插值位置，联合是交叉相乘的：
````typescript
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
type Lang = "en" | "ja" | "pt";
 
type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
````

#### 类型中的字符串联合
````typescript
type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};
 
/// Create a "watched object" with an `on` method
/// so that you can watch for changes to properties.
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
````

有了这个，我们可以构建一些在给定错误属性时出错的东西：
````typescript
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});
 
person.on("firstNameChanged", () => {});
 
// Prevent easy human error (using the key instead of the event name)
// Argument of type '"firstName"' is not assignable to parameter of type '"firstNameChanged" | "lastNameChanged" | "ageChanged"'.
person.on("firstName", () => {});
 
// It's typo-resistant
// Argument of type '"frstNameChanged"' is not assignable to parameter of type '"firstNameChanged" | "lastNameChanged" | "ageChanged"'.
person.on("frstNameChanged", () => {});
````

````typescript
type PropEventSource<Type> = {
    on<Key extends string & keyof Type>
        (eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void;
};
 
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
 
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});
 
// (parameter) newName: string
person.on("firstNameChanged", newName => {
    console.log(`new name is ${newName.toUpperCase()}`);
});
 
// (parameter) newAge: number
person.on("ageChanged", newAge => {                          
    if (newAge < 0) {
        console.warn("warning! negative age");
    }
})
````

#### 内在字符串操作类型
为了帮助进行字符串操作，TypeScript 包含一组可用于字符串操作的类型。这些类型内置在编译器中以提高性能，在 TypeScript 附带的 .d.ts 文件中找不到。

##### Uppercase<StringType>

将字符串中的每个字符转换为大写版本。
````typescript
type Greeting = "Hello, world"
// type ShoutyGreeting = "HELLO, WORLD"
type ShoutyGreeting = Uppercase<Greeting>
           
type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`
// type MainID = "ID-MY_APP"
type MainID = ASCIICacheKey<"my_app">
````

##### Lowercase<StringType>

将字符串中的每个字符转换为等效的小写字母。
````typescript
type Greeting = "Hello, world"
// type QuietGreeting = "hello, world"
type QuietGreeting = Lowercase<Greeting>
          
type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`
// type MainID = "id-my_app"
type MainID = ASCIICacheKey<"MY_APP">    
````

##### Capitalize<StringType>

将字符串中的第一个字符转换为等效的大写字母。
````typescript
type LowercaseGreeting = "hello, world";
// type Greeting = "Hello, world"
type Greeting = Capitalize<LowercaseGreeting>;
````

##### Uncapitalize<StringType>

将字符串中的第一个字符转换为等效的小写字母。
````typescript
type UppercaseGreeting = "HELLO WORLD";
// type UncomfortableGreeting = "hELLO WORLD"
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
````


## 类

#### 超类调用
就像在 JavaScript 中一样，如果你有一个基类，在使用任何 `this.` 成员之前，你需要在构造函数主体中调用 `super();`：
````typescript
class Base {
  k = 4;
}
 
class Derived extends Base {
  constructor() {
    // Prints a wrong value in ES5; throws exception in ES6
    console.log(this.k);
    // error 'super' must be called before accessing 'this' in the constructor of a derived class.
    super();
  }
}
````

#### 获取器/设置器

类也可以有访问器：
````typescript
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(value) {
    this._length = value;
  }
}
````

> 请注意，没有额外逻辑的由字段支持的 get/set 对在 JavaScript 中很少有用。如果你不需要在 get/set 操作期间添加其他逻辑，则可以公开公共字段。

TypeScript 对访问器有一些特殊的推断规则：
- 如果 `get` 存在但没有 `set`，则属性自动为 `readonly`
- 如果不指定 `setter` 参数的类型，则从 `getter` 的返回类型推断

从 TypeScript 4.3 开始，可以使用不同类型的访问器来获取和设置。
````typescript
class Thing {
  _size = 0;
 
  get size(): number {
    return this._size;
  }
 
  set size(value: string | number | boolean) {
    let num = Number(value);
 
    // Don't allow NaN, Infinity, etc
 
    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }
 
    this._size = num;
  }
}
````

#### 索引签名

类可以声明索引签名；这些工作与 其他对象类型的索引签名 相同：
````typescript
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);
 
  check(s: string) {
    return this[s] as boolean;
  }
}
````
因为索引签名类型还需要捕获方法的类型，所以要有效地使用这些类型并不容易。通常最好将索引数据存储在另一个地方而不是类实例本身。

### 类继承
#### implements

你可以使用 implements 子句来检查一个类是否满足特定的 interface。如果一个类未能正确实现它，则会触发错误：
````typescript
interface Pingable {
  ping(): void;
}
 
class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}
 
//  error Class 'Ball' incorrectly implements interface 'Pingable'. Property 'ping' is missing in type 'Ball' but required in type 'Pingable'.
class Ball implements Pingable {
  pong() {
    console.log("pong!");
  }
}
````

类也可以实现多个接口，例如 `class C implements A, B {`。

重要的是要理解 `implements` 子句只是检查类可以被视为接口类型。它根本不会改变类的类型或其方法。常见的错误来源是假设 `implements` 子句将更改类类型 - 事实并非如此！
````typescript
interface Checkable {
  check(name: string): boolean;
}
 
class NameChecker implements Checkable {
  //error Parameter 's' implicitly has an 'any' type.
  check(s) {
    // Notice no error here
    return s.toLowerCase() === "ok";
  }
}
````

同样，使用可选属性实现接口不会创建该属性：
````typescript
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
// Property 'y' does not exist on type 'C'.
c.y = 10;
````

#### extends

类可能来自基类。派生类具有其基类的所有属性和方法，还可以定义额外的成员。
````typescript
class Animal {
  move() {
    console.log("Moving along!");
  }
}
 
class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}
 
const d = new Dog();
// Base class method
d.move();
// Derived class method
d.woof(3);
````

##### 覆盖方法
派生类也可以覆盖基类字段或属性。你可以使用 `super.` 语法来访问基类方法。请注意，因为 JavaScript 类是一个简单的查找对象，所以没有 “超级字段” 的概念。

TypeScript 强制派生类始终是其基类的子类型。

例如，这是覆盖方法的合法方式：
````typescript
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
 
class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}
 
const d = new Derived();
d.greet();
d.greet("reader");
````

如果 Derived 不遵守 Base 的合同怎么办？
````typescript
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
 
class Derived extends Base {
  // Make this parameter required
  greet(name: string) {
    // Property 'greet' in type 'Derived' is not assignable to the same property in base type 'Base'. Type '(name: string) => void' is not assignable to type '() => void'. Target signature provides too few arguments. Expected 1 or more, but got 0.
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
````

##### 仅类型字段声明
当 `target >= ES2022` 或 `useDefineForClassFields` 为 `true` 时，在父类构造函数完成后初始化类字段，覆盖父类设置的任何值。当你只想为继承的字段重新声明更准确的类型时，这可能会成为问题。为了处理这些情况，你可以写 `declare` 来向 TypeScript 表明这个字段声明不应该有运行时影响。
````typescript
interface Animal {
  dateOfBirth: any;
}
 
interface Dog extends Animal {
  breed: any;
}
 
class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}
 
class DogHouse extends AnimalHouse {
  // Does not emit JavaScript code,
  // only ensures the types are correct
  declare resident: Dog;
  constructor(dog: Dog) {
    super(dog);
  }
}
````

##### 初始化顺序
在某些情况下，JavaScript 类的初始化顺序可能会令人惊讶。让我们考虑这段代码：
````typescript
class Base {
  name = "base";
  constructor() {
    console.log("My name is " + this.name);
  }
}
 
class Derived extends Base {
  name = "derived";
}
 
// Prints "base", not "derived"
const d = new Derived();
````

JavaScript 定义的类初始化顺序是：
- 基类字段被初始化
- 基类构造函数运行
- 派生类字段被初始化
- 派生类构造函数运行
  
这意味着基类构造函数在其自己的构造函数中看到了自己的 name 值，因为派生类字段初始化尚未运行。

##### 继承内置类型
在 ES2015 中，返回对象的构造函数隐式地将 this 的值替换为 super(...) 的任何调用者。生成的构造函数代码必须捕获 super(...) 的任何潜在返回值并将其替换为 this。

因此，Error、Array 和其他子类可能不再按预期工作。这是因为 Error、Array 等的构造函数使用 ECMAScript 6 的 new.target 来调整原型链；但是，在 ECMAScript 5 中调用构造函数时，无法确保 new.target 的值。默认情况下，其他下级编译器通常具有相同的限制。

对于如下子类：
````typescript
class MsgError extends Error {
  constructor(m: string) {
    super(m);
  }
  sayHello() {
    return "hello " + this.message;
  }
}
````

你可能会发现：
- 方法可能是构造这些子类返回的对象上的 `undefined`，所以调用 `sayHello` 会导致错误。
- `instanceof` 将在子类的实例及其实例之间断开，因此 `(new MsgError()) instanceof MsgError` 将返回 `false`。
  
作为建议，你可以在任何 `super(...)` 调用后立即手动调整原型。
````typescript
class MsgError extends Error {
  constructor(m: string) {
    super(m);
 
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MsgError.prototype);
  }
 
  sayHello() {
    return "hello " + this.message;
  }
}
````

但是，MsgError 的任何子类也必须手动设置原型。对于不支持 `Object.setPrototypeOf` 的运行时，你可以改为使用 `__proto__`。

不幸的是，这些解决方法不适用于 Internet Explorer 10 及更早版本。可以手动将原型中的方法复制到实例本身（即 `MsgError.prototype` 到 `this`），但原型链本身无法修复。

### 成员可见性

#### `public`

类成员的默认可见性为 `public`。`public` 成员可以在任何地方访问：
````typescript
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
````
因为 public 已经是默认的可见性修饰符，所以你不需要在类成员上编写它，但出于样式/可读性的原因可能会选择这样做。

#### protected

`protected` 成员仅对声明它们的类的子类可见。
````typescript
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}
 
class SpecialGreeter extends Greeter {
  public howdy() {
    // OK to access protected member here
    console.log("Howdy, " + this.getName());
  }
}
const g = new SpecialGreeter();
g.greet(); // OK
// error Property 'getName' is protected and only accessible within class 'Greeter' and its subclasses.
g.getName();
````

##### 导出 protected 成员
派生类需要遵循其基类契约，但可以选择公开具有更多功能的基类子类型。这包括让 `protected` 成员成为 `public`：
````typescript
class Base {
  protected m = 10;
}
class Derived extends Base {
  // No modifier, so default is 'public'
  m = 15;
}
const d = new Derived();
console.log(d.m); // OK
````

##### 跨层级 protected 访问

TypeScript 不允许访问类层次结构中兄弟类的 `protected` 成员：
````typescript
class Base {
  protected x: number = 1;
}
class Derived1 extends Base {
  protected x: number = 5;
}
class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;
  }
  f2(other: Derived1) {
    // error Property 'x' is protected and only accessible within class 'Derived1' and its subclasses.
    other.x = 10;
  }
}
````

#### private

`private` 类似于 `protected`，但不允许从子类访问成员：
````typescript
class Base {
  private x = 0;
}
const b = new Base();
// Can't access from outside the class
// error Property 'x' is private and only accessible within class 'Base'.
console.log(b.x);

class Derived extends Base {
  showX() {
    // Can't access in subclasses
    // Property 'x' is private and only accessible within class 'Base'.
    console.log(this.x);
  }
}
````

因为 `private` 成员对派生类不可见，所以派生类不能增加它们的可见性：
````typescript
class Base {
  private x = 0;
}
// Class 'Derived' incorrectly extends base class 'Base'. Property 'x' is private in type 'Base' but not in type 'Derived'.
class Derived extends Base {
  x = 1;
}
````

##### 跨实例 private 访问
不同的 OOP 语言对于同一类的不同实例是否可以访问彼此的 `private` 成员存在分歧。虽然 Java、C#、C++、Swift 和 PHP 等语言允许这样做，但 Ruby 不允许。

TypeScript 确实允许跨实例 private 访问：
````typescript
class A {
  private x = 10;
 
  public sameAs(other: A) {
    // No error
    return other.x === this.x;
  }
}
````

##### 警告

与 TypeScript 类型系统的其他方面一样，private 和 protected 仅在类型检查期间强制执行。

这意味着 `in` 或简单属性查找之类的 JavaScript 运行时构造仍然可以访问 `private` 或 `protected` 成员：
````typescript
class MySafe {
  private secretKey = 12345;
}
// In a JavaScript file...
const s = new MySafe();
// Will print 12345
console.log(s.secretKey);
````

`private` 还允许在类型检查期间使用括号表示法进行访问。这使得 `private` 声明的字段可能更容易访问，例如单元测试，缺点是这些字段是软私有的并且不严格执行隐私。
````typescript
class MySafe {
  private secretKey = 12345;
}
 
const s = new MySafe();
 
// Not allowed during type checking
// Property 'secretKey' is private and only accessible within class 'MySafe'.
console.log(s.secretKey);
 
// OK
console.log(s["secretKey"]);
````

与 TypeScripts 的 `private` 不同，JavaScript 的 私有字段 `(#)` 在编译后仍然是私有的，并且不提供前面提到的像括号符号访问这样的转义舱口，这使得它们很难私有。

如果你需要保护类中的值免受恶意行为者的侵害，你应该使用提供硬运行时隐私的机制，例如闭包、WeakMaps 或私有字段。请注意，这些在运行时添加的隐私检查可能会影响性能。


### 静态成员

类可能有 `static` 个成员。这些成员不与类的特定实例相关联。它们可以通过类构造函数对象本身访问：
````typescript
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
````

静态成员也可以使用相同的 `public`、`protected` 和 `private` 可见性修饰符：
````typescript
class MyClass {
  private static x = 0;
}
// error Property 'x' is private and only accessible within class 'MyClass'.
console.log(MyClass.x);
````

静态成员也被继承：
````typescript
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
````

##### 特殊静态名称

从 Function 原型覆盖属性通常是不安全/不可能的。因为类本身就是可以用 `new` 调用的函数，所以不能使用某些 `static` 名称。`name`、`length` 和 `call` 等函数属性无法定义为 `static` 成员：
````typescript
class S {
  // Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'S'.
  static name = "S!";
}
````

##### 为什么没有静态类？
TypeScript（和 JavaScript）没有一个名为 `static class` 的构造，就像 C# 一样。

这些构造之所以存在，是因为这些语言强制所有数据和函数都在一个类中；因为 TypeScript 中不存在该限制，所以不需要它们。只有一个实例的类通常只表示为 JavaScript/TypeScript 中的普通对象。

例如，我们不需要 TypeScript 中的 “静态类” 语法，因为常规对象（甚至顶层函数）也可以完成这项工作：
````typescript
// Unnecessary "static" class
class MyStaticClass {
  static doSomething() {}
}
 
// Preferred (alternative 1)
function doSomething() {}
 
// Preferred (alternative 2)
const MyHelperObject = {
  dosomething() {},
};
````

#### `static` 类中的块

静态块允许你编写具有自己作用域的语句序列，这些语句可以访问包含类中的私有字段。这意味着我们可以编写具有编写语句的所有功能的初始化代码，不会泄漏变量，并且可以完全访问我们类的内部结构。
````typescript
class Foo {
    static #count = 0;
 
    get count() {
        return Foo.#count;
    }
 
    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
````

### 泛型类

类，很像接口，可以是泛型的。当使用 `new` 实例化泛型类时，其类型参数的推断方式与函数调用中的方式相同：
````typescript
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}
 
// const b: Box<string>
const b = new Box("hello!");
````

#### 静态成员中的类型参数

此代码不合法​​，原因可能并不明显：
````typescript
class Box<Type> {
  // error Static members cannot reference class type parameters.
  static defaultValue: Type;
}
````
请记住，类型总是被完全擦除！在运行时，只有一个 `Box.defaultValue` 属性槽。这意味着设置 `Box<string>.defaultValue`（如果可能的话）也会更改 `Box<number>.defaultValue` - 不好。泛型类的 `static` 成员永远不能引用类的类型参数。


#### 类运行时的 `this`

JavaScript 对 `this` 的处理确实不寻常：
````typescript
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}
const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};
 
// Prints "obj", not "MyClass"
console.log(obj.getName());
````
长话短说，默认情况下，函数中 `this` 的值取决于函数的调用方式。在这个例子中，因为函数是通过 `obj` 引用调用的，所以它的 `this` 的值是 `obj` 而不是类实例。

这很少是你想要发生的！TypeScript 提供了一些减轻或防止此类错误的方法。
##### 箭头函数

如果你有一个经常以丢失其 `this` 上下文的方式调用的函数，则使用箭头函数属性而不是方法定义是有意义的：
````typescript
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}
const c = new MyClass();
const g = c.getName;
// Prints "MyClass" instead of crashing
console.log(g());
````

这有一些权衡：
- `this` 值保证在运行时是正确的，即使对于未使用 TypeScript 检查的代码也是如此
- 这将使用更多内存，因为每个类实例都会有自己的每个以这种方式定义的函数的副本
- 你不能在派生类中使用 `super.getName`，因为原型链中没有条目可以从中获取基类方法
  
##### `this` 参数

在方法或函数定义中，名为 `this` 的初始参数在 TypeScript 中具有特殊含义。这些参数在编译期间被删除：
````typescript
// TypeScript input with 'this' parameter
function fn(this: SomeType, x: number) {
  /* ... */
}
````

TypeScript 检查是否使用正确的上下文调用带有 `this` 参数的函数。我们可以不使用箭头函数，而是在方法定义中添加一个 `this` 参数，以静态强制方法被正确调用：
````typescript
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// OK
c.getName();
 
// Error, would crash
const g = c.getName;
// error The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.
console.log(g());
````

此方法与箭头函数方法进行了相反的权衡：
- JavaScript 调用者可能仍然不正确地使用类方法而没有意识到
- 每个类定义只分配一个函数，而不是每个类实例一个
- 仍然可以通过 `super` 调用基本方法定义。

#### `this` 类型

在类中，一种称为 `this` 的特殊类型动态地引用当前类的类型。让我们看看这有什么用处：
````typescript
class Box {
  contents: string = "";
  // (method) Box.set(value: string): this
  set(value: string) {
    this.contents = value;
    return this;
  }
}
````

在这里，TypeScript 推断 `set` 的返回类型为 `this`，而不是 `Box`。现在让我们创建一个 `Box` 的子类：
````typescript
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}
 
const a = new ClearableBox();
// const b: ClearableBox
const b = a.set("hello");
````

你还可以在参数类型注释中使用 `this`：
````typescript
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
````

这与编写 `other: Box` 不同 - 如果你有一个派生类，它的 `sameAs` 方法现在将只接受同一个派生类的其他实例：
````typescript
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
 
class DerivedBox extends Box {
  otherContent: string = "?";
}
 
const base = new Box();
const derived = new DerivedBox();
// Argument of type 'Box' is not assignable to parameter of type 'DerivedBox'.
// Property 'otherContent' is missing in type 'Box' but required in type 'DerivedBox'.
derived.sameAs(base);
````

#### this 型防护

你可以在类和接口中的方法的返回位置使用 `this is Type`。当与类型缩小（例如 if 语句）混合时，目标对象的类型将缩小到指定的 Type。
````typescript
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}
 
class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}
 
class Directory extends FileSystemObject {
  children: FileSystemObject[];
}
 
interface Networked {
  host: string;
}
 
const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");
 
if (fso.isFile()) {
  // const fso: FileRep
  fso.content;
} else if (fso.isDirectory()) {
  // const fso: Directory
  fso.children;
} else if (fso.isNetworked()) {
  // const fso: Networked & FileSystemObject
  fso.host;
}
````

基于 `this` 的类型保护的一个常见用例是允许对特定字段进行延迟验证。例如，当 `hasValue` 被验证为真时，这种情况会从框中保存的值中删除 `undefined`：
````typescript
class Box<T> {
  value?: T;
 
  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}
 
const box = new Box<string>();
box.value = "Gameboy";
 
// (property) Box<string>.value?: string
// box.value;
     
if (box.hasValue()) {
  // (property) value: string
  // box.value;
}
````

### 参数属性

TypeScript 提供了特殊的语法，用于将构造函数参数转换为具有相同名称和值的类属性。这些称为参数属性，是通过在构造函数参数前加上可见性修饰符 public、private、protected 或 readonly 之一来创建的。结果字段获取这些修饰符：
````typescript
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No body necessary
  }
}
const a = new Params(1, 2, 3);
// (property) Params.x: number
console.log(a.x);
             
// error Property 'z' is private and only accessible within class 'Params'.
console.log(a.z);
````

### 类表达式

类表达式与类声明非常相似。唯一真正的区别是类表达式不需要名称，尽管我们可以通过它们最终绑定到的任何标识符来引用它们：
````typescript
const someClass = class<Type> {
  content: Type;
  constructor(value: Type) {
    this.content = value;
  }
};
// const m: someClass<string>
const m = new someClass("Hello, world");
````

### 构造函数签名

JavaScript 类是使用 `new` 运算符实例化的。给定类本身的类型，`InstanceType` 工具类型会对此操作进行建模。
````typescript
class Point {
  createdAt: number;
  x: number;
  y: number
  constructor(x: number, y: number) {
    this.createdAt = Date.now()
    this.x = x;
    this.y = y;
  }
}
type PointInstance = InstanceType<typeof Point>
 
function moveRight(point: PointInstance) {
  point.x += 5;
}
 
const point = new Point(3, 4);
moveRight(point);
point.x; // => 8
````

### `abstract` 类和成员

TypeScript 中的类、方法和字段可能是抽象的。

抽象方法或抽象字段是尚未提供实现的方法。这些成员必须存在于抽象类中，不能直接实例化。

抽象类的作用是作为实现所有抽象成员的子类的基类。当一个类没有任何抽象成员时，就说它是具体的。

让我们看一个例子：
````typescript
abstract class Base {
  abstract getName(): string;
 
  printName() {
    console.log("Hello, " + this.getName());
  }
}
 
// Cannot create an instance of an abstract class.
const b = new Base();
````

我们不能用 new 实例化 Base，因为它是抽象的。相反，我们需要创建一个派生类并实现抽象成员：
````typescript
class Derived extends Base {
  getName() {
    return "world";
  }
}
 
const d = new Derived();
d.printName();
````

## 模块

### 工具类型

#### `Awaited<Type>`

此类型旨在对 `async` 函数中的 `await` 或 `Promise` 中的 `.then()` 方法等操作进行建模 - 具体来说，他们递归地解开 `Promise` 的方式。
````typescript
// type A = string
type A = Awaited<Promise<string>>;
    
// type B = number
type B = Awaited<Promise<Promise<number>>>;
    
// type C = number | boolean
type C = Awaited<boolean | Promise<number>>;
````

#### `Partial<Type>`

构造一个将 `Type` 的所有属性设置为可选的类型。此工具将返回一个表示给定类型的所有子集的类型。
````typescript
interface Todo {
  title: string;
  description: string;
}
 
function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}
 
const todo1 = {
  title: "organize desk",
  description: "clear clutter",
};
 
const todo2 = updateTodo(todo1, {
  description: "throw out trash",
});
````

#### `Required<Type>`

构造一个由设置为 `required` 的 Type 的所有属性组成的类型。与 Partial 相反.
````typescript
interface Props {
  a?: number;
  b?: string;
}
 
const obj: Props = { a: 5 };
 
// Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.
const obj2: Required<Props> = { a: 5 };
````

#### `Readonly<Type>`

构造一个将 Type 的所有属性设置为 readonly 的类型，这意味着构造类型的属性不能重新分配。
````typescript
interface Todo {
  title: string;
}
 
const todo: Readonly<Todo> = {
  title: "Delete inactive users",
};
 
// Cannot assign to 'title' because it is a read-only property.
todo.title = "Hello";
````

#### `Record<Keys, Type>`

构造一个对象类型，其属性键为 `Keys`，其属性值为 Type。此工具可用于将一种类型的属性映射到另一种类型。
````typescript
type CatName = "miffy" | "boris" | "mordred";
 
interface CatInfo {
  age: number;
  breed: string;
}
 
const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: "Persian" },
  boris: { age: 5, breed: "Maine Coon" },
  mordred: { age: 16, breed: "British Shorthair" },
};
 
// const cats: Record<CatName, CatInfo>
cats.boris;
````

#### `Pick<Type, Keys>`

通过从 `Type` 中选取一组属性 `Keys`（字符串字面或字符串字面的并集）来构造一个类型。
````typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}
 
type TodoPreview = Pick<Todo, "title" | "completed">;
 
const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
````

#### `Omit<Type, Keys>`

通过从 `Type` 中选择所有属性然后删除 `Keys`（字符串字面或字符串字面的并集）来构造一个类型。与 `Pick` 相反。
````typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}
 
type TodoPreview = Omit<Todo, "description">;
 
const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
  createdAt: 1615544252770,
};

type TodoInfo = Omit<Todo, "completed" | "createdAt">;
 
const todoInfo: TodoInfo = {
  title: "Pick up kids",
  description: "Kindergarten closes at 5pm",
};
````

#### `Exclude<UnionType, ExcludedMembers>`

通过从 `UnionType` 中排除所有可分配给 `ExcludedMembers` 的联合成员来构造一个类型。
````typescript
// type T0 = "b" | "c"
type T0 = Exclude<"a" | "b" | "c", "a">;
     
// type T1 = "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
     
// type T2 = string | number
type T2 = Exclude<string | number | (() => void), Function>;
     
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
 
// type T3 = {
//     kind: "square";
//     x: number;
// } | {
//     kind: "triangle";
//     x: number;
//     y: number;
// }
type T3 = Exclude<Shape, { kind: "circle" }> 
````

#### `Extract<Type, Union>`

通过从 `Type` 中提取所有可分配给 `Union` 的联合成员来构造一个类型。
````typescript
// type T0 = "a"
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
     
// type T1 = () => void
type T1 = Extract<string | number | (() => void), Function>;
     
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
 
// type T2 = {
//     kind: "circle";
//     radius: number;
// }
type T2 = Extract<Shape, { kind: "circle" }> 
````

#### `NonNullable<Type>`

通过从 `Type` 中排除 `null` 和 `undefined` 来构造一个类型。
````typescript
// type T0 = string | number
type T0 = NonNullable<string | number | undefined>;
     
// type T1 = string[]
type T1 = NonNullable<string[] | null | undefined>;
````

#### `Parameters<Type>`

从函数类型 `Type` 的参数中使用的类型构造元组类型。

对于重载函数，这将是最后一个签名的参数；
````typescript
declare function f1(arg: { a: number; b: string }): void;
 
// type T0 = []
type T0 = Parameters<() => string>;
     
// type T1 = [s: string]
type T1 = Parameters<(s: string) => void>;
     
// type T2 = [arg: unknown]
type T2 = Parameters<<T>(arg: T) => T>;
     
// type T3 = [arg: {
//     a: number;
//     b: string;
// }]
type T3 = Parameters<typeof f1>;
     
// type T4 = unknown[]
type T4 = Parameters<any>;
     
// type T5 = never
type T5 = Parameters<never>;
     
// Type 'string' does not satisfy the constraint '(...args: any) => any'.
// type T6 = never
type T6 = Parameters<string>;
     
// Type 'Function' does not satisfy the constraint '(...args: any) => any'.
// Type 'Function' provides no match for the signature '(...args: any): any'.
// type T7 = never
type T7 = Parameters<Function>;
````

#### `ConstructorParameters<Type>`

从构造函数类型的类型构造元组或数组类型。它生成一个包含所有参数类型的元组类型（如果 `Type` 不是函数，则生成类型 `never`）。
````typescript
// type T0 = [message?: string]
type T0 = ConstructorParameters<ErrorConstructor>;
     
// type T1 = string[]
type T1 = ConstructorParameters<FunctionConstructor>;
     
// type T2 = [pattern: string | RegExp, flags?: string]
type T2 = ConstructorParameters<RegExpConstructor>;
     
class C {
  constructor(a: number, b: string) {}
}
// type T3 = [a: number, b: string]
type T3 = ConstructorParameters<typeof C>;
     
// type T4 = unknown[]
type T4 = ConstructorParameters<any>;
     
 
// Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.
// Type 'Function' provides no match for the signature 'new (...args: any): any'.
// type T5 = never
type T5 = ConstructorParameters<Function>;     
````

#### `ReturnType<Type>`

构造一个由函数 `Type` 的返回类型组成的类型。

对于重载函数，这将是最后一个签名的返回类型；
````typescript
declare function f1(): { a: number; b: string };
 
// type T0 = string
type T0 = ReturnType<() => string>;
     
// type T1 = void
type T1 = ReturnType<(s: string) => void>;
     
// type T2 = unknown
type T2 = ReturnType<<T>() => T>;
     
// type T3 = number[]
type T3 = ReturnType<<T extends U, U extends number[]>() => T>;
     
// type T4 = {
//     a: number;
//     b: string;
// }
type T4 = ReturnType<typeof f1>;
     
// type T5 = any
type T5 = ReturnType<any>;
     
// type T6 = never
type T6 = ReturnType<never>;
     
// Type 'string' does not satisfy the constraint '(...args: any) => any'.
// type T7 = any
type T7 = ReturnType<string>;
     
// Type 'Function' does not satisfy the constraint '(...args: any) => any'.
// Type 'Function' provides no match for the signature '(...args: any): any'.
// type T8 = any
type T8 = ReturnType<Function>; 
````

#### `InstanceType<Type>`

构造一个由 `Type` 中的构造函数的实例类型组成的类型
````typescript
class C {
  x = 0;
  y = 0;
}
 
// type T0 = C
type T0 = InstanceType<typeof C>;
     
// type T1 = any
type T1 = InstanceType<any>;
     
// type T2 = never
type T2 = InstanceType<never>;
     
// Type 'string' does not satisfy the constraint 'abstract new (...args: any) => any'.
// type T3 = any
type T3 = InstanceType<string>;
     
// Type 'Function' does not satisfy the constraint 'abstract new (...args: any) => any'.
  // Type 'Function' provides no match for the signature 'new (...args: any): any'.
// type T4 = any
type T4 = InstanceType<Function>;
````
##### 核心功能
1. 从构造函数提取实例类型
2. 自动推断类实例的所有属性和方法
3. 保持完整的类型信息

##### 基本用法示例
````typescript
class User {
  constructor(public name: string, public age: number) {}
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

// 获取User类的实例类型
type UserInstance = InstanceType<typeof User>;

// 等价于:
// type UserInstance = User;

const user: UserInstance = new User("Alice", 30);
user.greet(); // 正常调用方法
````

##### 典型应用场景
````typescript
function createInstance<T extends new (...args: any[]) => any>(
  cls: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new cls(...args);
}

const user = createInstance(User, "Bob", 25); // 类型自动推断为User
````

````typescript
// 工厂模式
interface Factory<T extends new (...args: any[]) => any> {
  create(...args: ConstructorParameters<T>): InstanceType<T>;
}

class UserFactory implements Factory<typeof User> {
  create(name: string, age: number) {
    return new User(name, age);
  }
}
````

````typescript
function withLogging<T extends new (...args: any[]) => any>(BaseClass: T) {
  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Instance created from ${BaseClass.name}`);
    }
  } as T; // 保持原始构造函数类型
}

const LoggedUser = withLogging(User);
type LoggedUserInstance = InstanceType<typeof LoggedUser>;
````

##### 与相关类型的比较
| 特性                       | 事件驱动架构                | 中介者模式                                              |
| -------------------------- | --------------------------- | ------------------------------------------------------- |
| `InstanceType<T>`          | 获取构造函数T的实例类型     | `InstanceType<typeof User>`                             |
| `ConstructorParameters<T>` | 获取构造函数T的参数类型元组 | `ConstructorParameters<typeof User> → [string, number]` |
| `ReturnType<T>`            | 获取函数T的返回值类型       | `ReturnType<() => User> → User`                         |

##### 高级用法
````typescript
// 组合多个工具类型
class Controller {
  constructor(public id: string) {}
}

type ControllerMap = {
  [key: string]: typeof Controller;
};

type AppInstances = {
  [K in keyof ControllerMap]: InstanceType<ControllerMap[K]>;
};
````

````typescript
// 处理抽象类
abstract class Animal {
  abstract makeSound(): void;
}

type AnimalInstance = InstanceType<typeof Animal>; // Error: 无法获取抽象类的实例类型

// 解决方案：使用类型断言
type ConcreteAnimal = InstanceType<typeof Animal as new () => Animal>;
````

````typescript
// 与泛型约束结合
function cloneInstance<T extends new (...args: any[]) => any>(
  instance: InstanceType<T>
): InstanceType<T> {
  const ctor = instance.constructor as T;
  return new ctor(...Object.values(instance));
}
````

##### 注意事项
1. **不能用于抽象类**：直接应用于抽象类会导致类型错误
2. **需要 `typeof` 操作符**：对类直接使用需要先获取构造函数类型
3. **ES5 兼容性**：在 ES5 目标下，类方法的 `this` 类型可能不准确
4. **私有字段**：实例类型会包含私有字段，但外部无法访问
  
#### `NoInfer<Type>`

阻止对所包含类型的推断。除了阻止推断之外，`NoInfer<Type>` 与 `Type` 相同。
````typescript
function createStreetLight<C extends string>(
  colors: C[],
  defaultColor?: NoInfer<C>,
) {
  // ...
}
createStreetLight(["red", "yellow", "green"], "red");  // OK
createStreetLight(["red", "yellow", "green"], "blue");  // Error
````
#### `ThisParameterType<Type>`

提取函数类型的 `this` 参数的类型，如果函数类型没有 `this` 参数，则提取 `unknown`。
````typescript
function toHex(this: Number) {
  return this.toString(16);
}
 
function numberToString(n: ThisParameterType<typeof toHex>) {
  return toHex.apply(n);
}
````

#### `OmitThisParameter<Type>`

从 `Type` 中删除 `this` 参数。如果 `Type` 没有显式声明的 `this` 参数，则结果只是 `Type`。否则，将从 `Type` 创建一个没有 `this` 参数的新函数类型。泛型被删除，只有最后一个重载签名被传播到新的函数类型中。
````typescript
function toHex(this: Number) {
  return this.toString(16);
}
 
const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);
 
console.log(fiveToHex());
````

````typescript
class Greeter {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  greet(this: Greeter) {
    return `Hello, ${this.name}`;
  }
}

// 错误：直接调用会丢失 this 上下文
const greetFunc: () => string = new Greeter("Alice").greet; // 类型错误

// 正确：使用 OmitThisParameter
const safeGreetFunc: OmitThisParameter<typeof Greeter.prototype.greet> = new Greeter("Alice").greet;
// 现在类型是 () => string
````

##### 实现原理
````typescript
type OmitThisParameter<T> = 
  unknown extends ThisParameterType<T> 
    ? T 
    : T extends (...args: infer A) => infer R 
      ? (...args: A) => R 
      : T;
````
这个类型：
1. 首先检查 `T` 是否有 `this` 参数（使用 `ThisParameterType<T>`）
2. 如果没有，直接返回 `T`
3. 如果有，提取剩余参数 `(...args: infer A)` 和返回类型 `(infer R)`，然后构造一个新的函数类型
  
##### 注意事项
1. 这只是一个类型操作，不会影响运行时行为
2. 移除了 `this` 类型检查后，实际调用时仍需确保正确的 `this` 上下文
3. 主要用于类型系统操作，而不是运行时函数转换


#### `ThisType<Type>`

此工具不返回转换后的类型。相反，它用作上下文 `this` 类型的标记。请注意，必须启用 `noImplicitThis` 标志才能使用此工具。
````typescript
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M
};
 
function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  let data: object = desc.data || {};
  let methods: object = desc.methods || {};
  return { ...data, ...methods } as D & M;
}
 
let obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // Strongly typed this
      this.y += dy; // Strongly typed this
    },
  },
});
 
obj.x = 10;
obj.y = 20;
obj.moveBy(5, 5);
````

在上面的示例中，`makeObject` 参数中的 `methods` 对象具有包含 `ThisType<D & M>` 的上下文类型，因此 `methods` 对象内的方法中的 `this` 类型是 `{ x: number, y: number } & { moveBy(dx: number, dy: number): void }`。请注意 `methods` 属性的类型如何同时是方法中 `this` 类型的推断目标和源。
`ThisType<T>` 标记接口只是在 lib.d.ts 中声明的一个空接口。除了在对象字面的上下文类型中被识别之外，接口的行为就像任何空接口。

## 装饰器

随着 TypeScript 和 ES6 中类的引入，现在存在某些需要附加功能来支持注释或修改类和类成员的场景。装饰器提供了一种为类声明和成员添加注释和元编程语法的方法。

### 装饰器

装饰器是一种特殊的声明，可以附加到 类声明、方法、`accessor`、属性 或 参数。装饰器使用 `@expression` 形式，其中 `expression` 必须评估为一个函数，该函数将在运行时调用，并带有有关装饰声明的信息。

例如，给定装饰器 `@sealed`，我们可以编写 `sealed` 函数如下：
````typescript
function sealed(target) {
  // do something with 'target' ...
}
````

### 类装饰器

类装饰器是在类声明之前声明的。类装饰器应用于类的构造函数，可用于观察、修改或替换类定义。类装饰器不能在声明文件或任何其他环境上下文中使用（例如在 `declare` 类上）。

类装饰器的表达式将在运行时作为函数调用，装饰类的构造函数作为其唯一参数。

如果类装饰器返回一个值，它将用提供的构造函数替换类声明。

````typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;
 
  constructor(t: string) {
    this.title = t;
  }
}
````

接下来我们有一个示例，说明如何覆盖构造函数以设置新的默认值。
````typescript
function reportableClassDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}
 
@reportableClassDecorator
class BugReport {
  type = "report";
  title: string;
 
  constructor(t: string) {
    this.title = t;
  }
}
 
const bug = new BugReport("Needs dark mode");
console.log(bug.title); // Prints "Needs dark mode"
console.log(bug.type); // Prints "report"
 
// Note that the decorator _does not_ change the TypeScript type
// and so the new property `reportingURL` is not known
// to the type system:
// Property 'reportingURL' does not exist on type 'BugReport'.
bug.reportingURL;
````

### 方法装饰器

方法装饰器在方法声明之前声明。装饰器应用于方法的属性描述符，可用于观察、修改或替换方法定义。方法装饰器不能用于声明文件、重载或任何其他环境上下文（例如在 declare 类中）。

方法装饰器的表达式将在运行时作为函数调用，并带有以下三个参数：
1. 静态成员的类的构造函数，或者实例成员的类的原型。
2. 成员的名称。
3. 成员的属性描述符。

````typescript
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
 
  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
````

### 访问器装饰器

访问器装饰器在访问器声明之前声明。访问器装饰器应用于访问器的属性描述符，可用于观察、修改或替换访问器的定义。不能在声明文件或任何其他环境上下文中使用访问器装饰器（例如在 `declare` 类中）。

访问器装饰器的表达式将在运行时作为函数调用，并带有以下三个参数：

1. 静态成员的类的构造函数，或者实例成员的类的原型。
2. 成员的名称。
3. 成员的属性描述符。

````typescript
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
 
  @configurable(false)
  get x() {
    return this._x;
  }
 
  @configurable(false)
  get y() {
    return this._y;
  }
}
````

### 属性装饰器

属性装饰器是在属性声明之前声明的。不能在声明文件或任何其他环境上下文中使用属性装饰器（例如在 declare 类中）。

属性装饰器的表达式将在运行时作为函数调用，并带有以下两个参数：

1. 静态成员的类的构造函数，或者实例成员的类的原型。
2. 成员的名称。

````typescript
import "reflect-metadata";
const formatMetadataKey = Symbol("format");
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

class Greeter {
  @format("Hello, %s")
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
````

### 参数装饰器
参数装饰器在参数声明之前声明。参数装饰器应用于类构造函数或方法声明的函数。参数装饰器不能在声明文件、重载或任何其他环境上下文中使用（例如在 `declare` 类中）。

参数装饰器的表达式将在运行时作为函数调用，并带有以下三个参数：
1. 静态成员的类的构造函数，或者实例成员的类的原型。
2. 成员的名称。
3. 函数参数列表中参数的序号索引。

````typescript
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");
 
function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}
 
function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;
 
  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}

class BugReport {
  type = "report";
  title: string;
 
  constructor(t: string) {
    this.title = t;
  }
 
  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
     return this.title; 
    }
  }
}
````

### 元数据

一些示例使用为 实验性元数据 API 添加 polyfill 的 `reflect-metadata` 库。这个库还不是 ECMAScript (JavaScript) 标准的一部分。然而，一旦装饰器被正式采用为 ECMAScript 标准的一部分，这些扩展将被提议采用。

## 声明合并

### 接口合并
````typescript
interface Box {
    height: number;
}

interface Box {
    width: number;
}

// 合并后的接口
const box: Box = {
    height: 5,
    width: 6
};
````

合并规则：
- 非函数成员必须唯一，否则类型必须相同
- 函数成员会被视为重载，后声明的接口具有更高优先级

### 命名空间合并
````typescript
namespace Animals {
    export class Dog {}
}

namespace Animals {
    export class Cat {}
}

// 合并后可以访问两个类
const dog = new Animals.Dog();
const cat = new Animals.Cat();
````

### 命名空间与类/函数/枚举合并
#### 与类合并
````typescript
class Album {
    label: Album.AlbumLabel;
}
namespace Album {
    export class AlbumLabel {}
}
````

#### 与函数合并
````typescript
function buildLabel(name: string): string {
    return buildLabel.prefix + name + buildLabel.suffix;
}

namespace buildLabel {
    export let suffix = "";
    export let prefix = "Hello, ";
}
````

#### 与枚举合并
````typescript
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}
namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    } else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    } else if (colorName == "magenta") {
      return Color.red + Color.blue;
    } else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
````
### 合并规则和注意事项
1. **成员唯一性**：非函数成员必须唯一，否则会导致错误
2. **函数重载顺序**：接口合并时，后声明的接口的函数成员具有更高优先级
3. **命名空间合并顺序**：命名空间合并时，后声明的命名空间的导出成员会覆盖先前的同名成员
4. **类和命名空间合并**：命名空间必须位于类声明之后

### 实际应用场景

#### 扩展第三方库的类型定义：
````typescript
// 扩展第三方库的类型
declare module "some-library" {
    interface Config {
      newProperty?: string;
    }
}
````

#### 为已有类添加静态成员：
````typescript
class MyClass {
    instanceMethod() {}
}

namespace MyClass {
    export function staticMethod() {}
}
````

#### 创建复杂的枚举类型：
````typescript
enum LogLevel {
    ERROR,
    WARN,
    INFO,
    DEBUG
}

namespace LogLevel {
    export function toString(level: LogLevel): string {
        // ...
    }
}
````

### 模块扩充

````typescript
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}
// map.ts
import { Observable } from "./observable";
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};
````

这在 TypeScript 中也可以正常工作，但编译器不知道 Observable.prototype.map。你可以使用模块扩充来告诉编译器：
````typescript
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}
// map.ts
import { Observable } from "./observable";
declare module "./observable" {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};
// consumer.ts
import { Observable } from "./observable";
import "./map";
let o: Observable<number>;
o.map((x) => x.toFixed());
````

#### 限制
1. 你不能在扩充中声明新的顶层声明 - 只是对现有声明的补丁。
2. 默认导出也无法增强，只能命名导出（因为你需要通过导出名称来增强导出，并且 `default` 是保留字 - 有关详细信息，请参阅 #14080）


### 全局增强
````typescript
// observable.ts
export class Observable<T> {
  // ... still no implementation ...
}
declare global {
  interface Array<T> {
    toObservable(): Observable<T>;
  }
}
Array.prototype.toObservable = function () {
  // ...
};
````

## 枚举

### 数字枚举
````typescript
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
````
上面，我们有一个数字枚举，其中 `Up` 用 1 初始化。从那时起，以下所有成员都会自动递增。换句话说，`Direction.Up` 的值为 1，`Down` 的值为 2，`Left` 的值为 3，`Right` 的值为 4。

如果我们愿意，我们可以完全不使用初始化器：
````typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
````
在这里，`Up` 的值为 0，`Down` 的值为 1，以此类推。这种自动递增行为对于我们可能不关心成员值本身但要注意每个值与同一个中的其他值不同的情况很有用枚举。

使用枚举很简单：只需将任何成员作为枚举本身的属性访问，并使用枚举的名称声明类型：
````typescript
enum UserResponse {
  No = 0,
  Yes = 1,
}
 
function respond(recipient: string, message: UserResponse): void {
  // ...
}
 
respond("Princess Caroline", UserResponse.Yes);
````

数字枚举可以在 计算成员和常量成员（见下文） 中混合使用。简短的故事是，没有初始化器的枚举要么需要放在第一位，要么必须在使用数字常量或其他常量枚举成员初始化的数字枚举之后。换句话说，以下是不允许的：
````typescript
enum E {
  A = getSomeValue(),
  B,
  // Enum member must have initializer.
}
````

### 字符串枚举

字符串枚举是一个类似的概念，但有一些微妙的 运行时差异，如下所述。在字符串枚举中，每个成员都必须使用字符串字面或另一个字符串枚举成员进行常量初始化。
````typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
````

虽然字符串枚举没有自动递增行为，但字符串枚举的好处是它们 “serialize” 很好。换句话说，如果你正在调试并且必须读取数字枚举的运行时值，则该值通常是不透明的 - 它本身并没有传达任何有用的含义（尽管 反向映射 通常可以提供帮助）。字符串枚举允许你在代码运行时提供有意义且可读的值，而与枚举成员本身的名称无关。

### 计算枚举

````typescript
enum FileAccess {
  // constant members
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // computed member
  G = "123".length,
}
````

### 联合枚举和枚举成员类型
有一个不计算的常量枚举成员的特殊子集：字面枚举成员。字面枚举成员是没有初始化值的常量枚举成员，或者具有初始化为的值
- 任何字符串字面（例如 "foo"、"bar"、"baz"）
- 任何数字字面（例如 1、100）
- 应用于任何数字字面的一元减号（例如 -1、-100）

当枚举中的所有成员都具有字面枚举值时，一些特殊的语义就会发挥作用。
首先是枚举成员也变成了类型！例如，我们可以说某些成员只能具有枚举成员的值：
````typescript
enum ShapeKind {
  Circle,
  Square,
}
 
interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}
 
interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}
 
let c: Circle = {
  kind: ShapeKind.Square,
  // Type 'ShapeKind.Square' is not assignable to type 'ShapeKind.Circle'.
  radius: 100,
};
````

另一个变化是枚举类型本身有效地成为每个枚举成员的联合。使用联合枚举，类型系统能够利用它知道枚举本身中存在的确切值集的事实。正因为如此，TypeScript 可以捕获我们可能会错误地比较值的错误。例如：
````typescript
enum E {
  Foo,
  Bar,
}
 
function f(x: E) {
  // This comparison appears to be unintentional because the types 'E.Foo' and 'E.Bar' have no overlap.
  if (x !== E.Foo || x !== E.Bar) {
    //
  }
}
````

在该示例中，我们首先检查 `x` 是否不是 `E.Foo`。如果检查成功，那么我们的 `||` 将短路，‘if’ 的主体将运行。然而，如果检查不成功，那么 `x` 只能是 `E.Foo`，所以看它是否不等于 `E.Bar` 是没有意义的。

### 编译时的枚举
尽管枚举是运行时存在的真实对象，但 `keyof` 关键字的工作方式与你对典型对象的预期不同。相反，使用 `keyof` `typeof` 获取将所有 Enum 键表示为字符串的类型。
````typescript
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}
 
/**
 
 * This is equivalent to:
 
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;
 
function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key);
    console.log("Log level value is:", num);
    console.log("Log level message is:", message);
  }
}
printImportant("ERROR", "This is a message");
````

#### 反向映射
除了为成员创建具有属性名称的对象外，数字枚举成员还获得从枚举值到枚举名称的反向映射。
````typescript
enum Enum {
  A,
}
 
let a = Enum.A;
let nameOfA = Enum[a]; // "A"
````

#### `const` 枚举

在大多数情况下，枚举是一个完全有效的解决方案。然而，有时要求更严格。为了避免在访问枚举值时支付额外生成的代码和额外的间接成本，可以使用 `const` 枚举。常量枚举是在我们的枚举上使用 `const` 修饰符定义的：
````typescript
const enum Enum {
  A = 1,
  B = A * 2,
}
````

### 迭代器
如果一个对象具有 Symbol.iterator 属性的实现，则该对象被认为是迭代器。一些内置类型，如 `Array`、`Map`、`Set`、`String`、`Int32Array`、`Uint32Array` 等，它们的 Symbol.iterator 属性已经实现。对象上的 Symbol.iterator 函数负责返回要迭代的值列表。

如果我们想采用上面列出的可迭代类型，`Iterable` 是我们可以使用的类型。这是一个例子：
````typescript
function toArray<X>(xs: Iterable<X>): X[] {
  return [...xs]
}
````

另一个区别是 `for..in` 对任何对象进行操作；它用作检查此对象的属性的一种方式。另一方面，`for..of` 主要对可迭代对象的值感兴趣。像 `Map` 和 `Set` 这样的内置对象实现了 Symbol.iterator 属性，允许访问存储的值。
````typescript
let pets = new Set(["Cat", "Dog", "Hamster"]);
pets["species"] = "mammals";
for (let pet in pets) {
  console.log(pet); // "species"
}
for (let pet of pets) {
  console.log(pet); // "Cat", "Dog", "Hamster"
}
````

## 混入

````typescript
class Sprite {
  name = "";
  x = 0;
  y = 0;
 
  constructor(name: string) {
    this.name = name;
  }
}

// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.
 
type Constructor = new (...args: any[]) => {};
 
// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:
 
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _scale = 1;
 
    setScale(scale: number) {
      this._scale = scale;
    }
 
    get scale(): number {
      return this._scale;
    }
  };
}

// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);
 
const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
````

````typescript
// This was our previous constructor:
type Constructor = new (...args: any[]) => {};
// Now we use a generic version which can apply a constraint on
// the class which this mixin is applied to
type GConstructor<T = {}> = new (...args: any[]) => T;

type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // This mixin will only work if it is passed a base
      // class which has setPos defined because of the
      // Positionable constraint.
      this.setPos(0, 20);
    }
  };
}
````

### 混入实现

#### 使用类表达式实现混入
````typescript
// 定义可混入的类
class Jumpable {
    jump() {
        console.log("Jumping!");
    }
}

class Swimmable {
    swim() {
        console.log("Swimming!");
    }
}

// 创建混入类
class Animal {
    // 基础类功能
}

// 应用混入
interface Animal extends Jumpable, Swimmable {}
applyMixins(Animal, [Jumpable, Swimmable]);

// 混入帮助函数
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

// 使用
const animal = new Animal();
animal.jump(); // "Jumping!"
animal.swim(); // "Swimming!"
````
#### 使用高阶函数实现混入
````typescript
// 混入函数
type Constructor<T = {}> = new (...args: any[]) => T;

function Jumpable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        jump() {
            console.log("Jumping!");
        }
    };
}

function Swimmable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        swim() {
            console.log("Swimming!");
        }
    };
}

// 基础类
class Animal {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

// 应用混入
const JumpingSwimmingAnimal = Swimmable(Jumpable(Animal));
const superAnimal = new JumpingSwimmingAnimal("Flipper");
superAnimal.jump(); // "Jumping!"
superAnimal.swim(); // "Swimming!"
````

#### 带构造函数的混入
````typescript
function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        timestamp = Date.now();
    };
}

class User {
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
}

const TimestampedUser = Timestamped(User);
const user = new TimestampedUser("John");
console.log(user.timestamp); // 当前时间戳.0
````

#### 带属性的混入
````typescript
function Activatable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        isActivated = false;

        activate() {
            this.isActivated = true;
        }

        deactivate() {
            this.isActivated = false;
        }
    };
}

const ActivatedUser = Activatable(User);
const activeUser = new ActivatedUser("Alice");
activeUser.activate();
console.log(activeUser.isActivated); // true
````

#### 多重混入组合
````typescript
// 组合多个混入
function applyMixins(...mixins: Array<(base: Constructor) => Constructor>) {
    return mixins.reduce((base, mixin) => mixin(base), class {});
}

const SuperUser = applyMixins(
    base => Timestamped(base),
    base => Activatable(base)
);

const superUser = new SuperUser();
console.log(superUser.timestamp);
superUser.activate();
````
#### 混入的注意事项
1. **类型推断**：混入可能会使类型系统复杂化，确保正确声明接口
2. **构造函数**：混入构造函数时需要小心处理参数
3. **方法覆盖**：当多个混入有同名方法时，后面的混入会覆盖前面的
4. **属性初始化**：混入的属性初始化顺序可能与预期不同

#### 在 React 组件中使用混入
````typescript
// 可打印的混入
function Printable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        print() {
            console.log(this.toString());
        }
    };
}

// 基础组件
class ReactComponent {
    render() {
        return "<div>Base Component</div>";
    }
    
    toString() {
        return this.render();
    }
}

// 应用混入
const PrintableComponent = Printable(ReactComponent);
const component = new PrintableComponent();
component.print(); // 输出渲染结果
````

#### 游戏开发中的混入应用
````typescript
// 可移动混入
function Movable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        x: number = 0;
        y: number = 0;
        
        move(dx: number, dy: number) {
            this.x += dx;
            this.y += dy;
        }
    };
}

// 可渲染混入
function Renderable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        render() {
            console.log(`Rendering at (${this.x}, ${this.y})`);
        }
    };
}

// 基础游戏对象
class GameObject {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

// 创建可移动可渲染的游戏对象
const MovingGameObject = Renderable(Movable(GameObject));
const player = new MovingGameObject("Player");
player.move(10, 5);
player.render(); // "Rendering at (10, 5)"
````

### Symbol

````typescript
// 创建唯一的Symbol
const sym1 = Symbol();
const sym2 = Symbol("description"); // 可选的描述字符串

console.log(sym1 === sym2); // false - 每个Symbol都是唯一的

let sym: symbol = Symbol();

// 使用unique symbol类型（TypeScript特有）
const uniqueSym: unique symbol = Symbol();

// 作为对象的键
const sym = Symbol();
let obj = {
  [sym]: "value",
};
console.log(obj[sym]); // "value"

// 作为对象属性和类成员
const getClassNameSymbol = Symbol();
class C {
  [getClassNameSymbol]() {
    return "C";
  }
}
let c = new C();
let className = c[getClassNameSymbol](); // "C"

// 常量枚举中的 Symbol
enum Symbols {
    FOO = Symbol("foo"),
    BAR = Symbol("bar")
}
````

#### unique symbol
````typescript
const sym3: unique symbol = Symbol();

// 可以用于类型注解
type SymKey = typeof sym3;

interface SymbolicObject {
    [sym3]: string;
}
````

#### `Symbol.asyncIterator`


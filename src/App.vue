<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-14 12:38:52
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-04-15 17:14:04
 * @FilePath: \test-vite\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import type { Num, THelloWorld, Bool, Null, Undefined, NumOrString, Person, Person2, Point, Container, Bird, Fish, Triangle, Circle, Square, Shape } from './components/test-type/index'

// const num: Num = 1;
// const helloWorld: THelloWorld = 'hello world'
// const bool: Bool = true
// const u: Undefined = undefined
// const n: Null = null
// let anything: any = 'true'
// let numOrString: NumOrString = '1'
// const num1: number[] = [1]
// const stirng1: string[] = ['a', 'b', 'c']

// const person: Person = {
//   name: '12',
//   age: 11
// }

// const person2: Person2 = {
//   name: '12',
//   age: 12,
//   address: '112'
// }

// function greet(person: string, date: Date): void {
//   console.log(`Hello ${person}, today is ${date.toDateString()}!`);
// }

// async function getFavoriteNumber(params: number): Promise<number> {
//   return params
// }

// const getFavoriteNumber1 = async (params: number): Promise<number> => params

// stirng1.forEach((s) => { console.log(s.toUpperCase()); })

// function func1(pt: { x: string, y: string }): void {
//   console.log("The coordinate's x value is " + pt.x);
//   console.log("The coordinate's y value is " + pt.y);
// }

// function func2(pt: { x: string, y?: string }): void {
//   if (pt.y !== undefined) {
//     console.log('y:', pt.y)
//   }
// }

// function func3(pt: NumOrString): void {
//   console.log(typeof pt)
//   if (typeof pt === "string") {
//     // In this branch, id is of type 'string'
//     console.log(pt.toUpperCase());
//   } else {
//     // Here, id is of type 'number'
//     console.log(pt);
//   }
// }

// function func4(pt: Point): void {
//   console.log("The coordinate's x value is " + pt.x);
//   console.log("The coordinate's y value is " + pt.y);
// }

// // typeof 类型保护
// function func5(str:
//   | string[]
//   | number
//   | null
// ) {
//   if (str && typeof str === 'object') {
//     for (const i of str) {
//       console.log(`paarms: ${i}`)
//       console.log("\n");
//     }
//   } else {
//     console.log(str)
//   }
// }

// // 相等性缩小 TypeScript 还使用 switch 语句和 ===、!==、== 和 != 等相等性检查来缩小类型。
// function func6(container: Container, factor: number): void {
//   // Remove both 'null' and 'undefined' from the type.
//   if (container.value != null) {
//     console.log(container.value * factor)
//   }
// }

// // JavaScript 有一个运算符来确定对象或其原型链是否具有名称属性：in 运算符。
// function func7(animal: Fish | Bird): void {
//   if ('swim' in animal) {
//     return animal.swim()
//   }
//   return animal.fly()
// }

// // instanceof 在 JavaScript 中，x instanceof Foo 检查 x 的原型链是否包含 Foo.prototype
// function func8(x: Date | string) {
//   if (x instanceof Date) {
//     console.log(x.getUTCDate())
//   } else {
//     console.log(x)
//   }
// }

// // 赋值
// let x: number | string = Math.random() < 0.5 ? 10 : "hello world!";

// // 使用类型谓词 pet is Fish 是本例中的类型谓词。谓词采用 parameterName is Type 的形式，其中 parameterName 必须是当前函数签名中的参数名称。
// function func9(pet: Fish | Bird): pet is Fish {
//   return (pet as Fish).swim !== undefined;
//   // return 'fly' in pet
// }

// // never never 类型可分配给每个类型；但是，没有类型可分配给 never（never 本身除外）。这意味着你可以使用缩小范围并依靠出现的 never 在 switch 语句中进行详尽检查。

// function getArea(shape: Shape) {
//   switch (shape.kind) {
//     case "circle":
//       return Math.PI * shape.radius ** 2;
//     case "square":
//       return shape.sideLength ** 2;
//     case "triangle":
//       return shape.sideLength ** 2;
//     default:
//       // Type 'Triangle' is not assignable to type 'never'.
//       const _exhaustiveCheck: never = shape;
//       return _exhaustiveCheck;
//   }
// }

// interface scream<T> {
//   input(a: T): void,
//   output(): T
// }
// function userScream<T>(x: scream<T>, y: T): T {
//   x.input(y)
//   return x.output()
// }

// const bbb = userScream({
//   input(a): void {
//     console.log(a);
//   },
//   output() {
//     return "Output from userScream";
//   }
// }, '12')

// console.log(bbb);

// class increteScream<T> implements scream<T> {
//   private b: T = null as unknown as T;
//   input(a: T): void {
//     this.b = a
//   }
//   output(): T {
//     return this.b
//   }
// }

// userScream(new increteScream<string>(), "Hello World!")

// // // const instance = new increteScream<string>();


// type Predicate = (x: unknown) => boolean;
// type K = ReturnType<Predicate>;

// function sealed(constructor: Function) {
//   Object.seal(constructor);
//   Object.seal(constructor.prototype);
// }

// @sealed
// class Greeter {
//   greeting: string;
//   constructor(message: string) {
//     this.greeting = message;
//   }
//   greet() {
//     return "Hello, " + this.greeting;
//   }
// }

// const a = new Greeter('ssss')

</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

type THelloWorld = string
type Num = number
type Bool = boolean
type Null = null
type Undefined = undefined
type NumOrString = string | Number
type Point = {
    x: string,
    y: string
}

type Fish = { swim: () => void };
type Bird = { fly: () => void };

interface Person {
    name: string,
    age: number
}
// 可选属性
interface Person1 {
    name: string,
    age?: number
}
// 任意属性
interface Person2 {
    name: string,
    age: number,
    [porpName: string]: any
}
interface Container {
    value: number | null | undefined;
}

interface Triangle {
    kind: "triangle";
    sideLength: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

interface Square {
    kind: "square";
    sideLength: number;
}

type Shape = Circle | Square | Triangle;
export type { THelloWorld, Num, Bool, Null, Undefined, NumOrString, Person, Person1, Person2, Point, Container, Fish, Bird, Triangle, Circle, Square, Shape }
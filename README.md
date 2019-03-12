# JSON Machine

An experiment to add a functional layer to JSON.

## Example

```javascript
["_.map", ["*", 2], [".", 1, 2, 3, 4]]
// -> [2, 4, 6, 8]
```

## Syntax

When the JSON is computed, it treats all values __except arrays__ the same as it normally would. Arrays are the way we represent function calls.

```javascript
["+", 1, 1] // -> 2
```

In order to declare an array value, there are two functions you can use: `.` and `:`.

```javascript
// Strict literal
[".", ["+", 1, 2], 3, 4, 5] // -> [["+", 1, 2], 3, 4, 5]

// Computed literal
[":", ["+", 1, 2], 3, 4, 5] // -> [3, 3, 4, 5]
```

## Lambdas

### Syntax

```javascript
["lambda",
  [".", "x", "y"], // Arguments
  [".",            // Statements
    ["+",
      ["@", "x"],
      ["@", "y"]
    ]
  ],
  [...]
]
```

### Usage

If you're going to write more than one line of code, you'll need to wrap it in a lambda. This acts as a sort of "main" function.

```javascript
["lambda", [".",
  ["=", "x", 10],
  ["^", 2, ["@", "x"]]
]]
```

Using the `compute` function from the library:

```javascript
const program = ["lambda", [".",
  ["=", "x", 10],
  ["^", 2, ["@", "x"]]
]];

const { returnValue: getResult } = await compute(program);

assert(await getResult(), 100); // -> true
```

You can also define lambdas within programs. One way is by currying:

```javascript
["lambda", [".",
  ["=", "x", 10],
  ["@", "square", ["^", 2]], // ^ function partially applied
  ["square", ["@", "x"]]
]];
```

Another is by defining and assigning a lambda:

```javascript
["lambda", [".",
  ["@", "sayHello", ["lambda",
    [".", "name"],
    [".",
      ["call", "concat", "Hello, ", ["@", "name"], "!"]
    ]
  ]],
  ["sayHello", "Eric"]
]]
// -> "Hello, Eric!"
```


## Variables

You set variables using the `=` function:

```javascript
["=", "x", 100]
```

You access variables using the `@` function:

```javascript
["@", "x"] // -> 100
```

You access object properties using the `_.get` function (Lodash):

```javascript
["lambda", [".",
  ["=", "obj", {
    "foo": {
      "bar": true
    }
  }],
  ["_.get", "foo.bar", ["@", "obj"]]
]] // -> true
```

## API

Note: no TypeScript definitions have been written yet. The following is anticipatory for when that occurs. (Avoiding build steps to start out.)

### `compute(program: any, context?: Context = core): Promise<IContext>`

Runs a JSON value against context, applying the special syntax for functions and arrays. A Promise resolving to a new `Context` is returned.

### `Context(): IContext`

Generates an object that represents the state at a given area of a program. Any function or variable is stored in the context. When you run a line of code, a new context is returned that contains the return value as well as any new variables (including functions) that were declared. They are meant to be immutable, and so methods return new `Context` objects.

### `IContext` interface

#### `context.returnValue: any`

#### `context.compute(program: any): Promise<Context>`

Runs program against this context and returns a promise resolving to a new context.

#### `context.set(path: string, value: any): Context`

Recursively sets value at path to given value.

#### `context.get(path: string): Context`

Recursively gets context value at path.

#### `context.merge(additions: {[key: string]: any}): Context`

Assigns object tree deeply into context values.

#### `context.extend(additions: {[key: string]: any}): Context`

Returns a new context object with members of `additions` added to variables. Use this to add new functions to the environment:

```javascript
const { core } = require('json-machine');

const extendedContext = core.extend({
  myCustomFunction: async (a, b) => {
    // Do interesting things
  }
});

const result = await extendedContext.compute(
  ["myCustomFunction", "foo", "bar"]
);
```

There are helper functions that provide currying: `Curried` and `Curry2`

```javascript
const { Curried, Curry2 } = require('json-machine');

const context = core.extend({
  // Curry until # of args passed
  greeting: Curried(2, (greetword, name) => {
    return `${greatword}, ${name}!`;
  }),

  // Curry2 as a shortcut for Curried(2, ...)
  greeting2: Curry2((greetword, name) => {
    return `${greatword}, ${name}!`;
  })
});

context.compute(["greeting", "Hi", "Eric"])
```


# Discussion

## Intent

I started tinkering with this after discussing ways to store the values for design systems that depend on each other. One way of generalizing design systems is as graphs of functional values. For example, a header is 50% larger than another header, which is 50% larger than a base font, and those proportions themselves are variables. Or a color is 25% lighter than another color, which has its hue shifted relative to another color.

The thought here is, if there were a way to represent functions and variables in JSON, we could easily serialize and store a graph of functional values. From there, we can put a graphical interface on top that would manipulate that graph. The program would look something like this:

```javascript
["lambda", ["."
  ["@", "constants", {
    "colors": {
      "primaryDark": "#111111",
      "secondaryDark": "#6666ff"
    },
    "fontSizes": {
      "content": 14
    }
  }],
  {
    "headers": {
      "h1": {
        "fontSize": ["*", 2.5, ["_.get", "fontSizes.content"]],
        "color": ["lighten", 1.2, ["_.get", "colors.primaryDark"]]
      }
    }
  }
]]
```

In order to make that work, there needs to be a special parser that can handle those capabilities and the extra syntax rules they would require. We could then wrap that parser in a web service and throw it on Lambda.

## Caveats

It's ugly, has no test coverage, and hasn't been battle tested. Error messages aren't meaningful, either.

I didn't put a ton of thought into the core functions. I did slap `lodash/fp` onto the core which I assumed would provide a lot of essentials and utilities.

## Other Explorations

### Scraping Services

There have been GraphQL scraping services popping up lately. I love GraphQL, and I've had to write APIs that were all scraping underneath the hood. The idea that scraping can be pushed out of the code and into an external service is quite awesome, and using GraphQL makes it that much more appealing.

The caveat is that because functions are represented as GraphQL fields, it's difficult to avoid ugly payloads that are tightly coupled to the traversal and parsing tree you're expressing in the GraphQL query. The logic you can represent is pretty rudimentary at this point. Amongst other things I can spend too much time writing about like cookie management, forms, and other areas that pop up in the real world when you're scraping.

In this library you'll notice I've included a `request:html2json` function in `remote.js`. This is a super useful function for describing transformations from DOM to JSON structures and values, one that I've derived from my `html2json` Node library. The intent is to at some point make this a service, where some of the biggest headaches (like session management) can also be abstracted.

Check out [`example.js`](./example.js) to see an example of this in action.

### Distributed Programs

It wouldn't be too difficult to store these programs in a DB and run them as HTTP endpoints (lambdas running on Lambda). We could then enable the passing of arbitrarily complex functions over a network, which would open up an interesting way to safely do distributed programming.

If we can represent arbitrary programs, then it's also possible to transpile other languages into it. If we're able to automatically detect and distribute expensive computations, then it is possible to create a distributed computing engine that is language-agnostic and requires no extra work on the part of the programmer. Since it is just JSON, it makes contribution to this kind of tooling much more possible.

### Testing

Why not throw testing into the mix? If we can abstract away things like headless browsers and device simulators behind JSON Machine context functions, then we can pass lambdas that describe the test operations and meta data such as platform versions, then distribute those instructions.

### Transpiling

If we have a neutral format to represent programs in, we can also use it as an intermediate format for transpiling. We can create to and from adapters, which would create a way to transpile between arbitrary languages. You can then diffuse libraries between language ecosystems. (I'm imagining things like stat functions from R.)

### Genetic Algorithms

If we write a function that randomizes programs within the constrains of what will run, and we have another function that evaluates the fitness of those programs, then it's an interesting mechanism for machine learning. Especially if we use the distributed capabilities.
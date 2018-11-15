# JSON Machine

An experiment around treating JSON as a scripting language.

## Example

This maps `[1,2,3]` against a squaring function:

```
["map", ["_", 1, 2, 3], ["=>", ["_", "n"], ["_",
  ["^", ["@", "n"], 2]
]]]
```

## Syntax

It's all JSON, with a few accommodations made to enable functions.

### Functions

```
["nameOfFunction", "arg1", "arg2"]
```

### Variables

Setting and getting variables are implemented as functions:

```
[":", "x", 1] // Assigning
["@", "x"] // Referencing
```


### Arrays

Since arrays are used for functions, we have to explicitly declare lists of values:

```
["_", 1, 2, 3, 4]
```

### Lambdas

We can define our own functions, which are treated like any other value.

```
["lambda",
  ["_", "x", "y"],  // Array of argument names
  ["_",             // Array of statements
    [":", "z", 10],
    ["*",           // Last statement produces the return value
      ["@", "x"],
      ["@", "y"],
      ["@", "z"]
    ]
  ]
]
```

### Objects

Objects behave the same as they always do, but the values can also be computed:

```
{
  "a": 1,
  "b": 2,
  "c": ["*", 5, 10]
}
```

### Scalars

Numbers, strings, and `null` act the same as they always do in JSON.

## Server

This is where things get interesting. What if we provide endpoints to execute JSON programs?

To run the server, run: `PORT=9999 node dist/server.js`.

__`GET /compute`__

Query params:

- `program` - Required. A URL-encoded JSON string.
- `path` - Optional. Returns value at path of computed result.
- `inputs` - Optional. If returned value is a lambda, runs the lambda with inputs as arguments.

Returns the result of the computation.

__`POST /programs`__

Saves a program. Uses the body directly as the program, and returns:

```
{
    "id": "<SHA-256 hash of program>",
    "code": ["lambda", ...]
}
```

__`GET /programs/:id`__

Similar to `GET /compute`, but runs a saved program.

Query params:

- `path` - Optional. Returns value at path of computed result.
- `inputs` - Optional. If returned value is a lambda, runs the lambda with inputs as arguments.

const { compute, core } = require('./index.js');
const withRemote = require('./remote');

const run = async () => {
  await hello();
  await scrape();
};

const hello = async () => {
  const helloProgram = ["lambda", ["."], [".",
    ["=", "sayHello", ["lambda",
      [".", "name"],
      [".",
        ["call", "concat", "Hello, ", ["@", "name"], "!"]
      ]
    ]],
    ["sayHello", "Eric"]
  ]];

  const { returnValue: main } = await compute(helloProgram);
  const { returnValue: result } = await main();
  console.log(result);
};

const scrape = async () => {
  const context = withRemote(core);
  const program = ["request:html2json", {
    "uri": "https://www.prolificinteractive.com"
  }, {
    "links": [":", "a", {
      "label": ["method", "text"],
      "url": ["method", "attr", "href"]
    }]
  }];
  const { returnValue: data } = await context.compute(program);
  console.log(data);
};

run();
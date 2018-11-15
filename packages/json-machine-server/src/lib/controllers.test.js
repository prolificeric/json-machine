import { saveNewProgram, runProgram } from './controllers';
import { createMemoryStore } from './memory-store';
import { createMachine } from 'json-machine-core/src/lib/machine';
import { createContext} from 'json-machine-core/src/lib/context';

const store = createMemoryStore();
const machine = createMachine(createContext());
const options = { store, machine };

const saveAndRun = (program, inputs, onValue) => {
  saveNewProgram(options)({
    body: program
  }, {
    send: ({ id }) => {
      runProgram(options)({
        params: { id },
        query: { inputs }
      }, {
        json: onValue
      });
    }
  });
};

describe('saved programs', () => {
  test('if saved programs can be run', done => {
    saveAndRun({ x: 1 }, null, value => {
      expect(value.x).toEqual(1);
      done();
    });
  });

  test('if lambdas can be run', done => {
    const program = ["lambda", ["."], [".",
    	["=", "baseColor", [".", 255, 100, 0]],
    	{
    		"colors": {
    			"base": ["@", "baseColor"],
    			"darker": ["map", ["*", 0.5], ["@", "baseColor"]]
    		}
    	}
    ]];

    saveAndRun(program, null, value => {
      expect(value.colors.base.join(', ')).toEqual('255, 100, 0');
      done();
    });
  });
});

import generateId from 'uuid';

export const parseQuery = ({ program, inputs }) => {
  return {
    program: JSON.parse(program),
    inputs: inputs ? JSON.parse(inputs) : {}
  };
};

export const computeInline = ({ machine }) => (req, resp) => {
  const { program, inputs } = parseQuery(req.query);

  machine.run(
    program,
    inputs,
    result => {
      resp.json({
        program,
        value: result.value
      });
    }
  );
};

export const saveNewProgram = ({ machine, store }) => (req, resp) => {
  const id = generateId();
  const program = req.body;

  store.save(id, program)
    .then(() => {
      resp.send({
        id,
        program
      })
    })
    .catch(err => {
      console.error(err.stack);

      resp.send({
        error: {
          code: 'GENERIC_ERROR',
          message: 'There was a problem saving the program.'
        }
      });
    });
};

export const saveExistingProgram = ({ machine, store }) => (req, resp) => {
  const { id } = req.params;
  const program = req.body;

  store.save(id, program)
    .then(resp.send.bind(resp))
    .catch(err => {
      console.error(err.stack);

      resp.send({
        error: {
          code: 'GENERIC_ERROR',
          message: 'There was a problem saving the program.'
        }
      });
    });
};

export const getProgram = ({ machine, store }) => (req, resp) => {
  store
    .get(req.params.id)
    .then(resp.send.bind(resp));
};

export const runProgram = ({ machine, store }) => (req, resp) => {
  const { id } = req.params;
  const { inputs } = req.query;
  const parsedInputs = [];

  if (inputs) {
    try {
      parsedInputs = JSON.parse(inputs);
    } catch (err) {
      resp.json({
        error: {
          message: 'Error parsing inputs. Make sure it is a valid JSON array.'
        }
      });
    }
  }

  store.get(id).then(program => {
    machine.run(program.code, parsedInputs, result => {
      resp.json(result.value);
    });
  });
};

export const runProgramPost = ({ machine, store }) => (req, resp) => {
  const { id } = req.params;
  const inputs = req.body;

  store.get(id).then(program => {
    machine.run(program.code, parsedInputs, result => {
      resp.json(result.value);
    });
  });
};

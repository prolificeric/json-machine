import { Router } from 'express';
import { createMachine, createContext } from 'json-machine-core';
import { json as jsonBodyParser } from 'body-parser';
import * as controllers from './controllers';

export const createMachineRouter = options => {
  return Router()
    .use(jsonBodyParser())
    .get('/compute', controllers.computeInline(options))
    .post('/programs', controllers.saveNewProgram(options))
    .put('/programs/:id', controllers.saveExistingProgram(options))
    .get('/programs/:id', controllers.getProgram(options))
    .get('/programs/:id/value', controllers.runProgram(options))
    .post('/programs/:id/value', controllers.runProgramPost(options));
};

export const createStandardMachineRouter = store => {
  const machine = createMachine(createContext());
  return createMachineRouter({ machine, store });
};

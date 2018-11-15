import coreFunctions from './core-functions';
import { createReactiveState } from './state';

export const createContext = ({
  state = createReactiveState(),
  variables = coreFunctions
} = {}) => {
  const setVariable = (key, value) => {
    return extend(context, {
      variables: {
        ...variables,
        [key]: value
      }
    });
  };

  const assignVariables = assignments => {
    return extend(context, {
      variables: {
        ...variables,
        ...assignments
      }
    });
  };

  const context = {
    state,
    variables: Object.freeze(variables),
    setVariable,
    assignVariables
  };

  return context;
};

const extend = ({ state, variables }, changes) => {
  return createContext({
    state,
    variables,
    ...changes
  });
};

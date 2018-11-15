import { observable, autorun } from 'mobx';
import get from 'lodash/get';
import setPath from 'lodash/set';
import merge from 'lodash/merge';

export const createReactiveState = (initialValues = {}) => {
  const store = observable.object(initialValues);

  const subscribe = (selector, onChange) => {
    autorun(() => {
      onChange(selector(store));
    });
  };

  const set = (path, value) => {
    setPath(store, path, value);
    return state;
  };

  const assign = values => {
    Object.assign(store, values);
    return state;
  };

  const merge = values => {
    merge(store, values);
    return state;
  };

  const state = {
    store,
    subscribe,
    set,
    assign,
    merge
  };

  return state;
};

export const PathSelector = paths => store => {
  return paths.reduce((values, path) => {
    return set(values, path, get(store, path));
  }, {});
};

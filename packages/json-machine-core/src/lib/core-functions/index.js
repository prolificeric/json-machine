import arrays from './arrays';
import math from './math';
import lambdas from './lambdas';
import state from './state';
import variables from './variables';
import objects from './objects';
import asyncFns from './async';
import meta from './meta';

export default {
  ...arrays,
  ...math,
  ...lambdas,
  ...state,
  ...variables,
  ...objects,
  ...asyncFns,
  ...meta
};

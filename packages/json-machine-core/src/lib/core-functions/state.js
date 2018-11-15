import { curryLambdaN } from '../util';

export default {
  '$': curryLambdaN(2, (context, [select, consume], onValue) => {
    const pullValues = state => {
      let selectedState;

      select(context, [context.state.store], result => {
        selectedState = result.value;
      });

      return selectedState;
    };

    context.state.subscribe(pullValues, value => {
      consume(context, [value], onValue);
    });
  })
};

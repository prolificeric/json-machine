const _ = require('lodash');
const request = require('request-promise-native');
const cheerio = require('cheerio');
const { Curry2, Context } = require('./index.js');

module.exports = context => context.extend({
  request,

  'load': async function (uri) {
    const program = await request({ uri });
    return this.compute(program);
  },

  'remote': (uri, program) => {
    return request({
      uri,
      method: 'post',
      json: program
    });
  },

  'html2json': html2json,

  'request:html2json': (options, filter) => {
    return request(options).then(html => {
      return html2json(filter, html);
    });
  }
});

const html2json = Curry2((filter, html) => {
  const $ = cheerio.load(html);

  const recurse = ($el, filter) => {
    if (_.isFunction(filter)) {
      return Promise.resolve(filter($el, $)).then(result => {
        return Context.isContext(result)
          ? result.returnValue
          : result;
      });
    }

    if (_.isArray(filter)) {
      const [selector, mapper, after=v=>v] = filter;
      
      return Promise.all(
        after(
          $el.find(selector).toArray().map(el => {
            return recurse($(el), mapper);
          })
        )
      );
    }

    if (_.isObject(filter)) {
      const result = {};
      const promises = [];

      Object.keys(filter).forEach(key => {
        const _filter = filter[key];

        const promise = Promise.resolve(recurse($el, _filter)).then(value => {
          result[key] = value;
        });

        promises.push(promise);
      });

      return Promise.all(promises).then(() => result);
    }

    return filter;
  };

  return recurse($.root(), filter);
});
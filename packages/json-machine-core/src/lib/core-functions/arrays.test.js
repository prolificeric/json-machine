import { createContext } from '../context';
import { compute } from '../compute';

const context = createContext();

describe('map()', () => {
  test('if map function works synchronously', done => {
    const code = ['map',
      ['lambda',
        ['.', 'n'],
        ['.',
          ['*', ['@', 'n'], 2]
        ]
      ],
      ['.', 1, 2, 3],
    ];

    compute(context, code, result => {
      expect(result.value.join(', ')).toEqual('2, 4, 6');
      done();
    });
  });

  test('if currying works with map', done => {
    const code = ['map',
      ['*', 2],
      ['.', 1, 2, 3],
    ];

    compute(context, code, result => {
      expect(result.value.join(', ')).toEqual('2, 4, 6');
      done();
    });
  });

  test('if map works asynchronously', done => {
    const before = Date.now();

    const code = ['map',
      ['delayed', ['*', 2], 100],
      ['.', 1, 2, 3],
    ];

    compute(context, code, result => {
      expect(result.value.join(', ')).toEqual('2, 4, 6');
      expect(Date.now() - before >= 100).toEqual(true);
      done();
    });
  });
});

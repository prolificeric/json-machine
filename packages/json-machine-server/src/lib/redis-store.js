import { promisify } from 'util';

const getProgramKey = id => `programs:${id}`;

export const createRedisStore = db => {
  const getAsync = promisify(db.get).bind(db);
  const setAsync = promisify(db.set).bind(db);

  const save = async (id, program) => {
    const key = getProgramKey(id);

    await setAsync(key, JSON.stringify(program, null, 2));

    return {
      id,
      code: program
    };
  };

  const get = async id => {
    const key = getProgramKey(id);
    const programJson = await getAsync(key);

    return {
      id,
      code: JSON.parse(programJson)
    };
  };

  const store = {
    save,
    get
  };

  return store;
};

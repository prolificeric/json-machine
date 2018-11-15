export const createMemoryStore = (data = {}) => {
  const save = async (id, program) => {
    data[id] = program;

    return {
      id,
      code: program
    };
  };

  const get = async id => {
    return {
      id,
      code: data[id]
    };
  };

  const store = {
    save,
    get
  };

  return store;
};

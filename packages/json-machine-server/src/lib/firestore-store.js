export const createFirestoreStore = db => {
  const save = async (id, program) => {
    return db
      .collection('programs')
      .doc(id)
      .set(program)
      .then(() => ({
        id,
        code: program
      }));
  };

  const get = async id => {
    return db
      .collection('programs')
      .doc(id)
      .get()
      .then(doc => {
        return {
          id,
          code: doc.data()
        };
      });
  };

  const store = {
    save,
    get
  };

  return store;
};

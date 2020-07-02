const filterProps = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObject[el] = object[el];
    }
  });
  return newObject;
};

module.exports = filterProps;

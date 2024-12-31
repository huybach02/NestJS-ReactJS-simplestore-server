export const deleteFieldFormObject = (object: any, fields: string[]) => {
  for (const field of fields) {
    delete object[field];
  }
  return object;
};

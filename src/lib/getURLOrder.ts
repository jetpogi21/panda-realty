export const getURLORder = (orderBy: string[], supQuery: any) => {
  //[ 'name DESC', 'id' ] example orderBy
  orderBy.forEach((item) => {
    const [fieldName, extension] = item.toLowerCase().split(" ");
    //`.order('id', { ascending: false })`;
    if (extension) {
      supQuery.order(fieldName, { ascending: false });
    } else {
      supQuery.order(fieldName);
    }
  });
};

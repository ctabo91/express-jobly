const { BadRequestError } = require("../expressError");

/**Accepts an object of data that you wish to update(dataToUpdate), and an object of JS variables as keys and their equivalent SQL syntax as values(jsToSql).
 * 
 * The keys are extracted from the "dataToUpdate" --- if there are no keys, a BadRequestError is thrown with a message of "No data".
 * 
 * keys are mapped to create a new array of columns to be used for a SQL query...
 * ex: ['"first_name"=$1', '"age"=$2']
 * 
 * Returns an object with (setCols: "string of columns") and (values: [array of values extracted from "dataToUpdate"])...
 * ex: {setCols: '"first_name"=$1, "age"=$2', values: ["Aliya", 32]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

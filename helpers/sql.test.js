const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function() {
    test("works: proper data passed in", function() {
        const data = {
            firstName: 'TestF',
            lastName: 'TestL',
            age: 32
        };
        const jsToSql = {
            firstName: 'first_name',
            lastName: 'last_name'
        };
        const sqlObj = sqlForPartialUpdate(data, jsToSql);
        expect(sqlObj).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2, "age"=$3',
            values: ['TestF', 'TestL', 32]
        });
    });

    test("throw error: no data", function() {
        const jsToSql = {
            firstName: 'first_name',
            lastName: 'last_name'
        };
        expect(() => {
            sqlForPartialUpdate({}, jsToSql);
        }).toThrow("No data");
    });
});
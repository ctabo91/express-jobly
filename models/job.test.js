"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New",
    salary: 1000,
    equity: "0.010",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New",
      salary: 1000,
      equity: "0.010",
      companyHandle: "c1"
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.010",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.020",
        companyHandle: "c2",
        companyName: "C2"
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 3000,
        equity: "0.030",
        companyHandle: "c3",
        companyName: "C3"
      }
    ]);
  });

  test("works: with filter 'title'", async function() {
    let jobs = await Job.findAll({title: 'J1'});
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.010",
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });

  test("works: with filter 'minSalary'", async function() {
    let jobs = await Job.findAll({minSalary: 2000});
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.020",
        companyHandle: "c2",
        companyName: "C2"
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 3000,
        equity: "0.030",
        companyHandle: "c3",
        companyName: "C3"
      }
    ]);
  });

  test("works: with filter 'hasEquity'", async function() {
    let jobs = await Job.findAll({hasEquity: true});
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.010",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.020",
        companyHandle: "c2",
        companyName: "C2"
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 3000,
        equity: "0.030",
        companyHandle: "c3",
        companyName: "C3"
      }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "J1",
      salary: 1000,
      equity: "0.010",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img"
      }
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 4000,
    equity: "0.040",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update(testJobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateDataSetNulls,
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${testJobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs (can use optional filter in searchFilters).
   * 
   * Optional searchFilters:
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                FROM jobs j
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereExpressions = [];
    let queryValues = [];

    const { minSalary, hasEquity, title } = searchFilters;


    // Add to whereExpressions and queryValues for each search term, to get the correct SQL

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      queryValues.push(0);
      whereExpressions.push(`equity > $${queryValues.length}`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finish the query and return
    
    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);
    
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *    where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`,
         [job.companyHandle]
    );

    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;

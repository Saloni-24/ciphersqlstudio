/**
 * seed.js — Run once to populate the sandbox DB and MongoDB with sample data.
 * Usage: npm run seed
 */

require('dotenv').config({ path: 'C:\\Users\\Saloni\\ciphersqlstudio\\backend\\.env' });;
const { Pool } = require('pg');
const mongoose = require('mongoose');
const { Assignment } = require('./mongodb');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'ciphersql_sandbox',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
});

//  PostgreSQL: Create & populate sample tables 
const pgSetup = `
-- Assignment 1: Basic SELECT
CREATE TABLE IF NOT EXISTS employees (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  dept      VARCHAR(50),
  salary    NUMERIC(10,2),
  hire_date DATE
);

INSERT INTO employees (name, dept, salary, hire_date) VALUES
  ('Alice Johnson',  'Engineering',  92000, '2020-03-15'),
  ('Bob Smith',      'Marketing',    68000, '2019-07-22'),
  ('Carol Williams', 'Engineering',  105000,'2018-01-10'),
  ('David Brown',    'HR',           55000, '2021-09-05'),
  ('Eva Martinez',   'Engineering',  88000, '2022-02-28'),
  ('Frank Lee',      'Marketing',    72000, '2020-11-17'),
  ('Grace Kim',      'Finance',      95000, '2017-06-30'),
  ('Henry Clark',    'HR',           60000, '2023-01-14')
ON CONFLICT DO NOTHING;

-- Assignment 2: JOIN practice
CREATE TABLE IF NOT EXISTS departments (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(50) UNIQUE NOT NULL,
  head  VARCHAR(100),
  budget NUMERIC(12,2)
);

INSERT INTO departments (name, head, budget) VALUES
  ('Engineering', 'Carol Williams', 5000000),
  ('Marketing',   'Frank Lee',      1500000),
  ('HR',          'David Brown',    800000),
  ('Finance',     'Grace Kim',      2000000)
ON CONFLICT DO NOTHING;

-- Assignment 3: Aggregation practice
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  customer    VARCHAR(100),
  product     VARCHAR(100),
  quantity    INT,
  unit_price  NUMERIC(10,2),
  order_date  DATE,
  status      VARCHAR(20)
);

INSERT INTO orders (customer, product, quantity, unit_price, order_date, status) VALUES
  ('Alice',   'Laptop',   1, 999.99,  '2024-01-05', 'delivered'),
  ('Bob',     'Phone',    2, 599.99,  '2024-01-08', 'delivered'),
  ('Carol',   'Tablet',   1, 449.99,  '2024-01-12', 'pending'),
  ('David',   'Laptop',   3, 999.99,  '2024-01-15', 'delivered'),
  ('Eva',     'Monitor',  2, 299.99,  '2024-01-20', 'shipped'),
  ('Alice',   'Keyboard', 1, 89.99,   '2024-01-22', 'delivered'),
  ('Bob',     'Laptop',   1, 999.99,  '2024-02-01', 'pending'),
  ('Frank',   'Phone',    1, 599.99,  '2024-02-03', 'delivered'),
  ('Grace',   'Monitor',  3, 299.99,  '2024-02-10', 'delivered'),
  ('Henry',   'Tablet',   2, 449.99,  '2024-02-15', 'shipped')
ON CONFLICT DO NOTHING;

-- Assignment 4: Subquery practice  
CREATE TABLE IF NOT EXISTS students (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100),
  grade   INT CHECK (grade BETWEEN 1 AND 100),
  subject VARCHAR(50),
  year    INT
);

INSERT INTO students (name, grade, subject, year) VALUES
  ('Alice',  92, 'Math',    2023),
  ('Alice',  88, 'Science', 2023),
  ('Alice',  95, 'English', 2023),
  ('Bob',    74, 'Math',    2023),
  ('Bob',    81, 'Science', 2023),
  ('Bob',    68, 'English', 2023),
  ('Carol',  95, 'Math',    2023),
  ('Carol',  97, 'Science', 2023),
  ('Carol',  91, 'English', 2023),
  ('David',  60, 'Math',    2023),
  ('David',  55, 'Science', 2023),
  ('David',  72, 'English', 2023)
ON CONFLICT DO NOTHING;
`;

// MongoDB: Sample assignments
const sampleAssignments = [
  {
    title: 'The First Cipher — Basic SELECT',
    description: 'Retrieve and filter records from the employees table using SELECT and WHERE.',
    question: `You are a data analyst at CipherCorp. Your manager needs a report on engineering staff.
    
Write a SQL query to:
1. Select the **name**, **dept**, and **salary** of all employees
2. Filter to show only employees in the **Engineering** department
3. Order results by **salary** in descending order`,
    difficulty: 'beginner',
    tags: ['SELECT', 'WHERE', 'ORDER BY'],
    tables: ['employees'],
    expectedColumns: ['name', 'dept', 'salary'],
    isActive: true,
    order: 1,
  },
  {
    title: 'The JOIN Protocol — Linking Tables',
    description: 'Combine data from the employees and departments tables using JOINs.',
    question: `The CEO wants a full overview of employees alongside their department budgets.

Write a SQL query to:
1. **JOIN** the employees table with the departments table on the department name
2. Return each employee's **name**, their **department name**, **salary**, and the department's **budget**
3. Include only departments that have a **budget over 1,000,000**
4. Order by **budget** descending`,
    difficulty: 'intermediate',
    tags: ['JOIN', 'INNER JOIN', 'WHERE'],
    tables: ['employees', 'departments'],
    expectedColumns: ['name', 'dept', 'salary', 'budget'],
    isActive: true,
    order: 2,
  },
  {
    title: 'Operation Aggregate — GROUP BY',
    description: 'Summarise order data using GROUP BY, HAVING, and aggregate functions.',
    question: `CipherCorp's sales team needs a revenue summary per product.

Write a SQL query to:
1. Group **orders** by **product**
2. Calculate the **total revenue** (quantity × unit_price) for each product
3. Count the **number of orders** per product
4. Show only products with **total revenue greater than 1,000**
5. Order by **total revenue** descending

Hint: Think about which aggregate functions could help you here.`,
    difficulty: 'intermediate',
    tags: ['GROUP BY', 'HAVING', 'SUM', 'COUNT', 'Aggregation'],
    tables: ['orders'],
    expectedColumns: ['product', 'total_revenue', 'order_count'],
    isActive: true,
    order: 3,
  },
  {
    title: 'Deep Cover — Subqueries',
    description: 'Use subqueries to find students who score above the class average.',
    question: `The academy needs to identify high-performing students.

Write a SQL query to:
1. Find all students whose **average grade** across all subjects is **above the overall class average**
2. Return the student's **name** and their **average grade** (aliased as avg_grade), rounded to 2 decimal places
3. Order by **avg_grade** descending

You'll need to use a subquery or CTE to calculate the overall average.`,
    difficulty: 'advanced',
    tags: ['Subquery', 'AVG', 'GROUP BY', 'HAVING', 'CTE'],
    tables: ['students'],
    expectedColumns: ['name', 'avg_grade'],
    isActive: true,
    order: 4,
  },
  {
    title: 'Status Report — CASE & Conditional Logic',
    description: 'Use CASE expressions to categorize and transform data.',
    question: `Finance wants a categorized report of all orders.

Write a SQL query that:
1. Selects **customer**, **product**, **unit_price**, and **status** from orders
2. Adds a **price_tier** column using CASE:
   - "Budget" if unit_price < 300
   - "Mid-range" if unit_price between 300 and 799
   - "Premium" if unit_price >= 800
3. Adds a **status_label** column:
   - "✓ Complete" if status = 'delivered'
   - "⟳ In Transit" if status = 'shipped'
   - "⏳ Waiting" otherwise
4. Order by **unit_price** descending`,
    difficulty: 'intermediate',
    tags: ['CASE', 'WHEN', 'Conditional', 'Expressions'],
    tables: ['orders'],
    expectedColumns: ['customer', 'product', 'price_tier', 'status_label'],
    isActive: true,
    order: 5,
  },
];

async function seed() {
  console.log(' Starting seed...\n');

  // Seed PostgreSQL
  console.log(' Setting up PostgreSQL sandbox tables...');
  try {
    await pool.query(pgSetup);
    console.log(' PostgreSQL tables created and populated.\n');
  } catch (err) {
    console.error(' PostgreSQL seed failed:', err.message);
  }

  // Seed MongoDB
  console.log(' Seeding MongoDB assignments...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Assignment.deleteMany({}); // clear existing
    await Assignment.insertMany(sampleAssignments);
    console.log(` Inserted ${sampleAssignments.length} assignments into MongoDB.\n`);
  } catch (err) {
    console.error(' MongoDB seed failed:', err.message);
  }

  await pool.end();
  await mongoose.disconnect();
  console.log(' Seed complete!');
  process.exit(0);
}

seed();
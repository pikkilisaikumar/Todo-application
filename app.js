const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const intilzerDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server has started");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

intilzerDBAndServer();

//API 1 AND Inside having the number of subparts

app.get("/todos/", async (request, response) => {
  const { priority, status, category, search_q } = request.query;
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const statuslistquery = `
      SELECT
      id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE status = '${status}';
     `;
      const statuslist = await db.all(statuslistquery);

      response.send(statuslist);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const prioriylistquery = `
      SELECT
      id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE priority = '${priority}';
     `;
      const prioriylist = await db.all(prioriylistquery);
      response.send(prioriylist);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    const prioriyandstatuslistquery = `
      SELECT
      id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE priority = '${priority}' AND status = '${status}';
     `;
    const prioriyandstatuslist = await db.all(prioriyandstatuslistquery);
    response.send(prioriyandstatuslist);
  } else if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== undefined
  ) {
    const search_listquery = `
      SELECT
       id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE todo LIKE '%${search_q}%';
     `;
    const search_list = await db.all(search_listquery);
    response.send(search_list);
  } else if (
    status !== undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    const statuscategory_listquery = `
      SELECT
     id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE status = '${status}' AND category='${category}';
     `;
    const statuscategory_list = await db.all(statuscategory_listquery);
    response.send(statuscategory_list);
  } else if (
    status === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const category_listquery = `
      SELECT
       id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE category = '${category}';
     `;
      const category_list = await db.all(category_listquery);
      response.send(category_list);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    const categorypriority_listquery = `
      SELECT
      id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE category = '${category}' AND priority = '${priority}';
     `;
    const categorypriority_list = await db.all(categorypriority_listquery);
    response.send(categorypriority_list);
  }
});
//SECOND API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const onetodo_list_query = `
       SELECT
         id,todo,priority,status,category,due_date AS dueDate
        FROM
        todo
        WHERE id = ${todoId};
`;
  const onetodo_list = await db.get(onetodo_list_query);
  response.send(onetodo_list);
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const validDate = isValid(new Date(date));
  console.log(validDate);
  if (validDate === true) {
    const result_date = format(new Date(date), "yyyy-MM-dd");
    console.log(result_date);
    const date_listquery = `
      SELECT
    id,todo,priority,status,category,due_date AS dueDate
       FROM
       todo
       WHERE due_date = '${result_date}';
     `;
    const date_list = await db.all(date_listquery);
    response.send(date_list);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const validDate = isValid(new Date(dueDate));
  if (validDate === false) {
    response.status(400);
    response.send("Invalid Due Date");
  }

  const priority_valid_invalid =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  if (priority_valid_invalid === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  const status_valid_invalid =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  if (status_valid_invalid === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  }
  const category_valid_invalid =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  if (category_valid_invalid === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  }

  if (
    priority_valid_invalid === true &&
    status_valid_invalid === true &&
    category_valid_invalid === true &&
    validDate === true
  ) {
    const result1 = format(new Date(dueDate), "yyyy-MM-dd");
    const new_todo_list = `
     INSERT INTO todo(
         id,todo,priority,status,category,due_date
     )
     VALUES
     (${id},'${todo}','${priority}','${status}','${category}','${result1}');
    `;
    await db.run(new_todo_list);
    response.send("Todo Successfully Added");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  if (
    status !== undefined &&
    priority === undefined &&
    todo === undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const update_status_query = `
         UPDATE todo
         SET
         status = '${status}'
         WHERE id = ${todoId};
        `;
      await db.run(update_status_query);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (
    status === undefined &&
    priority !== undefined &&
    todo === undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const update_priority_query = `
         UPDATE todo
         SET
         priority = '${priority}'
         WHERE id = ${todoId};
        `;
      await db.run(update_priority_query);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (
    status === undefined &&
    priority === undefined &&
    todo !== undefined &&
    category === undefined &&
    dueDate === undefined
  ) {
    const update_todo_query = `
         UPDATE todo
         SET
         todo = '${todo}'
         WHERE id = ${todoId};
        `;
    await db.run(update_todo_query);
    response.send("Todo Updated");
  } else if (
    status === undefined &&
    priority === undefined &&
    todo === undefined &&
    category !== undefined &&
    dueDate === undefined
  ) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const update_category_query = `
         UPDATE todo
         SET
         category = '${category}'
         WHERE id = ${todoId};
        `;
      await db.run(update_category_query);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    const validDate2 = isValid(new Date(dueDate));
    if (validDate2 === true) {
      const result2 = format(new Date(dueDate), "yyyy-MM-dd");
      const update_date_query = `
         UPDATE todo
         SET
         due_date = '${result2}'
         WHERE id = ${todoId};
        `;
      await db.run(update_date_query);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `
     DELETE
     FROM
     todo
     WHERE id = ${todoId};
   `;
  await db.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = app;

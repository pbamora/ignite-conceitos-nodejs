const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).send({ error: "User not founded" }).json()
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const userAlreadyExists = users.find(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).send({ error: "Username already exists!" }).json()
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user).json()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).send(user.todos).json()
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).send(todo).json()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const foundedTodo = user.todos.find(s => s.id === id)

  if (!foundedTodo) {
    return response.status(404).send({ error: "Todo not exists" }).json()
  }

  const newTodo = {
    ...foundedTodo,
    title,
    deadline
  }

  return response.status(201).send(newTodo).json()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const foundedTodo = user.todos.find(s => s.id === id)

  if (!foundedTodo) {
    return response.status(404).send({ error: "Todo not exists" }).json()
  }

  const newTodo = {
    ...foundedTodo,
    done: true,
  }

  return response.status(201).send(newTodo).json()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const index = user.todos.findIndex(s => s.id === id)

  if (index < 0) {
    return response.status(404).send({ error: "Todo not exists" }).json()
  }

  user.todos.splice(index, 1)

  return response.status(204).send().json()
});

module.exports = app;
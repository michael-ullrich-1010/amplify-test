import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Main from "./screen/Main/Main";

const client = generateClient<Schema>();

// Define view type for better type safety
type StorageAccessLevel = 'guest' | 'private' | 'protected';
type View = 'todos' | 'files';

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [currentView, setCurrentView] = useState<View>('todos');
  const [fileLevel, setFileLevel] = useState<StorageAccessLevel>('private');

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <div>
      <nav className="navigation">
        <button 
          onClick={() => setCurrentView('todos')}
          className={currentView === 'todos' ? 'active' : ''}
        >
          Todos
        </button>
        <button 
          onClick={() => setCurrentView('files')}
          className={currentView === 'files' ? 'active' : ''}
        >
          Files
        </button>
        {currentView === 'files' && (
          <select 
            value={fileLevel} 
            onChange={(e) => setFileLevel(e.target.value as StorageAccessLevel)}
            >
            <option value="private">Private Files</option>
            <option value="protected">Protected Files</option>
            <option value="guest">Guest Files</option>
          </select>
        )}
      </nav>

      {currentView === 'todos' ? (
        <main>
          <h1>My todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
                {todo.content}
              </li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
        </main>
      ) : (
        <Main level={fileLevel} />
      )}
    </div>
  );
}

export default App;
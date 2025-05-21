import { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaSave, FaTimes, FaBell, FaMoon, FaSun } from "react-icons/fa";

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const isDeadlineValid = (dateStr) => {
    if (!dateStr) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateStr);
    return selected >= today;
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(
    (t) =>
      t.deadline &&
      !t.completed &&
      new Date(t.deadline) <= now
  );

  const addTask = () => {
    if (!input.trim()) {
      alert("Tugas tidak boleh kosong");
      return;
    }
    if (!isDeadlineValid(deadline)) {
      alert("Deadline tidak boleh di masa lalu");
      return;
    }
    const newTask = {
      text: input.trim(),
      completed: false,
      deadline: deadline || null,
      priority,
    };
    setTasks([...tasks, newTask]);
    setInput("");
    setDeadline("");
    setPriority("Medium");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    if (confirm("Hapus tugas ini?")) {
      const newTasks = [...tasks];
      newTasks.splice(index, 1);
      setTasks(newTasks);
    }
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(tasks[index].text);
    setEditDeadline(tasks[index].deadline || "");
    setEditPriority(tasks[index].priority);
  };

  const saveEdit = (index) => {
    if (!editText.trim()) {
      alert("Tugas tidak boleh kosong");
      return;
    }
    if (!isDeadlineValid(editDeadline)) {
      alert("Deadline tidak boleh di masa lalu");
      return;
    }
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      text: editText.trim(),
      deadline: editDeadline || null,
      priority: editPriority,
    };
    setTasks(newTasks);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditText("");
    setEditDeadline("");
    setEditPriority("Medium");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  const sortTasks = (taskList) => {
    if (sortBy === "deadline") {
      return [...taskList].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    }
    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return [...taskList].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }
    if (sortBy === "status") {
      return [...taskList].sort((a, b) => a.completed - b.completed);
    }
    return taskList;
  };

  const displayedTasks = sortTasks(filteredTasks);

  const priorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-yellow-400 text-gray-900";
      case "Low":
        return "bg-green-400 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className={`min-h-screen p-6 flex justify-center items-start transition-colors duration-500 ${
      darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"
    } font-sans`}>
      <div className={`w-full max-w-xl p-8 rounded-xl shadow-xl
        ${darkMode ? "bg-gray-800 shadow-gray-700" : "bg-white shadow-lg"}
        transform transition-transform duration-300 hover:scale-[1.02]`}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm select-none">
            To-Do List
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-yellow-400 hover:text-yellow-300 text-2xl p-2 rounded-full
              transition-colors duration-300 hover:scale-110 focus:outline-none focus:ring-2
              focus:ring-yellow-300"
            aria-label={darkMode ? "Light Mode" : "Dark Mode"}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </header>

        {/* Reminder Banner */}
        {overdueTasks.length > 0 && (
          <div className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-xl mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-300 shadow-md animate-pulse select-none">
            <FaBell className="text-red-600 dark:text-red-400 text-xl" />
            <p className="font-semibold text-lg">
              Kamu punya {overdueTasks.length} tugas yang deadline-nya hari ini atau sudah lewat! Jangan lupa selesaikan ya.
            </p>
          </div>
        )}

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="flex flex-wrap gap-4 mb-8 justify-center"
          aria-label="Form tambah tugas"
        >
          <input
            type="text"
            placeholder="Tulis tugas..."
            className={`flex-grow min-w-[180px] border rounded-lg px-4 py-3
              focus:outline-none focus:ring-4
              ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-yellow-400 text-gray-200 placeholder-gray-400" : "border-gray-300 focus:ring-blue-400 placeholder-gray-600"}
              transition-colors duration-300`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Input tugas"
            autoFocus
          />
          <input
            type="date"
            className={`border rounded-lg px-4 py-3
              focus:outline-none focus:ring-4
              ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-yellow-400 text-gray-200" : "border-gray-300 focus:ring-blue-400"}
              transition-colors duration-300`}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            aria-label="Input deadline"
          />
          <select
            className={`border rounded-lg px-4 py-3
              focus:outline-none focus:ring-4
              ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-yellow-400 text-gray-200" : "border-gray-300 focus:ring-blue-400"}
              transition-colors duration-300`}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Pilih prioritas"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold
              hover:bg-blue-700 active:bg-blue-800 transition-colors duration-300 shadow-md
              flex items-center justify-center gap-2 select-none"
          >
            Tambah
          </button>
        </form>

        {/* Filter buttons */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {["all", "incomplete", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-semibold transition-colors duration-300
                ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-lg"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
                focus:outline-none focus:ring-4 focus:ring-blue-400`}
            >
              {f === "all"
                ? "Semua"
                : f === "incomplete"
                ? "Belum Selesai"
                : "Selesai"}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex justify-center gap-4 mb-6">
          <select
            className={`border rounded-lg px-5 py-2 font-semibold
              focus:outline-none focus:ring-4
              ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-yellow-400 text-gray-200" : "border-gray-300 focus:ring-blue-400"}
              transition-colors duration-300`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Urutkan tugas"
          >
            <option value="none">Urutkan</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Prioritas</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Task list */}
        <ul className="divide-y divide-gray-300 dark:divide-gray-700">
          {displayedTasks.length === 0 && (
            <li className="text-center text-gray-500 dark:text-gray-400 py-8 select-none">
              Tidak ada tugas
            </li>
          )}
          {displayedTasks.map((task, index) => (
            <li
              key={index}
              className={`flex items-center justify-between py-3 px-4 rounded-lg
                transition-colors duration-300
                ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(tasks.indexOf(task))}
                  className="w-5 h-5 cursor-pointer rounded-md accent-blue-600"
                  title="Tandai selesai"
                  aria-label={`Tandai tugas "${task.text}" selesai`}
                />

                {editIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={`flex-grow border-b focus:outline-none px-1 py-1
                        ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-white border-gray-400"
                        }
                        transition-colors duration-300`}
                      aria-label="Edit teks tugas"
                      autoFocus
                    />
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`ml-3 border rounded-lg px-2 py-1
                        ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-white border-gray-400"
                        }
                        transition-colors duration-300`}
                      aria-label="Edit deadline tugas"
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className={`ml-3 border rounded-lg px-2 py-1
                        ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-200"
                            : "bg-white border-gray-400"
                        }
                        transition-colors duration-300`}
                      aria-label="Edit prioritas tugas"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </>
                ) : (
                  <span
                    className={`flex-grow truncate select-text cursor-default
                      ${task.completed ? "line-through text-gray-400" : ""}
                      transition-colors duration-300`}
                    title={task.text}
                  >
                    {task.text}
                  </span>
                )}

                {/* Deadline */}
                <span
                  className={`ml-3 text-sm whitespace-nowrap select-none
                    ${
                      task.deadline
                        ? new Date(task.deadline) < now && !task.completed
                          ? "text-red-500 font-semibold"
                          : darkMode
                          ? "text-yellow-300"
                          : "text-yellow-700"
                        : "text-gray-400 italic"
                    }`}
                  title={task.deadline ? `Deadline: ${task.deadline}` : "Tidak ada deadline"}
                >
                  {task.deadline || "-"}
                </span>

                {/* Priority */}
                <span
                  className={`ml-3 px-2 py-0.5 text-xs rounded-full select-none
                    ${priorityColor(task.priority)}`}
                  title={`Prioritas: ${task.priority}`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 ml-3 text-lg">
                {editIndex === index ? (
                  <>
                    <button
                      onClick={() => saveEdit(index)}
                      title="Simpan"
                      className="text-green-500 hover:text-green-700 transition-colors duration-300"
                      aria-label="Simpan edit tugas"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={cancelEdit}
                      title="Batal"
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      aria-label="Batal edit tugas"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(index)}
                      title="Edit"
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
                      aria-label="Edit tugas"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteTask(index)}
                      title="Hapus"
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      aria-label="Hapus tugas"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

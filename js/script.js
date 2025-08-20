// --- Task Management ---
// Initialize counters for tasks
let taskCounter = 1;       // Unique ID counter for each task
let inProgress = 0, completed = 0; // Track tasks in progress and completed

// Priority mapping 
const priorityOrder = { High: 1, Medium: 2, Low: 3 }; // Assign numerical values for priority sorting

// ------------------- Linked List Implementation -------------------
// Node class for linked list
class ListNode {
  constructor(data) {
    this.data = data;  // The task data stored in this node
    this.next = null;  // Pointer to the next node in the list
  }
}

// Linked list class
class LinkedList {
  constructor() {
    this.head = null;  // First node in the list
    this.tail = null;  // Last node in the list
    this.size = 0;     // Number of nodes in the list
  }

  // Add node to the end of the list
  append(data) {
    const node = new ListNode(data);  // Create new node
    if (!this.head) {                 // If list is empty
      this.head = this.tail = node;   // Set head and tail to new node
    } else {                           // Otherwise
      this.tail.next = node;          // Link current tail to new node
      this.tail = node;               // Update tail
    }
    this.size++;                       // Increase list size
  }

  // Add node to the beginning of the list
  prepend(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;  // Point new node to current head
      this.head = node;       // Update head
    }
    this.size++;
  }

  // Remove a specific task from the list
  remove(task) {
    if (!this.head) return false;     // Empty list check
    if (this.head.data === task) {    // If task is at head
      this.head = this.head.next;     // Remove head
      if (!this.head) this.tail = null; // If list became empty, clear tail
      this.size--;
      return true;
    }
    let current = this.head;
    while (current.next) {            // Traverse list
      if (current.next.data === task) { // If next node matches task
        current.next = current.next.next; // Remove it
        if (!current.next) this.tail = current; // Update tail if needed
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false; // Task not found
  }

  // Find task by its ID
  findById(id) {
    let current = this.head;
    while (current) {                 // Traverse list
      if (current.data.id === id) return current.data; // Return matching task
      current = current.next;
    }
    return null; // Not found
  }

  // Execute callback for each node
  forEach(callback) {
    let current = this.head;
    while (current) {
      callback(current.data);  // Call function on task
      current = current.next;
    }
  }

  // Check if list is empty
  isEmpty() { return this.size === 0; }
}

// ------------------- Data Structures Using LinkedList -------------------
// Stack using linked list (LIFO)
class TaskStack {
  constructor() { this.list = new LinkedList(); }  // Use linked list internally
  push(task) { this.list.prepend(task); }         // Add task to top (head)
  pop() {
    if (this.list.isEmpty()) return null;          // Return null if empty
    const task = this.list.head.data;             // Get top task
    this.list.remove(task);                        // Remove it from list
    return task;                                   // Return popped task
  }
  peek() { return this.list.head ? this.list.head.data : null; } // See top without removing
  isEmpty() { return this.list.isEmpty(); }
  forEach(cb) { this.list.forEach(cb); }          // Iterate over tasks
}

// Queue using linked list (FIFO)
class TaskQueue {
  constructor() { this.list = new LinkedList(); } // Internal linked list
  enqueue(task) { this.list.append(task); }       // Add to end of queue
  dequeue() {
    if (this.list.isEmpty()) return null;         // Return null if empty
    const task = this.list.head.data;             // Get first task
    this.list.remove(task);                        // Remove it from list
    return task;                                   // Return dequeued task
  }
  front() { return this.list.head ? this.list.head.data : null; } // See first task
  isEmpty() { return this.list.isEmpty(); }
  forEach(cb) { this.list.forEach(cb); }
}

// Priority queue using linked list
class PriorityQueue {
  constructor() { this.list = new LinkedList(); }
  enqueue(task) {
    if (this.list.isEmpty()) { this.list.append(task); return; } // Empty list
    let prev = null, current = this.list.head;
    while (current && priorityOrder[current.data.priority] <= priorityOrder[task.priority]) {
      prev = current;
      current = current.next; // Find correct position
    }
    const node = new ListNode(task);
    if (!prev) {               // Insert at head
      node.next = this.list.head;
      this.list.head = node;
    } else {                   // Insert after prev
      node.next = prev.next;
      prev.next = node;
    }
    if (!node.next) this.list.tail = node; // Update tail if inserted at end
    this.list.size++;
  }
  dequeue() {                     // Remove highest priority
    if (this.list.isEmpty()) return null;
    const task = this.list.head.data;
    this.list.remove(task);
    return task;
  }
  peek() { return this.list.head ? this.list.head.data : null; } // See highest priority
  isEmpty() { return this.list.isEmpty(); }
  forEach(cb) { this.list.forEach(cb); }
}

// ------------------- Instances -------------------
let taskStack = new TaskStack();   // Stack for user LIFO actions
let taskQueue = new TaskQueue();   // Queue for normal processing
let pq = new PriorityQueue();      // Priority queue for urgent tasks
let sortByDateAsc = true;          // Toggle for date sorting

// ------------------- Core Functions -------------------
// Update task statistics display
function updateStats() {
  let totalTasks = 0;
  taskStack.forEach(t => { if (!t.status) totalTasks++; });
  document.getElementById("stats").textContent =
    `Tasks: ${totalTasks} | Completed: ${completed} | In Progress: ${inProgress}`;
}

// Add new task
function addTask(name, desc, due, priority) {
  const task = {
    id: taskCounter++,
    name,
    desc,
    added: new Date().toISOString().split("T")[0], // Date added
    due,
    priority,
    status: false
  };

  taskStack.push(task);   // Add to stack
  taskQueue.enqueue(task); // Add to queue
  pq.enqueue(task);       // Add to priority queue

  inProgress++;
  renderTasks();
}

// ------------------- Render Tasks -------------------
function renderTasks(filteredTasks = null) {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";

  let tasksToRender = [];
  if (filteredTasks) {
    tasksToRender = filteredTasks;
  } else {
    taskStack.forEach(t => { if (!t.status) tasksToRender.push(t); });
  }

  tasksToRender.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" onchange="moveToCompleted(this, ${t.id})"></td>
      <td>${t.name}</td>
      <td>${t.desc}</td>
      <td>${t.due}</td>
      <td>${t.added}</td>
      <td class="priority-${t.priority}">${t.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateStats();
  checkIfEmpty();
}

// ------------------- Task Completion -------------------
function moveToCompleted(checkbox, id) {
  if (!checkbox.checked) return;            // Only proceed if checked
  const task = taskStack.list.findById(id);
  if (!task) return;

  task.status = true;                        // Mark task as done
  completed++;
  inProgress--;

  const completedBody = document.getElementById("completedModalBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${task.name}</td>
    <td>${task.desc}</td>
    <td>${task.due}</td>
    <td>${task.added}</td>
    <td class="priority-${task.priority}">${task.priority}</td>
    <td style="text-align:center;">
      <button class="remove-btn" onclick="removeTask(${task.id})">×</button>
    </td>
  `;
  completedBody.insertBefore(row, completedBody.firstChild);

  renderTasks();
}

// ------------------- Sorting -------------------
function sortByPriority() {
  const sorted = [];
  taskStack.forEach(t => { if (!t.status) sorted.push(t); });
  sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]); // Sort numerically
  renderTasks(sorted);
}

function sortByDateAdded() {
  const sorted = [];
  taskStack.forEach(t => { if (!t.status) sorted.push(t); });
  sorted.sort((a, b) => sortByDateAsc
    ? new Date(a.added) - new Date(b.added)
    : new Date(b.added) - new Date(a.added));
  renderTasks(sorted);
  sortByDateAsc = !sortByDateAsc;
}

function sortByStack() {
  renderTasks(); // Render as stack order (latest first)
}

// ------------------- Extra Features -------------------
function undoTask() {
  const lastTask = taskStack.pop(); // Remove last added task
  if (lastTask) removeTask(lastTask.id);
}

function processNextTask() {
  const task = taskQueue.dequeue(); // Process first task in queue
  if (task) moveToCompleted({ checked: true }, task.id);
}

function processUrgentTask() {
  const urgent = pq.dequeue();      // Process highest priority task
  if (urgent) moveToCompleted({ checked: true }, urgent.id);
}

// ------------------- Modal & Form -------------------
const modal = document.getElementById("taskModal");
const span = document.querySelector(".close");
const form = document.getElementById("taskForm");

function openTaskDialog() { modal.style.display = "block"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const due = document.getElementById("taskDue").value;

  if (!name || !desc || !due) { alert("Please fill in all fields!"); return; }

  addTask(name, desc, due, priority);
  form.reset();
  modal.style.display = "none";
});

// ------------------- Completed Tasks Modal -------------------
function toggleCompleted() {
  const completedModal = document.getElementById("completedModal");
  const completedModalBody = document.getElementById("completedModalBody");
  completedModalBody.innerHTML = "";

  const completedTasks = [];
  taskStack.forEach(t => { if (t.status) completedTasks.unshift(t); });

  completedTasks.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.name}</td>
      <td>${t.desc}</td>
      <td>${t.due}</td>
      <td>${t.added}</td>
      <td class="priority-${t.priority}">${t.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
      </td>
    `;
    completedModalBody.appendChild(row);
  });

  completedModal.style.display = "block";
}

document.getElementById("completedClose").onclick = () => {
  document.getElementById("completedModal").style.display = "none";
};

// ------------------- Utilities -------------------
function checkIfEmpty() {
  const tbody = document.querySelector("#taskTable tbody");
  const noTasksMessage = document.getElementById("noTasksMessage");
  noTasksMessage.style.display = tbody.children.length === 0 ? "block" : "none";
}

const taskDueInput = document.getElementById("taskDue");
taskDueInput.setAttribute("min", new Date().toISOString().split("T")[0]);

// Loader animation
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200);
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  checkIfEmpty();
});

// ------------------- Delete Confirmation Modal -------------------
let taskToDelete = null;

function removeTask(id) {
  taskToDelete = id;
  document.getElementById("deleteModal").style.display = "block"; // Show delete confirmation
}

document.getElementById("confirmDelete").onclick = () => {
  if (taskToDelete !== null) {
    const task = taskStack.list.findById(taskToDelete);
    if (task) {
      if (task.status) completed--; else inProgress--;   // Adjust counters
      taskStack.list.remove(task);
      taskQueue.list.remove(task);
      pq.list.remove(task);

      const completedRows = document.querySelectorAll("#completedModalBody tr");
      completedRows.forEach(row => { if (row.innerHTML.includes(`removeTask(${taskToDelete})`)) row.remove(); });

      renderTasks();
      updateStats();
    }

    taskToDelete = null;
    document.getElementById("deleteModal").style.display = "none";
  }
};

document.getElementById("cancelDelete").onclick = () => {
  taskToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
};

window.addEventListener("click", (e) => {
  const deleteModal = document.getElementById("deleteModal");
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
    taskToDelete = null;
  }
});

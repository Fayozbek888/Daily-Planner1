const signupSection = document.getElementById('signup-section');
const loginSection = document.getElementById('login-section');
const plannerSection = document.getElementById('planner-section');

document.getElementById('showLogin').addEventListener('click', () => {
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

document.getElementById('showSignup').addEventListener('click', () => {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
});

const todayEl = document.getElementById('today');
const helloName = document.getElementById('helloName');
const d = new Date();

todayEl.textContent = d.toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

function nowTs() {
    return new Date().toISOString();
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const signupBtn = document.getElementById('signupBtn');
signupBtn.addEventListener('click', () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const pass = document.getElementById('signupPass').value;

    if (!name || !email || !pass) {
        alert("Iltimos, barcha maydonlarni to'ldiring");
        return;
    }

    localStorage.setItem('user', JSON.stringify({ name, email, pass }));
    startSession({ name, email });
    signupSection.classList.add('hidden');
    plannerSection.classList.remove('hidden');
});

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user && email === user.email && pass === user.pass) {
        startSession(user);
        loginSection.classList.add('hidden');
        plannerSection.classList.remove('hidden');
    } else {
        alert('Email yoki parol xato');
    }
});

function startSession(u) {
    helloName.textContent = 'Salom, ' + u.name + '!';
}

const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime'); // <-- yangi input
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
let filter = 'all';

function key() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user ? `tasks_${user.email}` : 'tasks_guest';
}

function load() {
    return JSON.parse(localStorage.getItem(key()) || '[]');
}

function save(list) {
    localStorage.setItem(key(), JSON.stringify(list));
}

function render() {
    const items = load();
    taskList.innerHTML = '';

    const filtered = items.filter(i =>
        filter === 'all' ||
        (filter === 'active' && !i.done) ||
        (filter === 'done' && i.done)
    );

    if (!filtered.length) {
        const e = document.createElement('div');
        e.className = 'empty';
        e.textContent = "Vazifalar yo'q. Yangi vazifa qo'shing.";
        taskList.appendChild(e);
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('div');
        row.className = 'slot' + (item.done ? ' done' : '');
        row.dataset.id = item.id;

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = item.time || new Date(item.createdAt).toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = item.done;
        cb.addEventListener('change', () => toggle(item.id));

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = item.text;

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = item.done ? 'Bajarilgan' : 'Yangi';

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-ghost btn-sm';
        editBtn.textContent = 'Tahrirlash';
        editBtn.addEventListener('click', () => edit(item.id));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.textContent = "O'chirish";
        delBtn.addEventListener('click', () => remove(item.id));

        actions.append(editBtn, delBtn);
        row.append(cb, time, title, meta, actions);
        taskList.appendChild(row);
    });
}

function add() {
    const text = taskInput.value.trim();
    const timeVal = taskTime.value; // foydalanuvchi kiritgan vaqt

    if (!text) return;

    const items = load();
    items.unshift({
        id: uid(),
        text,
        time: timeVal, // shu joyda vaqtni saqlaymiz
        done: false,
        createdAt: nowTs()
    });

    save(items);
    taskInput.value = '';
    taskTime.value = ''; // vaqtni ham tozalaymiz
    render();
}

function toggle(id) {
    const items = load().map(i =>
        i.id === id ? { ...i, done: !i.done } : i
    );
    save(items);
    render();
}

function edit(id) {
    const items = load();
    const target = items.find(i => i.id === id);
    if (!target) return;

    const val = prompt('Vazifani tahrirlash:', target.text) || '';
    const tx = val.trim();
    if (!tx) return;

    target.text = tx;
    save(items);
    render();
}

function remove(id) {
    const items = load().filter(i => i.id !== id);
    save(items);
    render();
}

function clearDone() {
    const items = load().filter(i => !i.done);
    save(items);
    render();
}

addTaskBtn.addEventListener('click', add);

taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') add();
});

document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x =>
            x.classList.remove('active')
        );
        t.classList.add('active');
        filter = t.dataset.filter;
        render();
    })
);

document.getElementById('clearDone').addEventListener('click', clearDone);

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    plannerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

function init() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        startSession(user);
        signupSection.classList.add('hidden');
        loginSection.classList.add('hidden');
        plannerSection.classList.remove('hidden');
    }
    render();
}
init();

Array.from(document.querySelectorAll('.toggle-eye')).forEach(el => {
    el.addEventListener('click', () => {
        const id = el.getAttribute('data-toggle');
        const inp = document.getElementById(id);
        inp.type = inp.type === 'password' ? 'text' : 'password';
        el.textContent = inp.type === 'password' ? 'Ko‘rish' : 'Yashirish';
    });
});

let currentUser = "", activeChat = "", selectedMsgId = null;
let contacts = JSON.parse(localStorage.getItem('naka_contacts')) || [{id: 1, name: 'Служба NAKA', color: '#007BFF'}];

// АВТОРИЗАЦИЯ И БИОМЕТРИЯ
function login() {
    const name = document.getElementById('user-name').value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('naka_user', name);
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        document.getElementById('profile-name-display').innerText = name;
        renderChats(contacts);
    }
}

function unlockApp() { document.getElementById('biometric-screen').classList.add('hidden'); }

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('naka_dark', document.body.classList.contains('dark'));
}

// ПОИСК ПО НОМЕРУ И QR
function promptAddContact() { document.getElementById('add-modal').classList.remove('hidden'); }

function confirmAddContact() {
    const nameInp = document.getElementById('new-name').value.trim();
    const phoneInp = document.getElementById('new-phone').value.trim();
    const isGrp = document.getElementById('is-group').checked;

    let finalName = nameInp || phoneInp;

    if (finalName) {
        const newC = { id: Date.now(), name: finalName, color: '#' + Math.floor(Math.random()*16777215).toString(16), isGroup: isGrp };
        contacts.push(newC);
        localStorage.setItem('naka_contacts', JSON.stringify(contacts));
        renderChats(contacts);
        document.getElementById('add-modal').classList.add('hidden');
        openChat(finalName);
    }
}

function showMyQR() {
    const qrImg = document.getElementById('qr-img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=naka_user:${currentUser}`;
    document.getElementById('qr-modal').classList.remove('hidden');
}

function startQRScan() {
    const code = prompt("Сканирование QR... Введите код (имитация): naka_user:Алексей");
    if (code && code.startsWith("naka_user:")) {
        const name = code.split(":")[1];
        document.getElementById('new-name').value = name;
        confirmAddContact();
    }
}

// ЧАТ И СООБЩЕНИЯ
function openChat(name) {
    activeChat = name;
    document.getElementById('chat-title').innerText = name;
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('chat-window').classList.remove('hidden');
    loadMessages();
}

function closeChat() {
    document.getElementById('chat-window').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    if (input.value.trim()) {
        const msg = {
            id: Date.now(),
            text: input.value,
            sender: 'me',
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        };
        let history = JSON.parse(localStorage.getItem('messages_' + activeChat) || "[]");
        history.push(msg);
        localStorage.setItem('messages_' + activeChat, JSON.stringify(history));
        input.value = "";
        loadMessages();
    }
}

function loadMessages() {
    const history = JSON.parse(localStorage.getItem('messages_' + activeChat) || "[]");
    const container = document.getElementById('messages');
    container.innerHTML = history.map(m => `
        <div class="bubble ${m.sender === 'me' ? 'out' : 'in'}" onclick="openActionMenu(${m.id})">
            ${m.text}
            <div style="font-size:10px; opacity:0.5; text-align:right;">${m.time}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

function renderChats(list) {
    const container = document.getElementById('tab-chats');
    container.innerHTML = list.map(c => `
        <div class="chat-item" onclick="openChat('${c.name}')" style="display:flex; padding:15px; align-items:center; gap:12px; border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer;">
            <div style="width:50px; height:50px; border-radius:50%; background:${c.color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px;">${c.name[0]}</div>
            <div style="flex:1"><b>${c.name}</b></div>
        </div>
    `).join('');
}

// МЕНЮ
function openActionMenu(id) { selectedMsgId = id; document.getElementById('action-menu').classList.remove('hidden'); }
function closeMenu() { document.getElementById('action-menu').classList.add('hidden'); }
function confirmDelete() {
    let history = JSON.parse(localStorage.getItem('messages_' + activeChat));
    history = history.filter(m => m.id !== selectedMsgId);
    localStorage.setItem('messages_' + activeChat, JSON.stringify(history));
    loadMessages(); closeMenu();
}

window.onload = () => {
    if(localStorage.getItem('naka_user')) { 
        document.getElementById('user-name').value = localStorage.getItem('naka_user');
        login(); 
        document.getElementById('biometric-screen').classList.remove('hidden');
    }
};

// Fantastic Beasts - Monster Brawl App

// State Management
const state = {
    currentUser: null,
    avatar: {
        body: 'round',
        bodyColor: '#FF6B6B',
        eyes: 'normal',
        mouth: 'smile',
        accessory: 'none',
        bgColor: '#2C3E50'
    },
    settings: {
        theme: 'dark',
        animations: true,
        sfx: true,
        music: true,
        volume: 80,
        hints: true,
        difficulty: 'normal'
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    setupEventListeners();
    setupAvatarCreator();
});

// User Management
function loadUser() {
    const savedUser = localStorage.getItem('fb_user');
    const savedSettings = localStorage.getItem('fb_settings');
    
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
        applySettings();
    }
    
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showScreen('menu-screen');
        updateUserHeader();
    } else {
        showScreen('auth-screen');
    }
}

function saveUser(user) {
    state.currentUser = user;
    localStorage.setItem('fb_user', JSON.stringify(user));
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('fb_user');
    showScreen('auth-screen');
}

// Event Listeners
function setupEventListeners() {
    // Auth Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab));
    });
    
    // Login Form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register Form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Avatar Creator
    document.getElementById('randomize-btn').addEventListener('click', randomizeAvatar);
    document.getElementById('save-avatar-btn').addEventListener('click', saveAvatar);
    
    // Menu Navigation
    document.querySelectorAll('.menu-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('settings-btn').addEventListener('click', () => navigateTo('settings'));
    
    // Back Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            showScreen('menu-screen');
        });
    });
    
    // Settings
    document.getElementById('theme-select').addEventListener('change', (e) => {
        state.settings.theme = e.target.value;
        saveSettings();
    });
    
    document.getElementById('animations-toggle').addEventListener('change', (e) => {
        state.settings.animations = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('sfx-toggle').addEventListener('change', (e) => {
        state.settings.sfx = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('music-toggle').addEventListener('change', (e) => {
        state.settings.music = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        state.settings.volume = e.target.value;
        saveSettings();
    });
    
    document.getElementById('hints-toggle').addEventListener('change', (e) => {
        state.settings.hints = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('difficulty-select').addEventListener('change', (e) => {
        state.settings.difficulty = e.target.value;
        saveSettings();
    });
    
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
    document.getElementById('change-password-btn').addEventListener('click', changePassword);
    
    document.getElementById('settings-display-name').addEventListener('change', (e) => {
        if (state.currentUser) {
            state.currentUser.displayName = e.target.value;
            saveUser(state.currentUser);
            updateUserHeader();
        }
    });
}

// Auth Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tab}-form`);
    });
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('fb_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        saveUser(user);
        showScreen('avatar-screen');
    } else {
        document.getElementById('login-error').textContent = 'Invalid username or password';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const displayName = document.getElementById('reg-displayname').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (password !== confirm) {
        document.getElementById('register-error').textContent = 'Passwords do not match';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('fb_users') || '[]');
    
    if (users.find(u => u.username === username)) {
        document.getElementById('register-error').textContent = 'Username already exists';
        return;
    }
    
    const newUser = {
        username,
        displayName,
        password,
        level: 1,
        xp: 0,
        beasts: [],
        created: Date.now()
    };
    
    users.push(newUser);
    localStorage.setItem('fb_users', JSON.stringify(users));
    
    saveUser(newUser);
    showScreen('avatar-screen');
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
}

function navigateTo(page) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const pageEl = document.getElementById(`${page}-page`);
    if (pageEl) {
        pageEl.classList.add('active');
    }
    
    if (page === 'settings') {
        loadSettings();
    }
}

// Avatar Creator
function setupAvatarCreator() {
    // Body shape buttons
    document.querySelectorAll('[data-part="body"]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.avatar.body = btn.dataset.value;
            updateAvatarSelection();
            drawAvatar();
        });
    });
    
    // Color buttons
    document.querySelectorAll('[data-part="bodyColor"], [data-part="bgColor"]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.avatar[btn.dataset.part] = btn.dataset.value;
            updateAvatarSelection();
            drawAvatar();
        });
    });
    
    // Eyes, mouth, accessory buttons
    ['eyes', 'mouth', 'accessory'].forEach(part => {
        document.querySelectorAll(`[data-part="${part}"]`).forEach(btn => {
            btn.addEventListener('click', () => {
                state.avatar[part] = btn.dataset.value;
                updateAvatarSelection();
                drawAvatar();
            });
        });
    });
    
    // Initial draw
    updateAvatarSelection();
    drawAvatar();
}

function updateAvatarSelection() {
    document.querySelectorAll('.option-btn, .color-btn').forEach(btn => {
        const part = btn.dataset.part;
        const value = btn.dataset.value;
        if (part && state.avatar[part] === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function drawAvatar() {
    const canvas = document.getElementById('avatar-canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    const center = size / 2;
    
    // Clear canvas
    ctx.fillStyle = state.avatar.bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw body
    ctx.fillStyle = state.avatar.bodyColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    const bodySize = 80;
    
    switch (state.avatar.body) {
        case 'round':
            ctx.beginPath();
            ctx.arc(center, center, bodySize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'square':
            ctx.fillRect(center - bodySize, center - bodySize, bodySize * 2, bodySize * 2);
            ctx.strokeRect(center - bodySize, center - bodySize, bodySize * 2, bodySize * 2);
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(center, center - bodySize);
            ctx.lineTo(center + bodySize, center + bodySize);
            ctx.lineTo(center - bodySize, center + bodySize);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'star':
            drawStar(ctx, center, center, 5, bodySize, bodySize / 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'diamond':
            ctx.beginPath();
            ctx.moveTo(center, center - bodySize);
            ctx.lineTo(center + bodySize, center);
            ctx.lineTo(center, center + bodySize);
            ctx.lineTo(center - bodySize, center);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
    
    // Draw eyes
    ctx.fillStyle = '#000';
    const eyeY = center - 20;
    
    switch (state.avatar.eyes) {
        case 'normal':
            ctx.beginPath();
            ctx.arc(center - 25, eyeY, 10, 0, Math.PI * 2);
            ctx.arc(center + 25, eyeY, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'big':
            ctx.beginPath();
            ctx.arc(center - 25, eyeY, 15, 0, Math.PI * 2);
            ctx.arc(center + 25, eyeY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(center - 25, eyeY - 5, 5, 0, Math.PI * 2);
            ctx.arc(center + 25, eyeY - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'angry':
            ctx.beginPath();
            ctx.moveTo(center - 35, eyeY - 10);
            ctx.lineTo(center - 15, eyeY + 5);
            ctx.moveTo(center + 35, eyeY - 10);
            ctx.lineTo(center + 15, eyeY + 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(center - 25, eyeY + 5, 8, 0, Math.PI * 2);
            ctx.arc(center + 25, eyeY + 5, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'wink':
            ctx.beginPath();
            ctx.arc(center - 25, eyeY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(center + 15, eyeY);
            ctx.lineTo(center + 35, eyeY);
            ctx.stroke();
            break;
        case 'cyclops':
            ctx.beginPath();
            ctx.arc(center, eyeY, 15, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    // Draw mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const mouthY = center + 20;
    
    switch (state.avatar.mouth) {
        case 'smile':
            ctx.beginPath();
            ctx.arc(center, mouthY - 10, 20, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
            break;
        case 'frown':
            ctx.beginPath();
            ctx.arc(center, mouthY + 25, 20, 1.2 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();
            break;
        case 'open':
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(center, mouthY, 15, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'tongue':
            ctx.beginPath();
            ctx.arc(center, mouthY - 10, 20, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.ellipse(center, mouthY + 15, 10, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'sharp':
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(center - 20, mouthY);
            ctx.lineTo(center - 10, mouthY + 20);
            ctx.lineTo(center, mouthY);
            ctx.lineTo(center + 10, mouthY + 20);
            ctx.lineTo(center + 20, mouthY);
            ctx.closePath();
            ctx.fill();
            break;
    }
    
    // Draw accessory
    ctx.strokeStyle = '#FFD700';
    ctx.fillStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    switch (state.avatar.accessory) {
        case 'glasses':
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(center - 25, eyeY, 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(center + 25, eyeY, 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(center - 7, eyeY);
            ctx.lineTo(center + 7, eyeY);
            ctx.stroke();
            break;
        case 'hat':
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(center - 40, center - bodySize - 30, 80, 10);
            ctx.fillRect(center - 25, center - bodySize - 60, 50, 30);
            ctx.fillStyle = '#654321';
            ctx.fillRect(center - 25, center - bodySize - 35, 50, 5);
            break;
        case 'bow':
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.moveTo(center, center - bodySize);
            ctx.lineTo(center - 20, center - bodySize - 20);
            ctx.lineTo(center - 20, center - bodySize + 10);
            ctx.lineTo(center, center - bodySize);
            ctx.lineTo(center + 20, center - bodySize - 20);
            ctx.lineTo(center + 20, center - bodySize + 10);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(center, center - bodySize, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'crown':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(center - 30, center - bodySize - 25, 60, 15);
            ctx.beginPath();
            ctx.moveTo(center - 30, center - bodySize - 25);
            ctx.lineTo(center - 20, center - bodySize - 45);
            ctx.lineTo(center - 10, center - bodySize - 25);
            ctx.lineTo(center, center - bodySize - 40);
            ctx.lineTo(center + 10, center - bodySize - 25);
            ctx.lineTo(center + 20, center - bodySize - 45);
            ctx.lineTo(center + 30, center - bodySize - 25);
            ctx.closePath();
            ctx.fill();
            break;
    }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

function randomizeAvatar() {
    const bodies = ['round', 'square', 'triangle', 'star', 'diamond'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const eyes = ['normal', 'big', 'angry', 'wink', 'cyclops'];
    const mouths = ['smile', 'frown', 'open', 'tongue', 'sharp'];
    const accessories = ['none', 'glasses', 'hat', 'bow', 'crown'];
    const bgColors = ['#2C3E50', '#8E44AD', '#27AE60', '#E74C3C', '#F39C12', '#1ABC9C'];
    
    state.avatar.body = bodies[Math.floor(Math.random() * bodies.length)];
    state.avatar.bodyColor = colors[Math.floor(Math.random() * colors.length)];
    state.avatar.eyes = eyes[Math.floor(Math.random() * eyes.length)];
    state.avatar.mouth = mouths[Math.floor(Math.random() * mouths.length)];
    state.avatar.accessory = accessories[Math.floor(Math.random() * accessories.length)];
    state.avatar.bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    
    updateAvatarSelection();
    drawAvatar();
}

function saveAvatar() {
    if (state.currentUser) {
        state.currentUser.avatar = {...state.avatar};
        saveUser(state.currentUser);
        updateUserHeader();
        showScreen('menu-screen');
    }
}

function updateUserHeader() {
    if (state.currentUser) {
        document.getElementById('user-display-name').textContent = state.currentUser.displayName;
        document.getElementById('user-level').textContent = `Level ${state.currentUser.level || 1}`;
        document.getElementById('settings-display-name').value = state.currentUser.displayName;
        
        // Draw mini avatar in header
        const headerCanvas = document.getElementById('header-avatar');
        if (headerCanvas && state.currentUser.avatar) {
            state.avatar = {...state.currentUser.avatar};
            const ctx = headerCanvas.getContext('2d');
            const size = 60;
            const center = size / 2;
            
            ctx.fillStyle = state.avatar.bgColor;
            ctx.fillRect(0, 0, size, size);
            
            ctx.fillStyle = state.avatar.bodyColor;
            const bodySize = 20;
            
            switch (state.avatar.body) {
                case 'round':
                    ctx.beginPath();
                    ctx.arc(center, center, bodySize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(center - bodySize, center - bodySize, bodySize * 2, bodySize * 2);
                    break;
                default:
                    ctx.beginPath();
                    ctx.arc(center, center, bodySize, 0, Math.PI * 2);
                    ctx.fill();
            }
        }
    }
}

// Settings
function loadSettings() {
    document.getElementById('theme-select').value = state.settings.theme;
    document.getElementById('animations-toggle').checked = state.settings.animations;
    document.getElementById('sfx-toggle').checked = state.settings.sfx;
    document.getElementById('music-toggle').checked = state.settings.music;
    document.getElementById('volume-slider').value = state.settings.volume;
    document.getElementById('hints-toggle').checked = state.settings.hints;
    document.getElementById('difficulty-select').value = state.settings.difficulty;
}

function saveSettings() {
    localStorage.setItem('fb_settings', JSON.stringify(state.settings));
    applySettings();
}

function applySettings() {
    if (state.settings.theme === 'light') {
        document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        document.body.style.color = '#2c3e50';
    } else if (state.settings.theme === 'fantasy') {
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        document.body.style.color = '#ecf0f1';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #1A1A2E 0%, #0F0F23 100%)';
        document.body.style.color = '#ecf0f1';
    }
}

function clearAllData() {
    if (confirm('Are you sure? This will delete all your data including accounts and beasts.')) {
        localStorage.clear();
        state.currentUser = null;
        showScreen('auth-screen');
    }
}

function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 6) {
        const users = JSON.parse(localStorage.getItem('fb_users') || '[]');
        const userIndex = users.findIndex(u => u.username === state.currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('fb_users', JSON.stringify(users));
            state.currentUser.password = newPassword;
            saveUser(state.currentUser);
            alert('Password changed successfully!');
        }
    } else if (newPassword) {
        alert('Password must be at least 6 characters');
    }
}

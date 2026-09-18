import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    getDocs,
    where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { Moderation } from "../moderation.js";

import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const messagesContainer = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const loginPrompt = document.getElementById('login-prompt');

// Auth UI Elements
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authUsername = document.getElementById('auth-username');
const registerFields = document.getElementById('register-fields');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const closeAuthModalBtn = document.getElementById('close-auth-modal');
const loginBtnHeader = document.getElementById('login-btn-header');
const loginBtnPrompt = document.getElementById('login-btn-prompt');
const userInfo = document.getElementById('user-info');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentUser = null;
let userIP = 'UNKNOWN';
let isBanned = false;
let isRegistering = false;

// SECURITY NOTE: This client-side IP ban check is a UX convenience only.
// Real enforcement MUST be done via Firestore Security Rules that deny writes
// from banned UIDs, and/or via server-level firewall (iptables/ufw/Nginx deny).
// A malicious user can trivially bypass this JS check from the browser console.
async function checkIP() {
    try {
        const response = await fetch('/api/get_ip.php');
        const data = await response.json();
        userIP = data.ip;

        const bannedRef = collection(db, "banned_ips");
        const q = query(bannedRef, where("ip", "==", userIP));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            isBanned = true;
            lockChat("⛔ ACCESO DENEGADO: Tu IP ha sido baneada.");
        }
    } catch (error) {
        console.error("Error checking IP:", error);
    }
}

function lockChat(reason) {
    chatForm.style.display = 'none';
    loginPrompt.style.display = 'block';
    loginPrompt.innerHTML = `<div style="color: red; font-family: 'Inter', sans-serif;">${reason}</div>`;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayMessage(data, id) {
    const isOwn = currentUser && data.uid === currentUser.uid;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isOwn ? 'own' : ''}`;
    msgDiv.dataset.id = id;

    const time = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
    const username = data.username || data.displayName || 'Anónimo';

    // SECURITY: Sanitize all user-controlled data before injecting into innerHTML
    // to prevent Stored XSS from messages written directly to Firestore bypassing
    // client-side filters. DOMPurify strips malicious tags/attributes.
    const safeUsername = isOwn ? 'TÚ' : DOMPurify.sanitize(username, { ALLOWED_TAGS: [] });
    const safeText = DOMPurify.sanitize(data.text, { ALLOWED_TAGS: [] });

    msgDiv.innerHTML = `
        <div class="message-header">
            ${safeUsername} <span style="opacity:0.5">[${time}]</span>
        </div>
        <div class="message-content">
            ${safeText} 
        </div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function initChat() {
    checkIP();

    const q = query(collection(db, "global_chat"), orderBy("createdAt", "desc"), limit(50));

    onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges();

        if (snapshot.size > 0 && messagesContainer.children.length <= 1) {
            messagesContainer.innerHTML = '';
            const docs = [...snapshot.docs].reverse();
            docs.forEach(doc => displayMessage(doc.data(), doc.id));
        } else {
            changes.forEach((change) => {
                if (change.type === "added") {
                    if (!document.querySelector(`.message[data-id="${change.doc.id}"]`)) {
                        displayMessage(change.doc.data(), change.doc.id);
                    }
                }
            });
        }
    });
}

// --- Auth Functions ---

function toggleAuthModal(show) {
    authModal.style.display = show ? 'flex' : 'none';
    if (!show) {
        authForm.reset();
        isRegistering = false;
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (isRegistering) {
        registerFields.style.display = 'block';
        authSubmitBtn.textContent = 'REGISTRARSE';
        toggleAuthModeBtn.textContent = '¿Ya tienes cuenta? Inicia Sesión';
        authUsername.required = true;
    } else {
        registerFields.style.display = 'none';
        authSubmitBtn.textContent = 'LOGIN';
        toggleAuthModeBtn.textContent = '¿No tienes cuenta? Regístrate';
        authUsername.required = false;
    }
}

// --- Event Listeners ---

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        // Logged In
        loginBtnHeader.style.display = 'none';
        userInfo.style.display = 'flex';
        userDisplayName.textContent = user.displayName || user.email;

        if (!isBanned) {
            chatForm.style.display = 'flex';
            loginPrompt.style.display = 'none';
        }
    } else {
        // Logged Out
        loginBtnHeader.style.display = 'block';
        userInfo.style.display = 'none';
        userDisplayName.textContent = '';

        chatForm.style.display = 'none';
        loginPrompt.style.display = 'block';
    }
});

// Auth Modal Controls
loginBtnHeader.addEventListener('click', () => toggleAuthModal(true));
loginBtnPrompt.addEventListener('click', () => toggleAuthModal(true));
closeAuthModalBtn.addEventListener('click', () => toggleAuthModal(false));

toggleAuthModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    updateAuthUI();
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).catch((error) => {
        // Silent fail
    });
});

// Auth Form Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = authEmail.value;
    const password = authPassword.value;
    const username = authUsername.value;

    try {
        if (isRegistering) {
            // Register
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Profile with Username
            await updateProfile(user, {
                displayName: username
            });

            // Force reload to update UI with display name
            userDisplayName.textContent = username;

        } else {
            // Login
            await signInWithEmailAndPassword(auth, email, password);
        }

        toggleAuthModal(false);

    } catch (error) {
        console.error("Auth Error:", error);
        alert("Error de autenticación: " + error.message);
    }
});

// Chat Send
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isBanned || !currentUser) return;

    const text = messageInput.value.trim();

    if (!text) return;

    // 1. Anti-Spam Check
    if (Moderation.isSpamming()) {
        alert("¡Escribes muy rápido! Espera unos segundos.");
        return;
    }

    // 2. Process Message
    const processedText = Moderation.processMessage(text);
    if (!processedText) return;

    messageInput.value = '';
    sendBtn.disabled = true;

    try {
        await addDoc(collection(db, "global_chat"), {
            uid: currentUser.uid,
            username: currentUser.displayName || 'Usuario',
            email: currentUser.email, // Optional: keep for admin reference
            text: processedText,
            ip: userIP,
            createdAt: serverTimestamp()
        });

        sendBtn.disabled = false;
        messageInput.focus();

    } catch (error) {
        console.error("Error sending message:", error);
        alert("Error al enviar mensaje.");
        sendBtn.disabled = false;
    }
});

// Initialize
initChat();

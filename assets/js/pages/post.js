import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { firebaseConfig } from '../firebase-config.js';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postContentContainer = document.getElementById('post-content');

// Helper para obtener params de la URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

async function loadPost() {
    if (!postId) {
        postContentContainer.innerHTML = "<h2 style='color:red;'>Error: No se especificó el ID del post.</h2>";
        return;
    }

    try {
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = docSnap.data();
            const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha desconocida';
            
            // Configurar Showdown para convertir Markdown a HTML
            const converter = new showdown.Converter({
                tables: true,
                strikethrough: true,
                tasklists: true,
                emoji: true
            });
            
            // Si el post tiene un campo 'markdown', usarlo. Si no, usar 'content' por retrocompatibilidad.
            const rawContent = post.markdown || post.content || "*Contenido vacío*";
            const rawHtml = converter.makeHtml(rawContent);
            const safeHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;

            function escapeHtml(str) {
                const div = document.createElement('div');
                div.textContent = str || '';
                return div.innerHTML;
            }

            postContentContainer.innerHTML = `
                <a href="blog" style="color:#00f2fe; text-decoration:none; font-family:'Fira Code', monospace; margin-bottom:20px; display:inline-block;"><- Volver al blog</a>
                <h1>${escapeHtml(post.title || 'Sin Título')}</h1>
                <span class="post-date"><i class="far fa-calendar-alt"></i> ${postDate}</span>
                <div class="markdown-body">
                    ${safeHtml}
                </div>
            `;
            
            // Actualizar título de la página
            document.title = `${post.title || 'Post'} - davito's blog`;
            
        } else {
            postContentContainer.innerHTML = "<h2 style='color:red;'>Error: El post no existe.</h2>";
        }
    } catch (error) {
        console.error("Error al cargar el post:", error);
        postContentContainer.innerHTML = "<h2 style='color:red;'>Error de conexión al cargar el post.</h2>";
    }
}

loadPost();

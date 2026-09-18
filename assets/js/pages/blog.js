import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from '../firebase-config.js';
const app = initializeApp(firebaseConfig, "BlogApp");
const db = getFirestore(app);

const postListContainer = document.getElementById('post-list');

async function loadPosts() {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            postListContainer.innerHTML = "<p style='text-align:center; color:#666;'>Aún no hay entradas en el blog.</p>";
            return;
        }
        
        postListContainer.innerHTML = ''; // Clear loading text
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;

            const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Fecha desconocida';
            
            const postCard = document.createElement('a');
            postCard.href = `post?id=${postId}`;
            postCard.className = 'post-summary-card';
            postCard.style.cssText = 'display:block; padding:15px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; text-decoration:none; transition:transform 0.2s;';

            function escapeHtml(str) {
                const div = document.createElement('div');
                div.textContent = str || '';
                return div.innerHTML;
            }

            postCard.innerHTML = `
                <h3 style="color:#00f2fe; margin-bottom:8px; font-size:1.1rem;">${escapeHtml(post.title)}</h3>
                <p style="color:#888; font-size:0.8rem;"><i class="far fa-calendar-alt"></i> ${postDate}</p>
            `;
            postListContainer.appendChild(postCard);
            
            postCard.addEventListener('mouseover', () => postCard.style.transform = 'translateY(-2px)');
            postCard.addEventListener('mouseout', () => postCard.style.transform = 'translateY(0)');
        });
    } catch (error) {
        console.error("Error al cargar los posts:", error);
        postListContainer.innerHTML = "<p style='color:red; text-align:center;'>Error al cargar el blog.</p>";
    }
}

// Load posts
loadPosts();

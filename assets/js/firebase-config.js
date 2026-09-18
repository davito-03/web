/**
 * Firebase web config (public by design — restrict the key in Google Cloud Console).
 *
 * Restrict this API key:
 *   Google Cloud Console → APIs & Services → Credentials → this key
 *   Application restrictions: HTTP referrers
 *     https://davito.es/*
 *     https://www.davito.es/*
 *   API restrictions: Identity Toolkit, Firestore, (and FCM if used)
 */
export const firebaseConfig = {
    apiKey: "AIzaSyA4Oc7k-e51VEUe4-P89o1lyHmJqgQ_CHI",
    authDomain: "contador-web-davito.firebaseapp.com",
    projectId: "contador-web-davito",
    storageBucket: "contador-web-davito.firebasestorage.app",
    messagingSenderId: "206315029454",
    appId: "1:206315029454:web:c7a4db635e9619d3aba19f"
};

if (typeof window !== "undefined") {
    window.DAVITO_FIREBASE = firebaseConfig;
}

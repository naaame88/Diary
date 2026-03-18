import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

// 본인의 Firebase Config 정보를 입력하세요
const firebaseConfig = {
    apiKey: "AIzaSyAMbJOpvmaPUlSktwl1lmdW28UuQmKp82I",
    authDomain: "my-cat-diary-be00a.firebaseapp.com",
    projectId: "my-cat-diary-be00a",
    storageBucket: "my-cat-diary-be00a.firebasestorage.app",
    messagingSenderId: "562714697589",
    appId: "1:562714697589:web:cc8a1d6ab2a25d19843d3c",
    measurementId: "G-D52BNH1T14"
};  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadDiaries() {
    const container = document.getElementById('diary-container');
    const q = query(collection(db, "diaries"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    container.innerHTML = ''; 

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }).toUpperCase() : "DATE UNKNOWN";

        // 썸네일 선택 로직
        let thumbnail = 'images/cat-main.png';
        if (data.sections && data.sections.length > 0) {
            const tIdx = data.thumbnailIndex || 0;
            thumbnail = data.sections[tIdx].img;
        }

        const itemHtml = `
            <a href="detail.html?id=${doc.id}" class="diary-item" style="text-decoration: none; color: inherit; display: flex; align-items: center; padding: 30px 0; border-bottom: 1px solid #eee;">
                <div class="item-info" style="flex: 1;">
                    <span style="font-size: 0.7rem; color: #aaa; letter-spacing: 2px;">${date}</span>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-top: 10px;">${data.title}</h2>
                </div>
                <div class="item-thumbnail" style="width: 120px; height: 80px; margin-left: 20px; overflow: hidden;">
                    <img src="${thumbnail}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </a>
        `;
        container.innerHTML += itemHtml;
    });
}
loadDiaries();
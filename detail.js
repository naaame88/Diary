import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

const urlParams = new URLSearchParams(window.location.search);
const diaryId = urlParams.get('id');

async function loadDetail() {
    if (!diaryId) return;
    const docRef = doc(db, "diaries", diaryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('detail-title').innerText = data.title;
        const contentArea = document.getElementById('detail-content');
        contentArea.innerHTML = ''; 

        // 섹션 순회하며 이미지와 글 출력
        if (data.sections) {
            data.sections.forEach(item => {
                const sectionHtml = `
                    <div class="story-section" style="margin-bottom: 50px;">
                        <img src="${item.img}" style="width: 100%; border-radius: 5px; margin-bottom: 15px;">
                        <p style="white-space: pre-wrap; line-height: 1.6; font-size: 1.2rem;">${item.txt}</p>
                    </div>`;
                contentArea.innerHTML += sectionHtml;
            });
        }
    }
}
loadDetail();
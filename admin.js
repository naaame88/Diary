import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const container = document.getElementById('sections-container');
const addBtn = document.getElementById('add-section-btn');
let thumbnailIndex = 0;

/**
 * 이미지를 리사이징하고 압축하여 Base64 문자열로 반환하는 함수
 * @param {File} file - 업로드된 이미지 파일
 * @returns {Promise<string>} - 압축된 Base64 데이터
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 1. 최대 가로 크기 설정 (800px 정도면 모바일/웹에서 충분히 선명합니다)
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                // 2. 캔버스에 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);

                // 3. JPEG 포맷으로 압축 (0.6은 60% 화질을 의미하며, 용량이 획기적으로 줄어듭니다)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function bindEvents(section, index) {
    const fileInput = section.querySelector('.item-file');
    const previewImg = section.querySelector('.preview-area img');
    const previewDiv = section.querySelector('.preview-area');

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                previewImg.src = reader.result;
                previewImg.style.display = 'block';
            };
        }
    };

    previewDiv.onclick = () => {
        thumbnailIndex = index;
        updateHighlights();
    };
}

function updateHighlights() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach((s, i) => {
        const div = s.querySelector('.preview-area');
        const label = s.querySelector('.thumb-label');
        if (i === thumbnailIndex) {
            div.style.borderColor = "#000";
            if(label) label.style.display = "block";
        } else {
            div.style.borderColor = "#ddd";
            if(label) label.style.display = "none";
        }
    });
}

addBtn.onclick = () => {
    const index = document.querySelectorAll('.content-section').length;
    const newSection = document.createElement('div');
    newSection.className = 'content-section';
    newSection.style.cssText = "border: 1px solid #eee; padding: 20px; margin-bottom: 20px; position: relative;";
    newSection.innerHTML = `
        <div style="margin-bottom: 15px;">
            <label>Image</label>
            <input type="file" class="item-file" accept="image/*" required style="display: block; margin-top: 5px;">
            <div class="preview-area" style="margin-top: 10px; width: 100px; height: 100px; border: 2px solid #ddd; overflow: hidden; cursor: pointer;">
                <img src="" style="width: 100%; height: 100%; object-fit: cover; display: none;">
            </div>
            <small class="thumb-label" style="color: #007bff; display: none;">★ Selected as Thumbnail</small>
        </div>
        <div>
            <label>Description</label>
            <textarea class="item-text" rows="4" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd;"></textarea>
        </div>
    `;
    container.appendChild(newSection);
    bindEvents(newSection, index);
};

// 초기 설정
bindEvents(document.querySelector('.content-section'), 0);
updateHighlights();

document.getElementById('diary-form').onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const sectionElements = document.querySelectorAll('.content-section');
    const sectionsData = [];

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing...";

        for (let el of sectionElements) {
            const imgEl = el.querySelector('.preview-area img');
            const txt = el.querySelector('.item-text').value;
            
            const imgSrc = (imgEl && imgEl.style.display !== 'none') ? imgEl.src : "";
            
            sectionsData.push({ img: imgEl.src, txt: txt });
        }

        await addDoc(collection(db, "diaries"), {
            title: document.getElementById('post-title').value,
            sections: sectionsData,
            thumbnailIndex: thumbnailIndex,
            createdAt: serverTimestamp()
        });

        alert("Successfully published!");
        window.location.href = "archive.html";
    } catch (err) {
        alert(err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = "PUBLISH STORY";
    }
};
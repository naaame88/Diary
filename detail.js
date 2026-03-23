import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
} from "firebase/firestore";

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
        const musicContainer = document.getElementById('music-container');
        const musicElement = document.getElementById('detail-music');
        
        if (data.music && data.music.trim() !== "") {
            musicElement.innerText = data.music;
            musicContainer.style.display = 'block'; // 음악이 있을 때만 노출
        } else {
            musicContainer.style.display = 'none';
        }
        const contentArea = document.getElementById('detail-content');
        contentArea.innerHTML = ''; 

        // 섹션 순회하며 이미지와 글 출력
        if (data.sections) {
            data.sections.forEach(item => {
                let photosHtml = '';
                
                // 여러 장의 사진 처리 (imgs 배열)
                if (item.imgs && item.imgs.length > 0) {
                    // 그리드 레이아웃 적용
                    photosHtml = '<div class="photo-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px;">';
                    
                    item.imgs.forEach(url => {
                        if (url && url.trim() !== "") { 
                            // [추가] onclick 속성으로 클릭 시 모달 실행 + 돋보기 커서 추가
                            photosHtml += `
                                <img src="${url}" 
                                     class="zoomable-img" 
                                     onclick="openModal('${url}')" 
                                     style="width: 100%; border-radius: 2px; display: block; object-fit: cover; aspect-ratio: 1/1; cursor: zoom-in;">`;
                        }
                    });
                    photosHtml += '</div>';
                }
                // 단일 사진 처리 (기존 데이터 호환)
                else if (item.img) {
                    photosHtml = `
                        <img src="${item.img}" 
                             class="zoomable-img" 
                             onclick="openModal('${item.img}')" 
                             style="width: 100%; border-radius: 2px; display: block; margin-bottom: 20px; cursor: zoom-in;">`;
                }
            
                const sectionHtml = `
                <div class="story-section" style="margin-bottom: 60px;">
                ${photosHtml}
                <p class="story-text" style="font-size: 0.9rem; /* 폰트 크기 축소 */line-height: 2;    /* 줄 간격 넓게 */color: #333;       /* 부드러운 검정 */white-space: pre-wrap;">${item.txt}</p>
                </div>`;
                contentArea.innerHTML += sectionHtml;
            });
        }
    }
}
loadDetail();

// detail.js 맨 아래에 추가

const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

// [1] 댓글 불러오기 함수
async function loadComments() {
    if (!diaryId) return;
    
    try {
        // 이 일기(diaryId)에 해당하고, 작성시간순(asc)으로 정렬하여 가져옴
        const q = query(
            collection(db, "comments"),
            where("diaryId", "==", diaryId),
            orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(q);
        commentsList.innerHTML = '';

        if (querySnapshot.empty) {
            commentsList.innerHTML = '<p style="color: #ccc; font-size: 0.9rem;">No comments yet. Be the first to leave a mark.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const comment = doc.data();
            // 날짜 포맷팅 (예: 2026. 3. 21.)
            const date = comment.createdAt ? comment.createdAt.toDate().toLocaleDateString() : '';
            
            const commentHtml = `
                <div style="border-bottom: 1px solid #f0f0f0; padding: 20px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                        <strong style="font-size: 1rem; letter-spacing: 0.5px;">${comment.nickname}</strong>
                        <span style="font-size: 0.75rem; color: #bbb;">${date}</span>
                    </div>
                    <p style="font-size: 1rem; margin: 0; line-height: 1.6; color: #333;">${comment.content}</p>
                </div>
            `;
            commentsList.innerHTML += commentHtml;
        });
    } catch (err) {
        console.error("Error loading comments:", err);
        commentsList.innerHTML = '<p style="color: red;">Failed to load comments.</p>';
    }
}

// [2] 댓글 제출 이벤트
commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const nickname = document.getElementById('comment-nickname').value;
    const content = document.getElementById('comment-text').value;
    const submitBtn = document.getElementById('comment-submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "POSTING...";

        await addDoc(collection(db, "comments"), {
            diaryId: diaryId, // 현재 보고 있는 일기 ID와 연결
            nickname: nickname,
            content: content,
            createdAt: serverTimestamp() // 서버 시간 저장
        });
        
        commentForm.reset(); // 입력창 비우기
        await loadComments(); // 댓글 목록 새로고침
    } catch (err) {
        console.error("Error saving comment:", err);
        alert("Could not post your comment. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "POST COMMENT";
    }
};

// 페이지 로드 시 댓글 실행
loadComments();

// 모달 열기 함수
window.openModal = function(url) {
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    modalImg.src = url;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
};

// 모달 닫기 (배경이나 X 버튼 클릭 시)
document.getElementById('photo-modal').addEventListener('click', function() {
    this.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 다시 허용
});
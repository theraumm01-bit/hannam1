const supabaseUrl = 'https://tdbpbxqehxwmsdfghdll.supabase.co';
const supabaseKey = 'sb_publishable_75RrWDZyPqfhnBK966EOSw_1Sjm9EgM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 공통 유틸리티: 상단 공지사항 바 텍스트 업데이트
async function updateUtilNotice() {
  const el = document.getElementById('utilNoticeText');
  if(!el) return;
  try {
    const { data: notices, error } = await supabaseClient
      .from('notices')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (notices && notices.length > 0) {
      el.textContent = notices[0].title;
      el.parentElement.style.cursor = 'pointer';
      el.parentElement.onclick = () => { location.href = 'notice-board.html'; };
    } else {
      el.textContent = '등록된 공지사항이 없습니다.';
    }
  } catch(e) { 
    console.error(e);
    el.textContent = '공지사항을 불러올 수 없습니다.'; 
  }
}

document.addEventListener('DOMContentLoaded', () => {
    updateUtilNotice();
    updateAuthUI();
});

async function updateAuthUI() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const userStr = localStorage.getItem('user');
    let profile = null;
    if (userStr) {
        try { profile = JSON.parse(userStr); } catch(e) {}
    }

    if (session && profile) {
        // 상단 유틸 바 변경
        let adminLink = '';
        if (profile.role === 'admin') {
            adminLink = `<a href="admin-users.html" style="color:#c9a468; font-weight:bold;">[회원 관리]</a><span class="util-sep">|</span>`;
        }

        document.querySelectorAll('.util-auth').forEach(el => {
            el.innerHTML = `
                <a href="notice-board.html">공지사항</a>
                <span class="util-sep">|</span>
                <a href="inquiry-board.html">문의하기</a>
                <span class="util-sep">|</span>
                ${adminLink}
                <span style="color:var(--ivory); font-weight:600;">${profile.name}님</span>
                <span class="util-sep">|</span>
                <a href="#" class="btnLogout">로그아웃</a>
            `;
        });

        // 푸터 링크 변경
        document.querySelectorAll('.foot-links').forEach(el => {
            el.innerHTML = `
                <a href="index.html">홈</a>
                <a href="index.html#why">신속통합기획</a>
                <a href="notice-board.html">공지사항</a>
                <a href="inquiry-board.html">문의하기</a>
                <a href="#" class="btnLogout">로그아웃</a>
            `;
        });

        // 로그아웃 이벤트 등록
        document.querySelectorAll('.btnLogout').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        });
    } else {
        // 비로그인 상태일 때 잘못된 링크(/notice) 수정
        document.querySelectorAll('.util-auth a[href="/notice"]').forEach(a => a.href = 'notice-board.html');
        document.querySelectorAll('.foot-links a[href="/notice"]').forEach(a => a.href = 'notice-board.html');
    }
}
// 커스텀 알럿 모달 함수
window.showCustomAlert = function(message) {
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '9999';
    backdrop.style.backdropFilter = 'blur(4px)';
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.2s ease';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#0d0d0d';
    modal.style.border = '1px solid rgba(201, 164, 104, 0.22)';
    modal.style.borderRadius = '12px';
    modal.style.padding = '32px';
    modal.style.maxWidth = '360px';
    modal.style.width = '90%';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    modal.style.transform = 'translateY(20px)';
    modal.style.transition = 'transform 0.2s ease';

    const msgEl = document.createElement('p');
    msgEl.innerHTML = message;
    msgEl.style.color = '#f6f2ea';
    msgEl.style.fontSize = '15.5px';
    msgEl.style.lineHeight = '1.6';
    msgEl.style.marginBottom = '26px';
    msgEl.style.wordBreak = 'keep-all';

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = '확인';
    btnConfirm.style.padding = '10px 20px';
    btnConfirm.style.borderRadius = '6px';
    btnConfirm.style.fontSize = '14.5px';
    btnConfirm.style.fontWeight = '600';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.border = 'none';
    btnConfirm.style.backgroundColor = '#c9a468';
    btnConfirm.style.color = '#000000';
    btnConfirm.style.transition = 'all 0.15s ease';
    btnConfirm.onmouseover = () => {
        btnConfirm.style.backgroundColor = '#dfc08c';
        btnConfirm.style.transform = 'translateY(-1px)';
    };
    btnConfirm.onmouseout = () => {
        btnConfirm.style.backgroundColor = '#c9a468';
        btnConfirm.style.transform = 'none';
    };

    const closeModal = () => {
        backdrop.style.opacity = '0';
        modal.style.transform = 'translateY(20px)';
        setTimeout(() => backdrop.remove(), 200);
    };

    btnConfirm.onclick = closeModal;

    btnContainer.appendChild(btnConfirm);
    modal.appendChild(msgEl);
    modal.appendChild(btnContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    });
};

// 커스텀 프롬프트 모달 함수
window.showCustomPrompt = function(message, onConfirm, options = {}) {
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '9999';
    backdrop.style.backdropFilter = 'blur(4px)';
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.2s ease';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#0d0d0d';
    modal.style.border = '1px solid rgba(201, 164, 104, 0.22)';
    modal.style.borderRadius = '12px';
    modal.style.padding = '32px';
    modal.style.maxWidth = '360px';
    modal.style.width = '90%';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    modal.style.transform = 'translateY(20px)';
    modal.style.transition = 'transform 0.2s ease';

    const msgEl = document.createElement('p');
    msgEl.innerHTML = message;
    msgEl.style.color = '#f6f2ea';
    msgEl.style.fontSize = '15.5px';
    msgEl.style.lineHeight = '1.6';
    msgEl.style.marginBottom = '20px';
    msgEl.style.wordBreak = 'keep-all';

    const inputEl = document.createElement('input');
    inputEl.type = options.isPassword ? 'password' : 'text';
    inputEl.style.width = '100%';
    inputEl.style.padding = '12px 14px';
    inputEl.style.marginBottom = '26px';
    inputEl.style.borderRadius = '7px';
    inputEl.style.border = '1px solid #333';
    inputEl.style.backgroundColor = '#1a1a1a';
    inputEl.style.color = '#fff';
    inputEl.style.fontSize = '15px';
    inputEl.style.outline = 'none';

    inputEl.onfocus = () => {
        inputEl.style.borderColor = '#c9a468';
    };
    inputEl.onblur = () => {
        inputEl.style.borderColor = '#333';
    };

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '12px';
    btnContainer.style.justifyContent = 'center';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = '취소';
    btnCancel.style.padding = '10px 20px';
    btnCancel.style.borderRadius = '6px';
    btnCancel.style.fontSize = '14.5px';
    btnCancel.style.fontWeight = '600';
    btnCancel.style.cursor = 'pointer';
    btnCancel.style.border = '1px solid #262626';
    btnCancel.style.backgroundColor = 'transparent';
    btnCancel.style.color = '#f6f2ea';
    btnCancel.style.transition = 'all 0.15s ease';
    btnCancel.onmouseover = () => {
        btnCancel.style.borderColor = '#c9a468';
        btnCancel.style.color = '#dfc08c';
    };
    btnCancel.onmouseout = () => {
        btnCancel.style.borderColor = '#262626';
        btnCancel.style.color = '#f6f2ea';
    };

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = '확인';
    btnConfirm.style.padding = '10px 20px';
    btnConfirm.style.borderRadius = '6px';
    btnConfirm.style.fontSize = '14.5px';
    btnConfirm.style.fontWeight = '600';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.border = 'none';
    btnConfirm.style.backgroundColor = '#c9a468';
    btnConfirm.style.color = '#000000';
    btnConfirm.style.transition = 'all 0.15s ease';
    btnConfirm.onmouseover = () => {
        btnConfirm.style.backgroundColor = '#dfc08c';
        btnConfirm.style.transform = 'translateY(-1px)';
    };
    btnConfirm.onmouseout = () => {
        btnConfirm.style.backgroundColor = '#c9a468';
        btnConfirm.style.transform = 'none';
    };

    const closeModal = () => {
        backdrop.style.opacity = '0';
        modal.style.transform = 'translateY(20px)';
        setTimeout(() => backdrop.remove(), 200);
    };

    btnCancel.onclick = closeModal;
    btnConfirm.onclick = () => {
        const val = inputEl.value;
        closeModal();
        if (onConfirm) onConfirm(val);
    };

    inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') {
            btnConfirm.click();
        }
    };

    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnConfirm);
    modal.appendChild(msgEl);
    modal.appendChild(inputEl);
    modal.appendChild(btnContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
        inputEl.focus();
    });
};

// 커스텀 알럿/컨펌 모달 함수
window.showCustomConfirm = function(message, onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '9999';
    backdrop.style.backdropFilter = 'blur(4px)';
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.2s ease';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#0d0d0d';
    modal.style.border = '1px solid rgba(201, 164, 104, 0.22)';
    modal.style.borderRadius = '12px';
    modal.style.padding = '32px';
    modal.style.maxWidth = '360px';
    modal.style.width = '90%';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    modal.style.transform = 'translateY(20px)';
    modal.style.transition = 'transform 0.2s ease';

    const msgEl = document.createElement('p');
    msgEl.innerHTML = message;
    msgEl.style.color = '#f6f2ea';
    msgEl.style.fontSize = '15.5px';
    msgEl.style.lineHeight = '1.6';
    msgEl.style.marginBottom = '26px';
    msgEl.style.wordBreak = 'keep-all';

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '12px';
    btnContainer.style.justifyContent = 'center';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = '취소';
    btnCancel.style.padding = '10px 20px';
    btnCancel.style.borderRadius = '6px';
    btnCancel.style.fontSize = '14.5px';
    btnCancel.style.fontWeight = '600';
    btnCancel.style.cursor = 'pointer';
    btnCancel.style.border = '1px solid #262626';
    btnCancel.style.backgroundColor = 'transparent';
    btnCancel.style.color = '#f6f2ea';
    btnCancel.style.transition = 'all 0.15s ease';
    btnCancel.onmouseover = () => {
        btnCancel.style.borderColor = '#c9a468';
        btnCancel.style.color = '#dfc08c';
    };
    btnCancel.onmouseout = () => {
        btnCancel.style.borderColor = '#262626';
        btnCancel.style.color = '#f6f2ea';
    };

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = '확인';
    btnConfirm.style.padding = '10px 20px';
    btnConfirm.style.borderRadius = '6px';
    btnConfirm.style.fontSize = '14.5px';
    btnConfirm.style.fontWeight = '600';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.border = 'none';
    btnConfirm.style.backgroundColor = '#c9a468';
    btnConfirm.style.color = '#000000';
    btnConfirm.style.transition = 'all 0.15s ease';
    btnConfirm.onmouseover = () => {
        btnConfirm.style.backgroundColor = '#dfc08c';
        btnConfirm.style.transform = 'translateY(-1px)';
    };
    btnConfirm.onmouseout = () => {
        btnConfirm.style.backgroundColor = '#c9a468';
        btnConfirm.style.transform = 'none';
    };

    const closeModal = () => {
        backdrop.style.opacity = '0';
        modal.style.transform = 'translateY(20px)';
        setTimeout(() => backdrop.remove(), 200);
    };

    btnCancel.onclick = closeModal;
    btnConfirm.onclick = () => {
        closeModal();
        if (onConfirm) onConfirm();
    };

    btnContainer.appendChild(btnConfirm);
    btnContainer.appendChild(btnCancel);
    modal.appendChild(msgEl);
    modal.appendChild(btnContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // trigger animation
    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    });
};

// 모든 페이지에서 문의하기 링크 클릭 시 로그인 체크
document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === 'inquiry-board.html') {
        const userStr = localStorage.getItem('user');
        if(!userStr) {
            e.preventDefault();
            window.showCustomConfirm('로그인이 필요한 서비스입니다.<br>로그인 화면으로 이동하시겠습니까?', () => {
                window.location.href = 'auth.html';
            });
        }
    }
});

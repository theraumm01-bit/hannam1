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
        document.querySelectorAll('.util-auth').forEach(el => {
            el.innerHTML = `
                <a href="notice-board.html">공지사항</a>
                <span class="util-sep">|</span>
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
                location.reload();
            });
        });
    } else {
        // 비로그인 상태일 때 잘못된 링크(/notice) 수정
        document.querySelectorAll('.util-auth a[href="/notice"]').forEach(a => a.href = 'notice-board.html');
        document.querySelectorAll('.foot-links a[href="/notice"]').forEach(a => a.href = 'notice-board.html');
    }
}

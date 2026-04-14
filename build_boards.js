const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const contentDir = path.join(rootDir, 'content', 'boards');
const dataDir = path.join(rootDir, 'board_data');
const postsDir = path.join(rootDir, 'board_posts');

const boards = {
    'online-lectures': {
        title: '온라인강의',
        description: '비대면 강의, 수업 일정, 수강 안내 게시판',
        page: 'board_online_lectures.html'
    },
    'student-portal': {
        title: '학생포털',
        description: '학생 서비스, 증명서 발급, 공지 안내 게시판',
        page: 'board_student_portal.html'
    },
    'research-forum': {
        title: '연구자 포럼',
        description: '연구 자료, 포럼 일정, 논문 안내 게시판',
        page: 'board_research_forum.html'
    },
    'admissions-faq': {
        title: '입학FAQ',
        description: '입학 관련 자주 묻는 질문을 모아둔 게시판',
        page: 'admissions_faq.html'
    },
    'academic-forms': {
        title: '각종 서식',
        description: '학사 관련 신청서와 행정 서식을 내려받을 수 있는 게시판',
        page: 'academic_forms.html'
    },
    'school-events': {
        title: '학교행사',
        description: '학교의 주요 집회, 행사, 특별 프로그램 소식을 안내하는 게시판',
        page: 'school_events.html'
    }
};

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function slugToTitle(slug) {
    return slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseFrontmatter(raw) {
    if (!raw.startsWith('---')) {
        return { meta: {}, body: raw.trim() };
    }

    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) {
        return { meta: {}, body: raw.trim() };
    }

    const meta = {};
    for (const line of match[1].split(/\r?\n/)) {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) {
            continue;
        }
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        meta[key] = value;
    }

    return { meta, body: match[2].trim() };
}

function inlineMarkdown(text) {
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    const html = [];
    let listType = null;

    function closeList() {
        if (listType) {
            html.push(`</${listType}>`);
            listType = null;
        }
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            closeList();
            continue;
        }

        if (line.startsWith('### ')) {
            closeList();
            html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
            continue;
        }

        if (line.startsWith('## ')) {
            closeList();
            html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
            continue;
        }

        if (line.startsWith('# ')) {
            closeList();
            html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            if (listType !== 'ul') {
                closeList();
                listType = 'ul';
                html.push('<ul>');
            }
            html.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            if (listType !== 'ol') {
                closeList();
                listType = 'ol';
                html.push('<ol>');
            }
            html.push(`<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
            continue;
        }

        closeList();
        html.push(`<p>${inlineMarkdown(line)}</p>`);
    }

    closeList();
    return html.join('\n');
}

function stripMarkdown(markdown) {
    return markdown
        .replace(/^---[\s\S]*?---\s*/m, '')
        .replace(/[#>*`\-\[\]\(\)]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildLayout(title, content, extraScript = '') {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | 총회신학연구원</title>
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable.css">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="icon" type="image/png" href="../../assets/images/site-logo.png">
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
    <header class="top-nav">
        <div class="container top-nav-inner flex-between">
            <a class="logo-area" href="../../index.html">
                <img src="../../assets/images/site-logo.png" alt="학교 로고" class="main-logo-image">
                <div class="logo-text">
                    <h1>총회신학학술연구원</h1>
                    <span>대한예수교장로회(한영)총회신학학술연구원</span>
                </div>
            </a>
            <div class="top-links-area">
                <nav class="top-links">
                    <a href="../../index.html">Home</a>
                    <a href="../../sitemap.html">사이트맵</a>
                    <span class="lang-selector">ENG</span>
                </nav>
                <div class="search-wrap">
                    <input type="text" placeholder="검색어를 입력하세요">
                    <button type="button" aria-label="검색">
                        <i class="ph-light ph-magnifying-glass"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>
    <nav class="main-category-nav">
        <div class="container nav-icons-wrap">
            <details class="nav-item nav-dropdown">
                <summary class="nav-icon-link nav-dropdown-toggle">
                    <div class="icon-box"><i class="ph-light ph-bank"></i></div>
                    <span>학교소개</span>
                </summary>
                <div class="nav-dropdown-menu">
                    <a href="../../intro_greeting.html">학장 인사말</a>
                    <a href="../../intro_ideology.html">교육이념</a>
                    <a href="../../intro_history.html">연혁</a>
                    <a href="../../intro_org.html">조직도</a>
                    <a href="../../intro_faculty.html">교수 소개</a>
                </div>
            </details>
            <a href="../../admissions_guideline.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-graduation-cap"></i></div><span>입학안내</span></a>
            <a href="../../degree_bachelor.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-student"></i></div><span>학위과정</span></a>
            <a href="../../academic_info.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-calendar-blank"></i></div><span>학사안내</span></a>
            <a href="../../campus_life.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-users"></i></div><span>대학생활</span></a>
            <a href="../../research_intro.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-microscope"></i></div><span>학술연구</span></a>
            <a href="../../online_service.html" class="nav-icon-link"><div class="icon-box"><i class="ph-light ph-desktop"></i></div><span>온라인서비스</span></a>
        </div>
    </nav>
    <main class="fade-in">
        <div class="page-header">
            <h2>${title}</h2>
        </div>
        <div class="container page-content-area shadow-sm">
            ${content}
        </div>
    </main>
    <footer class="modern-footer">
        <div class="container">
            <div class="footer-grid">
                <div class="f-col">
                    <h6>OUR CAMPUS</h6>
                    <h3 class="f-brand">총회신학학술연구원</h3>
                    <p>대한예수교장로회(한영)<br>총회신학학술연구원</p>
                    <p><strong>Phone:</strong> (031) 677-8428</p>
                    <p><strong>Email:</strong> admin@hyts.ac.kr</p>
                </div>
                <div class="f-col f-links">
                    <h6>QUICK LINKS</h6>
                    <ul>
                        <li><a href="../../intro_greeting.html">학교소개 <i class="ph-light ph-arrow-right"></i></a></li>
                        <li><a href="../../admissions_guideline.html">입학안내 <i class="ph-light ph-arrow-right"></i></a></li>
                        <li><a href="../../degree_bachelor.html">학위과정 <i class="ph-light ph-arrow-right"></i></a></li>
                        <li><a href="../../online_service.html">온라인서비스 <i class="ph-light ph-arrow-right"></i></a></li>
                        <li><a href="../../campus_life.html">대학생활 <i class="ph-light ph-arrow-right"></i></a></li>
                    </ul>
                </div>
                <div class="f-col f-connect">
                    <h6>CONNECT</h6>
                    <p>개혁주의 신학의 토대 위에 교회와 세계를 섬기는 목회자와 지도자를 세우는 신학 공동체입니다.</p>
                    <a href="../../admissions_guideline.html" class="btn-primary">입학 안내 확인하기</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 대한예수교장로회(한영)총회신학학술연구원. All rights reserved.</p>
            </div>
        </div>
    </footer>
    ${extraScript}
</body>
</html>`;
}

ensureDir(dataDir);
ensureDir(postsDir);

for (const [boardId, boardConfig] of Object.entries(boards)) {
    const boardDir = path.join(contentDir, boardId);
    ensureDir(boardDir);

    const markdownFiles = fs.existsSync(boardDir)
        ? fs.readdirSync(boardDir).filter((file) => file.endsWith('.md'))
        : [];

    const posts = markdownFiles.map((fileName) => {
        const slug = path.basename(fileName, '.md');
        const raw = fs.readFileSync(path.join(boardDir, fileName), 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        const title = meta.title || slugToTitle(slug);
        const date = meta.date || '2026-04-02';
        const summary = meta.summary || stripMarkdown(body).slice(0, 120);
        const bodyHtml = markdownToHtml(body);

        const postOutputDir = path.join(postsDir, boardId);
        ensureDir(postOutputDir);

        const articleHtml = `
            <a href="../../${boardConfig.page}" class="board-back-link"><i class="ph-light ph-arrow-left"></i> ${boardConfig.title} 게시판으로 돌아가기</a>
            <article class="board-article">
                <div class="board-article-meta">${date}</div>
                <h3>${title}</h3>
                <div class="board-article-content">
                    ${bodyHtml}
                </div>
            </article>
        `;

        fs.writeFileSync(
            path.join(postOutputDir, `${slug}.html`),
            buildLayout(title, articleHtml),
            'utf8'
        );

        return {
            title,
            date,
            summary,
            slug,
            url: `board_posts/${boardId}/${slug}.html`
        };
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const boardJson = {
        id: boardId,
        title: boardConfig.title,
        description: boardConfig.description,
        page: boardConfig.page,
        posts
    };

    fs.writeFileSync(
        path.join(dataDir, `${boardId}.json`),
        JSON.stringify(boardJson, null, 2),
        'utf8'
    );
}

(() => {
    async function loadBoard(boardId) {
        const response = await fetch(`board_data/${boardId}.json`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load board: ${boardId}`);
        }
        return response.json();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderRows(posts) {
        return posts.map((post, index) => `
            <tr>
                <td class="board-col-num">${posts.length - index}</td>
                <td><a href="${post.url}">${escapeHtml(post.title)}</a></td>
                <td class="board-col-date">${escapeHtml(post.date)}</td>
            </tr>
        `).join('');
    }

    function renderTable(posts, emptyText) {
        if (!posts.length) {
            return `<div class="board-empty">${escapeHtml(emptyText)}</div>`;
        }

        return `
            <div class="board-table-wrap">
                <table class="board-table-clean">
                    <thead>
                        <tr>
                            <th class="board-col-num">번호</th>
                            <th>제목</th>
                            <th class="board-col-date">등록일</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderRows(posts)}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.querySelectorAll('[data-board-preview]').forEach(async (element) => {
        const boardId = element.dataset.boardPreview;
        const limit = Number(element.dataset.limit || '5');

        try {
            const board = await loadBoard(boardId);
            const posts = board.posts.slice(0, limit);
            element.innerHTML = `
                <div class="board-panel">
                    <div class="board-panel-header">
                        <div>
                            <h3>${escapeHtml(board.title)}</h3>
                            <p>${escapeHtml(board.description || '')}</p>
                        </div>
                        <a class="board-panel-link" href="${escapeHtml(board.page)}">게시판 바로가기</a>
                    </div>
                    ${renderTable(posts, '등록된 게시글이 없습니다.')}
                </div>
            `;
        } catch (error) {
            element.innerHTML = `<div class="board-empty">게시판을 불러오지 못했습니다.</div>`;
        }
    });

    document.querySelectorAll('[data-board-listing]').forEach(async (element) => {
        const boardId = element.dataset.boardListing;
        const emptyText = element.dataset.empty || '등록된 게시글이 없습니다.';

        try {
            const board = await loadBoard(boardId);
            element.innerHTML = `
                <div class="board-page-intro">
                    <h3>${escapeHtml(board.title)}</h3>
                    <p>${escapeHtml(board.description || '')}</p>
                </div>
                ${renderTable(board.posts, emptyText)}
            `;
        } catch (error) {
            element.innerHTML = `<div class="board-empty">게시판을 불러오지 못했습니다.</div>`;
        }
    });
})();

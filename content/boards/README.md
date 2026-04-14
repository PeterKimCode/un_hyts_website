# 게시판 추가 방법

각 게시판 폴더에 `.md` 파일을 추가한 뒤 아래 명령을 실행하면 게시글 목록과 상세 페이지가 자동으로 생성됩니다.

```bash
node build_boards.js
```

게시판 폴더 목록:

- `content/boards/online-lectures`
- `content/boards/student-portal`
- `content/boards/research-forum`
- `content/boards/admissions-faq`
- `content/boards/academic-forms`
- `content/boards/school-events`

권장 마크다운 형식:

```md
---
title: 게시글 제목
date: 2026-04-02
summary: 목록에 보일 짧은 설명
---
# 본문 제목

본문 내용을 작성합니다.
```

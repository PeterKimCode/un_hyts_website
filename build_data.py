import json
import os

with open("sample.txt", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")

def get_content(start_idx, end_idx):
    if start_idx >= len(lines): return ""
    return "\n".join(lines[start_idx:min(end_idx, len(lines))]).strip()

html_sections = {
    "intro_greeting": {"title": "총장 인사말", "text": get_content(95, 103)},
    "intro_ideology": {"title": "교육이념 및 연혁", "text": get_content(108, 133)},
    "intro_org": {"title": "조직도", "text": get_content(134, 176)},
    "admissions_guideline": {"title": "모집요강 및 전형일정", "text": get_content(177, 213)},
    "admissions_req": {"title": "지원자격 및 제출서류", "text": get_content(214, 238)},
    "admissions_tuition": {"title": "등록금 및 장학제도", "text": get_content(239, 254)},
    "degree_bachelor": {"title": "학사 과정", "text": get_content(255, 410)},
    "degree_master": {"title": "석사 과정", "text": get_content(411, 530)},
    "degree_doctor": {"title": "박사 과정", "text": get_content(531, 615)},
    "degree_research": {"title": "연구원 과정", "text": get_content(616, 709)},
    "research_intro": {"title": "학술연구 - 기관소개", "text": get_content(710, 736)}
}

# Insert Dean photo and Signature
html_sections["intro_greeting"]["text"] = '<img src="assets/images/dean.png" class="dean-photo" alt="학장 사진">\n' + html_sections["intro_greeting"]["text"]
html_sections["intro_greeting"]["text"] = html_sections["intro_greeting"]["text"].replace(우상용 드림)

# Feature card grid template for empty sections
feature_template = """
<div class="feature-card-grid">
    <div class="fc-box">
        <div class="fc-icon"><i class="ph-light {i1}"></i></div>
        <h4>{t1}</h4>
        <p>{d1}</p>
    </div>
    <div class="fc-box">
        <div class="fc-icon"><i class="ph-light {i2}"></i></div>
        <h4>{t2}</h4>
        <p>{d2}</p>
    </div>
    <div class="fc-box">
        <div class="fc-icon"><i class="ph-light {i3}"></i></div>
        <h4>{t3}</h4>
        <p>{d3}</p>
    </div>
    <div class="fc-box">
        <div class="fc-icon"><i class="ph-light {i4}"></i></div>
        <h4>{t4}</h4>
        <p>{d4}</p>
    </div>
</div>
"""
html_sections["academic_info"] = {"title": "학사안내", "html": feature_template.format(i1="ph-calendar-blank", t1="학사일정", d1="연간 학사일정 및 학기 구분 안내", i2="ph-books", t2="수강신청", d2="수강신청 안내 및 유의사항 규정", i3="ph-scroll", t3="학칙 및 규정", d3="총회신학학술연구원 제규정 열람", i4="ph-file-text", t4="각종 서식", d4="재학 중 필요한 서식 자료 다운로드")}
html_sections["campus_life"] = {"title": "대학생활", "html": feature_template.format(i1="ph-users-three", t1="총학생회", d1="HYTS&GTCC총학생회및동문회", i2="ph-basketball", t2="동아리", d2="사역과 친교를 위한 동아리 소개", i3="ph-hands-praying", t3="학생상담", d3="신앙 상담 및 진로 상담 신청", i4="ph-ticket", t4="학교행사", d4="체육대회 및 수련회, 영성집회")}
html_sections["online_service"] = {"title": "온라인서비스", "html": feature_template.format(i1="ph-laptop", t1="온라인 강의", d1="비대면 온라인 스트리밍 강의실", i2="ph-student", t2="학생포털", d2="성적 조회 및 증명서 발급 신청", i3="ph-flask", t3="연구자 포털", d3="논문 제출 및 연구 자료 검색", i4="ph-headset", t4="IT 센터", d4="원격 지원 서비스 시스템")}

# Add standard HTML formatting to text
for k, v in html_sections.items():
    if 'text' not in v:
        # Pre-populated html formatting
        continue
    
    formatted_text = ""
    for line in v['text'].split("\n"):
        line = line.strip()
        if not line:
            formatted_text += "<br/>"
        elif line.startswith("•") or line.startswith("▪") or line.startswith("🔹"):
            formatted_text += f"<li>{line}</li>"
        elif line.endswith("학점") or line.endswith("과정") or "과목 구성" in line:
            formatted_text += f"<h4 class='sub-heading'>{line}</h4>"
        else:
            if line.startswith("<img"):
                formatted_text += line
            else:
                formatted_text += f"<p>{line}</p>"
    
    html_sections[k]['html'] = f"<div class='content-body'>{formatted_text}</div>"

js_content = "const siteData = " + json.dumps(html_sections, indent=2, ensure_ascii=False) + ";\n"

os.makedirs("js", exist_ok=True)
with open("js/data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

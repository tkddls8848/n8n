# ZDNet IT인프라 뉴스 수집 워크플로우 설정 가이드

이 워크플로우는 ZDNet Korea에서 IT인프라 관련 뉴스를 자동으로 수집하여 이메일로 전송합니다.

## 1. n8n 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:5678
```

기본 로그인 정보:
- 사용자명: `admin`
- 비밀번호: `admin`

## 2. 워크플로우 임포트

### 방법 1: 파일에서 임포트
1. n8n 상단 메뉴에서 **Workflows** 클릭
2. 우측 상단 **Import from File** 버튼 클릭
3. `workflows/zdnet-it-news-workflow.json` 파일 선택
4. **Import** 클릭

### 방법 2: JSON 직접 붙여넣기
1. n8n에서 새 워크플로우 생성
2. 우측 상단 메뉴 (⋮) → **Import from URL / JSON** 선택
3. `zdnet-it-news-workflow.json` 파일 내용 복사하여 붙여넣기

## 3. SMTP 이메일 설정 (필수)

### Gmail 사용 시

1. **Gmail 앱 비밀번호 생성**
   - Google 계정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성: https://myaccount.google.com/apppasswords
   - "메일" 앱 선택 후 비밀번호 생성

2. **n8n SMTP 자격증명 추가**
   - 워크플로우의 "이메일 발송" 노드 클릭
   - **Credentials** → **Create New** 클릭
   - 다음 정보 입력:
     ```
     Host: smtp.gmail.com
     Port: 587
     SSL/TLS: Use STARTTLS
     User: your-email@gmail.com
     Password: [생성한 앱 비밀번호]
     ```
   - **Save** 클릭

### Outlook/Hotmail 사용 시
```
Host: smtp-mail.outlook.com
Port: 587
SSL/TLS: Use STARTTLS
User: your-email@outlook.com
Password: [계정 비밀번호]
```

### 기타 메일 서비스
- 각 메일 서비스의 SMTP 설정 정보를 확인하세요
- Naver, Daum 등도 SMTP를 지원합니다

## 4. 이메일 주소 설정

"이메일 발송" 노드에서:
- **To Email**: 수신할 이메일 주소 입력 (예: `myemail@example.com`)
- **From Email**: 발신 이메일 주소 (SMTP 계정과 동일)

## 5. ZDNet 크롤링 로직 커스터마이징

현재 워크플로우는 **템플릿**입니다. ZDNet 웹사이트의 실제 구조에 맞게 수정이 필요합니다.

### 5.1 IT인프라 카테고리 URL 확인

1. 브라우저에서 https://zdnet.co.kr/ 접속
2. IT인프라 관련 카테고리 찾기 (예: 클라우드, 서버, 네트워크 등)
3. 카테고리 페이지 URL 복사

### 5.2 "IT인프라 카테고리 페이지" 노드 수정

워크플로우에서 해당 노드 클릭 후:
```javascript
// URL을 실제 IT인프라 카테고리 URL로 변경
https://zdnet.co.kr/news/news_list.asp?lo_menu=30300  // 예시
```

### 5.3 HTML 파싱 로직 수정

**"기사 URL 추출" 노드**에서 실제 ZDNet HTML 구조에 맞게 수정:

```javascript
// 실제 ZDNet 페이지를 브라우저에서 열고
// F12 (개발자 도구) → Elements 탭에서 기사 링크 구조 확인

// 예시: 기사 링크가 <a href="/view/?no=12345"> 형태일 경우
const html = $input.item.json.data;
const baseUrl = 'https://zdnet.co.kr';

// 정규식 또는 DOM 파싱으로 링크 추출
const linkPattern = /href="(\/view\/\?no=\d+)"/g;
const matches = [...html.matchAll(linkPattern)];

const urls = matches.map(match => baseUrl + match[1]);
const uniqueUrls = [...new Set(urls)];

return uniqueUrls.map(url => ({
  json: { url: url }
}));
```

**"기사 정보 추출 및 필터링" 노드**에서 기사 상세 정보 추출:

```javascript
const html = $input.item.json.data;

// 실제 ZDNet HTML 구조에 맞게 선택자 수정
// 브라우저 개발자 도구에서 제목, 날짜 요소 확인

// 제목 추출 예시
const titleMatch = html.match(/<h1[^>]*class="article_title"[^>]*>([^<]+)<\/h1>/);
const title = titleMatch ? titleMatch[1].trim() : '';

// 날짜 추출 예시
const dateMatch = html.match(/<span[^>]*class="date"[^>]*>([^<]+)<\/span>/);
const dateStr = dateMatch ? dateMatch[1].trim() : '';

// ... 나머지 로직
```

## 6. 테스트 실행

### 수동 테스트
1. 워크플로우 상단의 **Execute Workflow** 버튼 클릭
2. 각 노드의 출력 데이터 확인
3. 오류가 있는 노드에서 데이터 구조 확인 후 수정

### 특정 노드만 테스트
1. 테스트할 노드 선택
2. **Execute Node** 클릭

### 디버깅 팁
- 각 노드 클릭 후 **Output** 탭에서 실제 데이터 확인
- HTML 응답이 예상과 다르면 브라우저에서 직접 확인
- Console 탭에서 에러 메시지 확인

## 7. 스케줄 설정

"매일 오전 9시 실행" 노드에서 실행 시간 변경 가능:

```
0 9 * * *   # 매일 오전 9시
0 18 * * *  # 매일 오후 6시
0 9,18 * * * # 매일 오전 9시, 오후 6시
```

Cron 표현식 생성 도구: https://crontab.guru/

## 8. 워크플로우 활성화

1. 워크플로우 상단의 **Inactive** 토글 클릭
2. **Active**로 변경
3. 설정한 시간에 자동으로 실행됩니다

## 9. 고급 설정 (선택사항)

### IT인프라 키워드 필터링

특정 키워드가 포함된 기사만 수집하려면 "기사 정보 추출 및 필터링" 노드에 추가:

```javascript
// IT인프라 관련 키워드
const keywords = ['클라우드', '서버', '네트워크', '데이터센터', '가상화', 'VM', 'SaaS', 'IaaS'];

// 제목이나 요약에 키워드 포함 여부 확인
const hasKeyword = keywords.some(keyword =>
  title.includes(keyword) || summary.includes(keyword)
);

if (!hasKeyword) {
  return []; // 키워드가 없으면 제외
}
```

### 중복 방지

이미 보낸 기사를 다시 보내지 않으려면:
1. n8n의 **Set** 노드로 기사 URL을 저장
2. 다음 실행 시 저장된 URL과 비교하여 제외

## 10. 문제 해결

### 이메일이 발송되지 않음
- SMTP 자격증명 확인
- Gmail의 경우 "보안 수준이 낮은 앱" 허용 또는 앱 비밀번호 사용
- 스팸 폴더 확인

### 기사가 수집되지 않음
- ZDNet 웹사이트 구조 변경 가능성
- 브라우저 개발자 도구로 실제 HTML 구조 확인
- HTTP Request 노드의 응답 데이터 확인

### 잘못된 기사가 수집됨
- HTML 파싱 정규식 또는 선택자 재확인
- 키워드 필터링 추가

### 날짜 필터링이 작동하지 않음
- ZDNet의 날짜 형식 확인
- Date 파싱 로직 수정

## 참고 자료

- [n8n 공식 문서](https://docs.n8n.io/)
- [n8n HTTP Request 노드](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n Code 노드](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [Cron 표현식 생성기](https://crontab.guru/)

# n8n 기본 환경

Docker Compose를 사용한 n8n 워크플로우 자동화 플랫폼

## 구성 요소

- **n8n**: 워크플로우 자동화 플랫폼
- **PostgreSQL**: 데이터베이스 (워크플로우 및 실행 이력 저장)

## 사전 요구사항

- Docker
- Docker Compose

## 설치 및 실행

### 1. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요한 경우 값을 수정하세요:

```bash
# 기본 인증 정보 변경 (권장)
N8N_BASIC_AUTH_USER=your_username
N8N_BASIC_AUTH_PASSWORD=your_password

# 데이터베이스 비밀번호 변경 (권장)
POSTGRES_PASSWORD=your_secure_password
```

### 2. n8n 시작

```bash
docker-compose up -d
```

### 3. n8n 접속

브라우저에서 다음 주소로 접속:

```
http://localhost:5678
```

기본 로그인 정보:
- 사용자명: `admin`
- 비밀번호: `admin`

**보안을 위해 `.env` 파일에서 기본 인증 정보를 변경하세요!**

## 주요 명령어

### n8n 중지
```bash
docker-compose down
```

### n8n 재시작
```bash
docker-compose restart
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# n8n 로그만
docker-compose logs -f n8n

# PostgreSQL 로그만
docker-compose logs -f postgres
```

### 데이터 완전 삭제 (볼륨 포함)
```bash
docker-compose down -v
```

## 데이터 저장

다음 Docker 볼륨에 데이터가 영구 저장됩니다:
- `n8n-data`: n8n 워크플로우 및 설정
- `postgres-data`: PostgreSQL 데이터베이스

## 환경 변수

주요 환경 변수는 `.env` 파일에서 관리됩니다:

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `N8N_PORT` | n8n 웹 인터페이스 포트 | `5678` |
| `N8N_BASIC_AUTH_USER` | 기본 인증 사용자명 | `admin` |
| `N8N_BASIC_AUTH_PASSWORD` | 기본 인증 비밀번호 | `admin` |
| `POSTGRES_USER` | PostgreSQL 사용자 | `n8n` |
| `POSTGRES_PASSWORD` | PostgreSQL 비밀번호 | `n8n_password` |
| `GENERIC_TIMEZONE` | 시간대 | `Asia/Seoul` |

## 문제 해결

### 포트 충돌
5678 포트가 이미 사용 중인 경우, `.env` 파일에서 `N8N_PORT`를 변경하세요.

### 데이터베이스 연결 오류
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres
```

### 컨테이너 재시작
```bash
docker-compose restart
```

## 보안 권장사항

1. `.env` 파일의 기본 비밀번호를 모두 변경하세요
2. 프로덕션 환경에서는 SSL/TLS 설정을 추가하세요
3. 방화벽을 통해 필요한 포트만 열어두세요
4. 정기적으로 백업을 수행하세요

## 백업

### 데이터 백업
```bash
# PostgreSQL 백업
docker-compose exec postgres pg_dump -U n8n n8n > backup.sql

# n8n 데이터 볼륨 백업
docker run --rm -v n8n-data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .
```

### 데이터 복원
```bash
# PostgreSQL 복원
docker-compose exec -T postgres psql -U n8n n8n < backup.sql
```

## 참고 자료

- [n8n 공식 문서](https://docs.n8n.io/)
- [n8n GitHub](https://github.com/n8n-io/n8n)
- [Docker Compose 문서](https://docs.docker.com/compose/)

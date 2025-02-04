### 개발환경

1. 프로젝트 환경설정(vite를 활용한 React 설치) : `npm install vite@latest` <br />

2. React 중앙집중식 상태관리 라이브러리 Recoil 설치: `npm install recoil` <br />

3. 외부 오픈 API 통신을 위한 라이브러리 Axios 설치: `npm install axios` <br />

4. CSS 스타일링을 위한 SASS/SCSS 설치: `npm install -D sass` <br />

5. React Router 설치: `npm install react-router-dom localforage match-sorter sort-by` <br />

6. TypeScript에서 Node.js 모듈을 쓸 수 있는 환경 구축: `npm i @types/node` <br />

7. React Toast Popup 모듈 설치: `npm install react-simple-toasts` <br />

## Backend (FastAPI)

### 프로젝트 구조
mermaid
graph TD
A[FastApi_SeniorJobGo/] --> B[app/]
A --> C[documents/]
A --> D[jobs_collection/]
A --> E[requirements.txt]
A --> F[.env]
A --> G[README.md]
B --> B1[init.py]
B --> B2[main.py]
B --> H[routes/]
H --> H1[init.py]
H --> H2[chat_router.py]
B --> I[services/]
I --> I1[init.py]
I --> I2[vector_store.py]
I --> I3[conversation.py]
B --> J[agents/]
J --> J1[init.py]
J --> J2[job_advisor.py]
B --> K[models/]
K --> K1[init.py]
K --> K2[schemas.py]
B --> L[core/]
L --> L1[init.py]
L --> L2[config.py]
L --> L3[prompts.py]
B --> M[utils/]
M --> M1[init.py]
M --> M2[constants.py]
C --> C1[jobs.json]
style A fill:#f9f9f9,stroke:#333,stroke-width:2px
style B,H,I,J,K,L,M fill:#e1f5fe,stroke:#333,stroke-width:2px
style C,D fill:#fff3e0,stroke:#333,stroke-width:2px
style E,F,G fill:#f5f5f5,stroke:#333,stroke-width:2px
style B1,B2,H1,H2,I1,I2,I3,J1,J2,K1,K2,L1,L2,L3,M1,M2,C1 fill:#ffffff,stroke:#333,stroke-width:1px

### 디렉토리 설명

- `app/`: 메인 애플리케이션 코드
  - `routes/`: API 엔드포인트 정의
  - `services/`: 비즈니스 로직 구현
  - `agents/`: LangGraph 에이전트 구현
  - `models/`: Pydantic 모델 정의
  - `core/`: 핵심 설정 및 프롬프트
  - `utils/`: 유틸리티 함수 및 상수

- `documents/`: 데이터 파일 저장소
- `jobs_collection/`: 벡터 데이터베이스 저장소

### 백엔드 설치 및 실행

1. 환경 설정
bash
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt

2. 환경 변수 설정
bash
cp .env.example .env

3. 서버 실행
bash
uvicorn app.main:app --reload

### API 문서

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
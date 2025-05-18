# SeniorJobGo 시니어잡고
![시니어잡고 이미지](./images/Senior_JobGo.png)
## 📋 개요
SeniorJobGo는 FastAPI와 React로 구축된 시니어 취업 플랫폼으로, 고령자들에게 적합한 일자리 정보와 관련 서비스를 제공합니다.  
직업 훈련 프로그램, 정부지원사업 소식, 지역별 무료 급식소 정보 등 고령자들에게 필요한 종합적인 정보를 제공합니다.  

<br/>

## 🌟 주요 기능
- **고령자 적합 일자리 검색**: 다양한 취업 사이트에서 고령자가 지원 가능한 채용공고만을 제공합니다.
- **직업훈련 정보 제공**: 시니어의 역량 강화와 재취업을 위한 직업훈련 및 교육 프로그램 정보를 제공합니다.
- **정부지원사업 정보**: 고령자 대상 정부지원사업에 대한 최신 뉴스와 정보를 확인할 수 있습니다.
- **지역별 무료 급식소 찾기**: 사용자가 선택한 지역 정보를 바탕으로, 맞춤형 급식소 정보를 제공합니다.
<br/>

## 📅 프로젝트 진행 기간
- 2025.01.08 ~ 2025.02.21
<br/>

## Frontend(React)
```plaintext
SeniorJobGo-React/
├── public/              # 정적 파일 (이미지, 폰트 등)
├── src/
│   ├── assets/          # 이미지, 폰트 등의 에셋
│   ├── components/      # 헤더, 푸터 등 공통 컴포넌트
│   ├── pages/           # 각 기능별 페이지
│   │   ├── auth/        # 로그인, 로그아웃, 회원가입
│   │   ├── chat/        # 채팅 기능 관련 페이지
│   │   │   ├── components/ # 채팅 내 사용되는 컴포넌트들
│   │   │   │   ├── InputComponent/   # 입력 컴포넌트
│   │   │   │   ├── MessageComponent/ # 메시지 컴포넌트
│   │   │   │   ├── JobCard/          # 일자리 카드 컴포넌트
│   │   │   │   ├── MealCard/         # 급식소 카드 컴포넌트
│   │   │   │   ├── PolicyCard/       # 정책 카드 컴포넌트
│   │   │   │   └── TrainingComponent/ # 직업훈련 컴포넌트
│   │   ├── index/       # 메인 페이지
│   │   └── modal/       # 모달 관련 컴포넌트
│   ├── api/             # API 통신 함수
│   ├── store/           # Recoil 상태 관리
│   ├── styles/          # 전역 스타일
│   ├── App.tsx          # 앱 진입점
│   └── main.tsx         # React 렌더링 진입점
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
<br/>

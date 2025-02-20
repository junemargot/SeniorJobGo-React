export const initialExample = {
  name: "김순자",
  email: "",
  phone: "",
  contact: "",
  education: [
    {
      school: "○○초등학교",
      major: "",
      degree: "졸업",
      year: "1965"
    }
  ],
  experience: [
    {
      company: "△△마트",
      position: "매장관리",
      period: "2015-2020",
      description: "매장 진열 및 재고 관리, 고객 응대"
    },
    {
      company: "□□아파트",
      position: "미화원",
      period: "2010-2015",
      description: "건물 내부 청소, 분리수거 관리"
    }
  ],
  desired_job: [
    "경비원",
    "미화원",
    "주차관리",
    "마트 진열",
    "식당 보조"
  ],
  skills: "성실함, 책임감, 기본적인 스마트폰 사용 가능",
  additional_info: "건강하고 성실하게 일하겠습니다."
};

export const fieldLabels = {
  name: "성함",
  email: "이메일 (선택사항)",
  phone: "연락처",
  education: "학력 (선택사항)",
  experience: "경력사항",
  desired_job: "희망 직종",
  skills: "보유 기술 및 장점",
  additional_info: "자기소개"
};

export const fieldDescriptions = {
  experience: "최근 경력부터 작성해주세요. 짧은 기간이라도 좋습니다.",
  desired_job: "희망하시는 일자리를 선택해주세요 (여러 개 선택 가능)",
  skills: "성실함, 책임감 등 자신의 장점을 적어주세요",
  additional_info: "간단한 자기소개를 해주세요"
};

export const jobOptions = [
  "경비원",
  "미화원",
  "주차관리",
  "마트 진열",
  "식당 보조",
  "공원관리",
  "복지시설 도우미",
  "택배 분류",
  "가사도우미",
  "요양보호사",
  "기타"
]; 
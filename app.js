// ========================================
// 기본 학교 정보
// ========================================

const SCHOOL = {
  name: "강화고등학교",

  // 인천광역시교육청
  officeCode: "E10",

  // 강화고등학교
  schoolCode: "7310036",

  grade: "2",
  className: "1"
};

// ========================================
// 시간표 과목 이름 설정
// ========================================

const SUBJECT_NAMES = {

  "경제": "D_경제",

  "윤리와 사상": "E_윤사",

  "경제 수학": "A_경수",

  "도시의 미래 탐구": "B_도시",

  "자율·자치활동": "창체"

};


// ========================================
// DOM
// ========================================

const noticeInput =
  document.getElementById("notice");

const loadButton =
  document.getElementById("loadBtn");

const copyButton =
  document.getElementById("copyBtn");

const result =
  document.getElementById("result");

const status =
  document.getElementById("status");


// ========================================
// 날짜
// ========================================

function getTomorrow() {

  const date = new Date();

  date.setDate(date.getDate() + 1);

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}${month}${day}`;
}


// ========================================
// 현재 학년도
// ========================================

function getSchoolYear() {

  const date = new Date();

  const year =
    date.getFullYear();

  // 고등학교 학년도는 보통 3월 시작
  if (date.getMonth() + 1 < 3) {
    return year - 1;
  }

  return year;
}


// ========================================
// 시간표 가져오기
// ========================================

async function getTimetable() {

  const date = getTomorrow();

  const response = await fetch(
    `https://ganghwa-class-api.gangim2009.workers.dev/api/timetable?date=${date}`
  );

  if (!response.ok) {
    throw new Error("시간표 API 요청 실패");
  }

  const data = await response.json();

  return (data.timetable || []).map(
  subject => SUBJECT_NAMES[subject] || subject
);
}

// ========================================
// 급식 가져오기
// ========================================

async function getMeal() {

  const date = getTomorrow();

  const response = await fetch(
    `https://ganghwa-class-api.gangim2009.workers.dev/api/meal?date=${date}`
  );

  if (!response.ok) {
    throw new Error("급식 API 요청 실패");
  }

  const data = await response.json();

  return data.meals || [];
}
// ========================================
// 반톡 문구 만들기
// ========================================

function createMessage(notice, timetable, meals) {

  // 공지사항을 줄 단위로 나누고
  // 각 줄 앞에 "- " 붙이기
  const noticeText = notice
    .split(/\r?\n/)
    .filter(line => line.trim() !== "")
    .map(line => "- " + line.trim())
    .join("\n");

  // 시간표
  const timetableText = timetable.length > 0
    ? timetable.join("\n")
    : "시간표가 없습니다.";

  // 급식
  const mealText = meals.length > 0
    ? meals.map(meal => "ㆍ" + meal).join("\n")
    : "급식이 없습니다.";

  return `공지사항📣
${noticeText || "- 없음"}

내일 시간표
${timetableText}

내일 급식🍚
${mealText}`;
}


// ========================================
// 정보 불러오기
// ========================================

loadButton.addEventListener("click", async () => {

  loadButton.disabled = true;

  status.textContent = "내일 정보를 불러오는 중...";

  try {

    const [
      timetable,
      meals
    ] = await Promise.all([
      getTimetable(),
      getMeal()
    ]);

    result.textContent = createMessage(
      noticeInput.value,
      timetable,
      meals
    );

    status.textContent =
      "정보를 성공적으로 불러왔습니다.";

  } catch (error) {

    console.error(error);

    // API가 아직 연결되지 않았어도
    // 공지사항은 정상적으로 표시
    result.textContent = createMessage(
      noticeInput.value,
      [],
      []
    );

    status.textContent =
      "시간표/급식 API는 아직 연결되지 않았습니다.";

  } finally {

    loadButton.disabled = false;

  }

});

// ========================================
// 복사
// ========================================

copyButton.addEventListener(
  "click",
  async () => {

    try {

      await navigator.clipboard.writeText(
        result.textContent
      );


      status.textContent =
        "📋 반톡 문구를 복사했습니다.";

    }

    catch (error) {

      status.textContent =
        "복사에 실패했습니다.";

    }

  }
);
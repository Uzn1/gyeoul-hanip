---
name: 겨울한입 · 카카오맵과 네이버 지도 분석
slug: gyeoul-hanip
category: local-map
last_updated: "2026-11-24"
created_at: "2026-11-24"
lang: ko
logo: public/app/icon.svg
colors:
  # 관찰값 · 공개 데스크톱 웹의 해당 요소에서 읽은 계산 스타일
  kakao-search-border: "#4ca3ff"
  kakao-search-tab-selected: "#0058cd"
  kakao-area-search: "#4d8bfc"
  naver-search-border: "#19ce60"
  naver-selected-map-type: "#006cff"
  naver-search-text: "#1c1c1c"
  # 겨울한입 · 앱에서 사용하는 역할
  primary: "{colors.terracotta}"
  terracotta: "#a94025"
  terracotta-hover: "#8e321c"
  brand-mark: "#f67552"
  bg-page: "#f9f6ee"
  bg-surface: "#fffdf8"
  bg-subtle: "#f7f4ec"
  fg-1: "#282721"
  fg-2: "#655f54"
  border-1: "#e7e0d3"
  focus: "#9d4d33"
  selling: "#35654b"
  sold-out: "#984527"
  missing: "{colors.sold-out}"
  unconfirmed: "#6c6356"
  stale: "#785a34"
  stale-tint: "#f3e8d6"
  pin-fish: "#fa754d"
  pin-pancake: "#e9a238"
  pin-potato: "#9574a0"
  pin-cake: "#7b9662"
  pin-other: "#8f8b7b"
  location: "#3579df"
typography:
  display:
    fontFamily: "{fonts.font-body}"
    fontSize: "clamp(45px, 6vw, 83px)"
    fontWeight: 900
    lineHeight: 1.12
  dialog-title:
    fontFamily: "{fonts.font-body}"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.2
  section-title:
    fontFamily: "{fonts.font-body}"
    fontSize: 18px
    fontWeight: 700
  body:
    fontFamily: "{fonts.font-body}"
    fontSize: 16px
    lineHeight: 1.55
  result-title:
    fontFamily: "{fonts.font-body}"
    fontSize: 15px
    fontWeight: 700
  label:
    fontFamily: "{fonts.font-body}"
    fontSize: 14px
    fontWeight: 750
  caption:
    fontFamily: "{fonts.font-body}"
    fontSize: 12px
    fontWeight: 750
spacing:
  space-1: 4px
  space-2: 7px
  space-3: 10px
  space-4: 15px
  space-5: 16px
  space-6: 25px
  gutter-mobile: 13px
  gutter-desktop: 36px
rounded:
  xs: 4px
  sm: 6px
  md: 9px
  marker: 13px
  lg: 17px
  xl: 18px
  pill: 40px
  circle: 50%
elevation:
  shadow-1: "0 2px 8px #52462c17"
  shadow-2: "0 3px 13px #4936200b"
  shadow-marker: "0 3px 6px #33281550"
  shadow-dialog: "0 20px 80px #2d201d50"
fonts:
  font-body: "ui-sans-serif, Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif"
  font-kakao-observed: "AppleSDGothicNeo-Regular, 돋움, dotum, sans-serif"
  font-naver-observed: "Apple SD Gothic Neo, Apple SD Gothic, notosanskr, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif"
---

카카오맵과 네이버 지도에서 **망원시장 붕어빵**을 검색하고 지도, 결과 목록, 검색창과 지도 조작의 배치를 비교했다. 2026년 11월 24일, 로그인 없이 데스크톱 웹 1280 × 720에서 확인했다. 숫자가 붙은 관찰값은 브라우저에서 읽은 요소별 계산 스타일이다. 화면 구성과 토큰 표에는 겨울한입에 적용하는 값을 함께 기록했다. [src:1] [src:2] [src:3]

## Brand & Style

| 항목 | 카카오맵 | 네이버 지도 | 겨울한입 |
| --- | --- | --- | --- |
| 첫 화면 | 검색·교통 모드를 파란 헤더 아래에 두고 주변 탐색과 신규 장소 등록을 노출한다. | 왼쪽의 세로 탐색 메뉴와 검색 패널을 지도 옆에 둔다. | 상단 서비스 이름과 제보 버튼 아래에서 간식 필터, 지도, 거리순 목록으로 바로 이어진다. |
| 선택 표시 | 결과 행의 문자, 파란 핀의 문자, 지도 말풍선이 같은 장소를 가리킨다. | 결과 목록의 장소명·카테고리와 지도 위 장소명·핀 아이콘을 함께 보여준다. | 간식별 아이콘과 색을 핀에 반복하고, 핀과 목록에서 같은 상세 화면을 연다. |
| 방문 전 판단 | 결과 행에 장소 유형, 평가, 주소, 영업시간, 길찾기를 제공한다. | 장소명, 업종, 영업 상태, 거리, 주소를 사진과 함께 보여준다. | 장소명 아래에 주민의 마지막 확인 상태와 시각을 두고, 거리는 행 끝으로 모은다. |

카카오맵은 선택한 장소를 글자 핀과 말풍선으로 짚어준다. 네이버 지도는 사진과 영업 시간, 거리를 가까이 배치해 목록에서 후보를 비교하기 쉽다. 겨울한입에서는 핀과 행의 대응을 유지하면서 주민이 실제로 본 상태와 확인 시각에 가장 높은 우선순위를 둔다. 두 지도에 검색된 판매처와 영업시간은 화면 비교에만 사용했다. [src:1] [src:3]

## Colors

### 배포 화면 관찰값

| 서비스 | 요소 | 계산값 |
| --- | --- | --- |
| 카카오맵 | 검색 필드 테두리 · 선택된 검색 메뉴 배경 · 지도 범위 재검색 버튼 배경 | `#4ca3ff` · `#0058cd` · `#4d8bfc` |
| 네이버 지도 | 검색 필드 테두리 · 선택된 일반지도 버튼 테두리와 글자 · 입력 글자 | `#19ce60` · `#006cff` · `#1c1c1c` |

관찰값은 검색 결과 화면의 개별 요소에서 수집했다. 지도 타일의 도로, 공원, 물 색과 테마 전체 팔레트는 Known Gaps에 기록했다. [src:1] [src:3]

### 쓰임별 색 대응

| 쓰임 | 겨울한입 토큰 | 적용 |
| --- | --- | --- |
| 브랜드와 행동 | `{colors.brand-mark}` · `{colors.primary}` | 로고는 산호색, 제보와 저장 버튼은 흰 글자의 진한 테라코타색을 쓴다. |
| 표면과 글자 | `{colors.bg-page}` · `{colors.bg-surface}` · `{colors.fg-1}` | 따뜻한 외곽 배경 위에 지도와 목록을 각각 구획한다. |
| 방문 결과 | `{colors.selling}` · `{colors.sold-out}` · `{colors.missing}` | 상태와 확인 시각을 글자로 쓴다. 품절과 위치 미발견은 문구로 구별한다. |
| 확인 시점 | `{colors.unconfirmed}` · `{colors.stale-tint}` | 오늘 확인 여부와 7일 이상 지난 현장 확인 여부를 따로 표시한다. |
| 지도 핀 | `{colors.pin-*}` · `{colors.location}` | 핀 색은 간식 종류, 파란 원은 사용자 위치에 쓴다. |

## Typography

### Font families

검색 입력은 두 서비스 모두 **16px / 700**으로 관찰됐다. 카카오맵의 선택한 결과명은 **17px / 500**이고 지도 위 말풍선의 같은 장소명은 **12px / 600**이었다. 네이버 지도에서 선택된 일반지도 레이어의 라벨은 **10px / 500**이었다. 상단 YAML의 관찰 스택은 브라우저가 보고한 후보 목록이다. [src:1] [src:3]

### Type scale & semantic classes

| 계층 | 겨울한입 값 | 사용 위치 |
| --- | --- | --- |
| `display` | 45–83px / 900 | 홈 제목 한 곳 |
| `dialog-title` · `section-title` | 26px · 18px | 판매처 상세·제보 제목, 거리순 목록 제목 |
| `body` · `result-title` | 16px · 15px | 설명, 폼 입력, 목록의 판매처 이름 |
| `label` · `caption` | 14px · 12px | 필터·버튼, 목록의 종류·거리·시각 |

목록의 상태와 시각은 상세 화면에서도 보여준다. 지역명과 숫자를 글자 그대로 읽을 수 있어야 하며, 시장 이름이나 메뉴가 길면 목록에서 한 줄로 줄이고 상세에서 전체 이름을 보인다. [src:4]

## Spacing

데스크톱 검색 필드의 바깥 상자는 카카오맵 **350 × 46px**, 네이버 지도 **340 × 46px**였다. 겨울한입은 PC에서 지도와 목록 사이를 `{spacing.space-5}`, 700px 이하에서는 `{spacing.space-3}`으로 두고, 목록의 썸네일과 글자 사이도 `{spacing.space-3}`을 쓴다. [src:1] [src:3] [src:4]

## Rounded

카카오맵 검색 상자의 모서리 반경은 **3px**, 네이버 지도는 **5px**였다. 카카오맵의 지도 범위 재검색은 **99px** 반경을 쓴다. 겨울한입은 범위를 빠르게 바꾸는 필터를 `{rounded.pill}`, 입력과 행동 버튼을 `{rounded.md}`, 지도·목록 틀을 `{rounded.lg}`, 대화상자를 `{rounded.xl}`로 사용한다. [src:1] [src:3] [src:4]

## Elevation & Depth

지도 위에 얹는 버튼은 밝은 지형 위에서도 외곽선을 식별할 수 있어야 한다. 카카오맵의 범위 재검색 버튼은 `0 1px 4px rgba(0,0,0,.2)`, 네이버 지도의 일반지도 버튼은 `0 1px 3px rgba(0,0,0,.1)`이 관찰됐다. 겨울한입의 지도 조작에는 `{elevation.shadow-1}`, 핀에는 `{elevation.shadow-marker}`를 쓴다. 대화상자는 화면을 어둡게 하고, 표면 아래에 `{elevation.shadow-dialog}`를 둔다. [src:1] [src:3] [src:4]

### Animation

겨울한입은 핀 강조 크기를 **150ms**, 오늘 판매 확인 스위치를 **180ms**에 변경한다. 브라우저에서 모션 줄이기를 선택하면 전환 시간을 제거한다. 참고 지도에서 애니메이션 시간은 계측하지 않았다. [src:4]

## Shapes

### Iconography

- **핀**은 흰 테두리가 있는 39px 둥근 사각에 꼬리를 붙인다. 간식 아이콘을 넣고, 조작 중인 핀은 46px로 강조한다. 카카오맵의 문자 핀에서 목록과 지도 간 대응 원리를 확인했다. [src:1] [src:4]
- **썸네일**은 목록에서 52px 정사각이다. 네이버 지도의 사진이 후보 구별에 쓰이는 관찰을 반영했다. 겨울한입 이미지는 메뉴 종류를 표상하는 자료이고 상세와 목록에는 판매처 이름과 제보 시각을 별도로 표시한다. [src:3] [src:4]
- **지도 조작**은 확대, 축소, 내 위치를 지도의 같은 모서리에 모은다. 텍스트를 생략한 버튼에도 접근 가능한 이름을 붙인다. [src:1] [src:2] [src:4]

## Components

아래 코드 예시는 화면의 정보 순서를 설명한다. 프로젝트의 구현은 [지도 HTML](public/map.html)과 [화면 코드](public/app/main.mjs)에 있다.

### search-bar

두 참고 지도에서 검색어는 목록 위에 남는다. 겨울한입 검색창은 판매처 이름, 간식 종류, 찾는 법을 조회하고 입력을 비우면 나머지 조건을 유지한 채 결과를 되돌린다. [src:1] [src:3] [src:4]

### filter-chip-row

`전체`, `붕어빵`, `호떡`, `군고구마`, `어묵`, `기타`를 한 행에 둔다. 한 번에 한 종류를 선택하고 `오늘 판매 확인`은 독립 스위치로 둔다. 목록 수와 지도 핀은 하나의 결과 집합에서 계산한다. 좁은 화면에서 칩 행은 가로로 스크롤한다. [src:4]

### place-row

썸네일, 종류, 이름, 방문 상태, 거리를 한 행에 묶는다. 거리순의 기준점은 목록 머리말에서 밝힌다. 위치 권한이 없으면 망원동 중심을 사용한다. [src:4]

```tsx
<PlaceRow distance="180 m">
  <SnackPhoto kind="붕어빵" />
  <SnackType>붕어빵</SnackType>
  <PlaceName>시장 입구 붕어빵</PlaceName>
  <StatusLabel status="selling" checkedAt="오늘 16:20" />
</PlaceRow>
```

### map-marker

같은 판매처의 핀과 목록을 눌렀을 때 동일한 상세를 연다. 핀의 접근 가능한 이름에 판매처 이름을 포함한다. 새 제보의 선택 위치는 테라코타 원, 사용자의 현재 위치는 파란 원으로 표시한다. [src:4]

### badge-status

| 조건 | 표기 |
| --- | --- |
| 오늘 마지막 제보가 판매 중 | `오늘 16:20 판매 확인` |
| 오늘 마지막 제보가 품절 또는 위치 미발견 | `오늘 16:20 품절` 또는 `오늘 16:20 현장에서 못 찾음` |
| 오늘 제보 없음 | `오늘 확인 없음` |
| 7일간 판매 중·품절 제보 없음 | 기존 상태와 함께 `최근 확인 필요` |
| 현장 검증 전 예시 | 카드와 상세에서 `예시` |

자정은 한국 시간을 기준으로 한다. 품절은 판매처를 확인한 방문으로 기록한다. 위치 미발견 제보는 최근 방문 기록에 남기고 현장 확인일은 유지한다. [src:4]

### visit-report-actions

판매처 상세의 찾는 법 아래에 `판매 중`, `품절`, `현장에서 못 찾음`을 나란히 둔다. 로그인 후 저장하면 새 제보가 목록과 상세에 반영된다. 이전 기록은 상세에서 시간순으로 읽는다. [src:4]

### duplicate-candidates

새 핀과 55m 이내에 있는 기존 판매처를 등록 폼 위에서 보여준다. 같은 곳이면 상세를 열어 방문 상태를 제보한다. 다른 곳이면 이름, 종류, 찾는 법, 상태를 채워 새 핀을 등록한다. [src:4]

### empty-state

필터 결과가 비면 빈 상태 설명과 제보 버튼을 보여준다. 네트워크 오류에는 다시 불러오기, 위치 권한 거부에는 동네 중심 탐색을 제공한다. [src:4]

## Key Screens

### 카카오맵 · 검색 결과와 선택

**화면 배치**

1. 왼쪽 패널 상단에 파란 서비스 헤더와 모드 탭을 둔다.
2. 검색창 아래 결과 유형 탭, 검색 범위 안내, 장소 목록을 배치한다.
3. 목록 행의 문자와 지도 핀 문자를 맞춘다. 결과를 고르면 행 배경을 강조하고 지도에서 말풍선을 보여준다.
4. 지도 가장자리에 도구를 두고 하단 중앙에서 현재 범위를 다시 검색한다. [src:1]

**핵심 디자인 결정** — 목록의 위치 정보와 지도 위의 핀을 서로 읽을 수 있게 연결한다. 겨울한입은 선택한 간식 아이콘과 상세 화면에서 연결을 표현한다. [src:1] [src:4]

### 네이버 지도 · 검색 결과와 비교

**화면 배치**

1. 세로 메뉴, 검색·목록 패널, 지도가 나란히 놓인다.
2. 장소명, 업종, 영업 상태, 거리·주소와 정사각 사진이 결과 행에 표시된다.
3. 지도 위에는 빠른 탐색 버튼과 레이어 도구, 위치와 확대·축소 조작을 둔다. 목록 패널을 접을 수 있다. [src:2] [src:3]

**핵심 디자인 결정** — 목록만 훑어도 장소 후보를 비교할 수 있게 한다. 겨울한입은 영업 예정 시간 자리에서 오늘의 제보 시각을 보여준다. [src:3] [src:4]

### 겨울한입 · 지도 홈과 판매처 상세

**배치 순서**

1. 상단에는 서비스 이름, 로그인, 판매처 제보가 있다.
2. 간식 필터와 오늘 확인 스위치 아래에 지도와 가까운 판매처 목록을 둔다. 위치 기준을 목록 제목 줄에서 확인할 수 있다.
3. 판매처 선택 시 상세를 열어 확인 시각, 찾는 법과 방문 기록을 순서대로 보여준다.
4. 하단에 가까운 판매처의 정보가 틀렸을 때 쓸 신고 진입점을 둔다. [src:4]

```tsx
<WinterMapScreen>
  <SnackFilters />
  <TodaySellingSwitch />
  <Explorer>
    <NeighborhoodMap />
    <NearbyPlaces sort="distance" />
  </Explorer>
  <PlaceDetail>
    <StatusLabel />
    <Directions />
    <VisitReportActions />
    <VisitHistory />
  </PlaceDetail>
</WinterMapScreen>
```

### 겨울한입 · 새 판매처 제보

**진행 순서** — 로그인 → 지도에서 핀 지정 → 주변 후보 확인 → 기존 핀에 방문 제보 또는 새 판매처 등록. 핀 다시 찍기에서는 작성한 메뉴와 찾는 법을 유지한다. 키보드 사용자는 방향키로 지도를 이동하고 지도 중심에 핀을 지정할 수 있다. [src:4]

## Voice & Copy

짧은 한국어와 구체적인 동사를 쓴다. 확인되지 않은 시간은 확정된 영업으로 표현하지 않는다. 두 참고 지도의 검색 범위나 영업 표기와 마찬가지로, 위치 기준과 시각을 레이블 안에서 확인할 수 있게 한다. [src:1] [src:3] [src:4]

| 상황 | 겨울한입 카피 |
| --- | --- |
| 검색 입력 | `간식이나 판매처를 검색해 보세요` |
| 목록 거리 기준 | `망원동 중심 기준` · `내 위치 기준` |
| 방문 직전 | `오늘 16:20 판매 확인` |
| 확인 필요 | `오늘 확인 없음` · `최근 확인 필요` |
| 빈 결과 | `표시할 판매처가 없어요` · `이 동네에 첫 판매처 제보하기` |
| 위치 사용 불가 | `현재 위치를 확인할 수 없어요. 망원동 중심에서 둘러보세요.` |
| 제보 성공 | `방문 제보를 저장했어요.` |

## Do's and Don'ts

### Do

- 선택한 필터, 거리 기준, 표시된 판매처 수를 탐색 중 확인할 수 있게 한다.
- 간식 종류는 핀의 색과 아이콘으로, 판매 상태는 확인 시각이 있는 문구로 표현한다.
- 주소 옆에 시장 입구나 맞은편 가게처럼 실제 방문을 돕는 찾는 법을 노출한다.
- 위치 권한을 요청하기 전에 내 위치 사용이라는 명시적인 행동을 제공한다.
- 지도 좌표와 방문 이력의 출처를 화면에서 구별하고, 예시에는 눈에 띄는 레이블을 붙인다.

### Don't

- 핀이나 배지 색상만으로 판매 여부를 전달하지 않는다.
- 지난 제보를 오늘의 영업으로 표시하거나 위치 미발견 제보만으로 판매처를 숨기지 않는다.
- 참고 지도 서비스의 브랜드 헤더, 세로 메뉴, 고유 핀을 그대로 옮기지 않는다.

## Responsive Behavior

| 구간 | 겨울한입 컨테이너 | 주요 변화 |
| --- | --- | --- |
| **921px 이상** | 최대 1320px · 좌우 최소 36px | 지도와 335–370px 목록을 나란히 두며, 높이는 550px이다. |
| **701–920px** | 좌우 20px | 목록 폭 320px, 지도와 목록 높이 515px, 패널 간격 10px으로 조정한다. |
| **700px 이하** | 좌우 13px | 360px 높이의 지도 아래에 목록을 쌓는다. 필터 행은 가로 스크롤하고 토글은 별도 줄에 둔다. |
| **350px 이하** | 모바일 여백 유지 | 상단 장식은 숨기고 브랜드와 주요 행동을 한 줄에 둔다. |

네이버 지도 데스크톱 검색 URL을 브라우저에서 390px로 줄였더니 세로 메뉴와 결과 목록이 먼저 보였고 지도는 캡처 안에 보이지 않았다. 이 결과는 해당 데스크톱 URL의 좁은 창 동작이다. 겨울한입의 작은 화면은 지도를 목록 위에 배치한다. [src:3] [src:4]

## Known Gaps

- 참고 서비스의 수치는 검색 화면에서 선택한 요소만 계측했다. 다크 테마, 일부 메뉴의 반응형 규칙, 모바일 전용 웹·네이티브 앱, 디자인 시스템 전체 토큰은 조사 범위 밖이다.
- 카카오맵의 좁은 창 계측에서는 뷰포트가 1280px로 유지되어 390px 레이아웃을 확인하지 못했다. 카카오맵 관찰 설명은 데스크톱 화면 기준이다.
- 네이버 지도는 검색 결과 목록과 지도까지만 확인했다. 업체 상세의 내부 탭 구조나 로그인 후 저장 경험은 설명에 포함하지 않았다.
- 겨울한입의 반응형 수치는 현재 CSS에서 확인했다. 실기기와 스크린리더의 터치 조작은 별도 검증이 필요하다.

## References

1. [src:1] [카카오맵 데스크톱 웹](https://map.kakao.com/)
2. [src:2] [네이버 지도 데스크톱 지도 홈](https://map.naver.com/p?c=15.00,0,0,0,dh)
3. [src:3] [네이버 지도 · 망원시장 붕어빵 검색](https://map.naver.com/p/search/%EB%A7%9D%EC%9B%90%EC%8B%9C%EC%9E%A5%20%EB%B6%95%EC%96%B4%EB%B9%B5?c=15.00,0,0,0,dh)
4. [src:4] [겨울한입 기획](Plan.md) · [지도와 목록 스타일](public/app/style.css) · [지도 조작](public/app/map.mjs) · [방문 상태와 필터](public/app/community.mjs)

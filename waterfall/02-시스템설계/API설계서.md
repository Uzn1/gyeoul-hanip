# API 설계서

| 항목 | 내용 |
| --- | --- |
| 프로젝트 · 문서 | 겨울한입 · API-WINTER-v0.1 |
| 작성일 · 작성자 | 2026-11-24 · Codex |
| 상태 | G2 검토용 초안 · 승인 기록 없음 |
| 대상 | 같은 오리진의 `/api/v1` · HTTPS · JSON |

## 변경 이력

| 버전 | 날짜 | 변경 |
| --- | --- | --- |
| v0.1 | 2026-11-24 | 공개 조회, 인증 쓰기, 운영 검토, 오류와 재시도 계약 정의 |

## 1. 설계 원칙

목표 계약은 [SRS](../01-요구사항분석/요구사항명세서-SRS.md)와 [RTM](../01-요구사항분석/요구사항추적매트릭스-RTM.md)을 기준으로 한다. 기존 시범의 `/api/community`와 별도 경로다. [SAD](시스템아키텍처설계서-SAD.md)의 전환 순서에 맞춰 공개 화면과 API를 함께 검증한다.

공개 읽기는 브라우저 현재 좌표를 받지 않는다. 브라우저는 공개 카탈로그로 지도와 목록을 만들고, 현재 위치를 허용한 경우에만 로컬에서 거리를 다시 계산한다. 사용자가 제보 화면에서 **판매처 위치로 확정한 좌표**만 쓰기 요청에 포함한다.

## 2. 인증과 공통 규격

| 구분 | 계약 |
| --- | --- |
| 공개 | 세션 없이 지도, 상세와 공개 후기를 읽는다. 공개 응답의 필드는 세션 유무와 동일하다. |
| 기여자 | 같은 오리진의 검증된 세션을 사용한다. 서버에서 사용자·후기 소유권과 쓰기 권한을 확인한다. 쓰기 요청의 Origin도 검사한다. |
| 운영자 | 운영 권한을 별도로 검사한다. 운영 응답에 포함된 신고·근거는 공개 API와 분리한다. |
| 표현 | ID는 JSON의 문자열, 버전은 양의 정수, 저장 시각은 UTC ISO 8601이다. 한국 날짜 계산은 `Asia/Seoul`을 사용한다. |
| 성공 | `{"data": ...}`. 목록의 페이지는 `data.nextCursor`에 다음 커서 또는 `null`을 담는다. 204에는 본문이 없다. |
| 실패 | `{"error":{"code":"VALIDATION_ERROR","message":"입력 항목을 확인해 주세요.","fields":{"district":"서울 자치구를 선택해 주세요."}},"requestId":"req_example"}`. 필요한 경우 오류에 공개 가능한 대체 ID를 넣는다. |
| 재시도 | API-05~07, API-09~10, API-12~13에 `Idempotency-Key`를 보낸다. 같은 주체·메서드·정규화 경로·키와 같은 요청은 직전 완료 결과를 반환한다. 내용이 바뀐 요청에는 새 키를 사용한다. |
| 페이지·캐시 | 공개 카탈로그는 MVP의 한 스냅숏으로 제공한다. 후기와 운영 큐는 정렬 기준에 묶인 불투명 커서를 사용한다. 세션, 개인 후기, 운영 조회는 `no-store`다. 초기 공개 데이터 API도 쓰기 직후 일관성을 위해 `no-store`로 시작한다. |

로그인·로그아웃은 인증 제공자의 동작을 이용한다. UI는 로그인 전 같은 오리진의 화면과 작업, 대상 ID를 보관하고 완료 후 해당 화면으로 돌아간다. 반환 경로에서 외부 오리진을 허용하지 않으며 로그인 복귀 자체가 쓰기를 다시 제출하지 않는다. 제공자와 세션 정책은 DEC-002에서 확정한다.

## 3. 공통 응답 모델

| 모델 | 필드 |
| --- | --- |
| `PlaceSummary` | `id, name, district, pin, categories, verificationStatus`. 자치구 미확정인 기존 자료의 `district`는 `null`이며 자치구 미선택 결과에서만 표시한다. 검색용으로 공개 주소·찾는 법·메뉴 키워드에서 만든 `searchText`를 포함할 수 있다. |
| `PlaceDetail` | `PlaceSummary`와 `address, directions, menus, openingHours, serviceMode, sources, updatedAt, visitSummary`. 후기 집계는 API-03에서 제공한다. |
| `Pin` | `{lat, lng}`. WGS84 숫자이며 새 판매처 위치는 승인된 서울 경계·자치구와 일치해야 한다. |
| `PlaceSource` | `kind`는 `NAVER, KAKAO, RESIDENT, OWNER` 중 하나. 공개 가능한 `url`과 `checkedAt`은 값이 없으면 `null`이다. 확인된 사업주 표시의 자격은 DEC-002를 따른다. |
| `PublicReview` | `id, stars, body, createdAt, updatedAt`. 작성자 내부 ID를 포함하지 않는다. |
| `OwnReview` | `PublicReview`와 본인의 `status`를 반환한다. 작성한 기록을 읽을 수 없으면 `review: null`이다. |
| `ReviewSummary` | `{count, average}`. 공개 후기 0건이면 `{count: 0, average: null}`이다. |
| `VisitSummary` | `{asOf, latestAt, latestStatus, lastConfirmedAt, todayStatus, stale}`. 방문 상태 기능이 꺼져 있으면 `visitSummary: null`이다. 사용하지 않는 파생값은 `null`로 준다. |

`categories`는 카테고리 키 배열이다. 기존 키 `fish, pancake, potato, cake, other`를 설계 초기 기준선으로 사용한다. `menus`는 등록된 메뉴명 배열이다. `openingHours`는 `{weekly, note}` 또는 `null`이다. `weekly`의 한 구간은 `{weekday, opensAt, closesAt, endsNextDay}`이고, 요일은 월요일 1부터 일요일 7까지다. 시간은 현지 `HH:mm`이다. 자료가 확인된 요일·구간만 기재한다. 미등록 요일을 휴무로 추정하지 않는다. 명시된 휴무·예외는 `note`로 전달한다. `serviceMode`는 `TAKEOUT_ONLY, DINE_IN_ONLY, BOTH` 또는 `null`이다.

## 4. 엔드포인트 목록

아래 경로는 공통으로 `/api/v1` 아래에 있다.

| ID | 메서드 · 경로 | 권한 | 입력 → 성공 | 요구사항 |
| --- | --- | --- | --- | --- |
| API-01 | `GET /places` | 공개 | 소비자 위치 입력 없음 → 200 `{places: PlaceSummary[], asOf}` | FR-001~003, FR-017 |
| API-02 | `GET /places/{placeId}` | 공개 | 판매처 ID → 200 `PlaceDetail` | FR-001, FR-004, FR-016 |
| API-03 | `GET /places/{placeId}/reviews` | 공개 | 선택 `cursor` → 200 `{reviews, summary, nextCursor}` | FR-001, FR-012 |
| API-04 | `GET /session` | 공개 | 현재 세션 → 200 `{viewer: null}` 또는 `{viewer: {role}}` | FR-005 |
| API-05 | `POST /places` | 기여자 | 신규 제보 폼 → 201 `{place: PlaceSummary}` | FR-006, FR-007, FR-017 |
| API-06 | `POST /places/{placeId}/reports` | 기여자 | 정정 의견 또는 신고 → 201 `{reportId, status: "PENDING"}` | FR-007, FR-008, FR-017 |
| API-07 | `POST /places/{placeId}/visits` | 기여자 | 현장 관찰 상태 → 201 `{visitId, placeId, status, recordedAt}` | FR-015, FR-016, FR-017 |
| API-08 | `GET /places/{placeId}/reviews/me` | 본인 | 판매처 ID → 200 `{review: OwnReview 또는 null}` | FR-011 |
| API-09 | `PUT /places/{placeId}/reviews/me` | 본인 | 별점, 후기글 → 200 `{review: OwnReview}` | FR-011, FR-012, FR-017 |
| API-10 | `DELETE /places/{placeId}/reviews/me` | 본인 | 판매처 ID → 204 | FR-011, FR-012, FR-017 |
| API-11 | `GET /ops/queue` | 운영자 | `kind=report` 또는 `kind=confirmation`, 선택 `cursor` → 200 `{cases, nextCursor}` | FR-008, FR-009 |
| API-12 | `POST /ops/places/{placeId}/decisions` | 운영자 | 결정, 근거, 대상 버전 → 200 `{decisionId, placeId, revision}` | FR-008, FR-009 |
| API-13 | `POST /ops/merges` | 운영자 | 두 판매처 ID·버전과 근거 → 200 `{decisionId, replacementPlaceId}` | FR-010 |
| API-14 | `GET /ops/places/{placeId}` | 운영자 | 대상 ID → 200 `{place, visibility, revision, mergedIntoId, reports, visitSummary}`. 사건별 이력은 목록에 표시할 최근 항목과 조회 근거를 제공한다. | FR-008~010 |

`role`은 작성을 허용한 `CONTRIBUTOR` 또는 `OPERATOR`이며 미로그인은 `null`이다. 관리 화면에서 인증된 운영 요구사항과 관련된 서버 권한을 다시 확인한다.

## 5. 중요한 요청과 경계 처리

### 5.1 신규 제보와 기존 후보

API-05의 요청 예시다. 주소·찾는 법·공개 근거의 필수 조건은 DEC-003에 연결한다. 아래 입력은 현재 검토안에 따른 것이다.

```json
{
  "name": "시장 앞 호떡",
  "district": "마포구",
  "pin": {"lat": 37.555, "lng": 126.905},
  "categories": ["pancake"],
  "directions": "시장 입구 쪽 가판대",
  "sourceUrl": null
}
```

- 브라우저는 API-01의 공개 후보에서 핀 근처를 검색하고 같은 판매처가 선택되면 API-05 대신 API-06 또는 API-07로 연결한다. 후보 반경은 DEC-003으로 정한다. 서버는 신규 요청을 검증하고, 이름·장소가 비슷하다는 이유만으로 자동 병합하지 않는다.
- 생성과 제보 기록을 함께 저장한다. 응답의 `verificationStatus`는 `UNVERIFIED`다. 응답 뒤 목록을 다시 읽어 같은 ID를 강조한다. 판매처 등록 상태와 현장 방문 기록은 별도로 관리한다.

### 5.2 정정·현장 관찰·후기

| ID | 요청 규격과 예외 |
| --- | --- |
| API-06 | `{kind, notes, duplicatePlaceId?, proposedChanges?}`. `kind`는 `INFO_CORRECTION, WRONG_PIN, DUPLICATE, SUSPECTED_CLOSED`. `DUPLICATE`에만 다른 판매처 ID를 받는다. 정보 정정은 상세 필드 중 승인된 항목을 `proposedChanges`에 넣는다. 접수만으로 공개 값을 바꾸지 않는다. |
| API-07 | `{status}`, 하나의 `SELLING, SOLD_OUT, NOT_FOUND`. 서버가 접수 시각을 기록한다. `NOT_FOUND`는 마지막 현장 확인 시점을 갱신하지 않는다. 방문 기능 노출 및 최신성 기준은 DEC-003을 따른다. |
| API-09 | `{stars, body}`. 검토안은 1~5 정수와 판매처별 계정 한 건이며 본문 필수·길이·숨김 처리의 확정은 DEC-004다. 이용자가 작성자 ID를 보내지 않는다. 수정으로 운영 숨김이 해제되지 않도록 한다. |
| API-10 | 본인 후기만 삭제한다. 이미 공개·편집할 본인 후기가 없으면 204로 처리한다. 새 목록에 포함할 후기는 API-03의 동일 공개 조건으로 집계한다. |

API-03은 한 조회에서 공개 후기 페이지와 같은 공개 조건의 전체 평균·건수를 제공한다. 예를 들어 5점·3점 두 건은 `summary: {"average":4.0,"count":2}`로 반환한다. 커서는 `createdAt`과 `id`의 내림차순을 이어 읽을 수 있게 한다. 공개 여부가 페이지 사이에 바뀌면 재조회 결과를 사용한다.

### 5.3 운영 결정과 병합

- API-11의 각 항목은 `kind, caseId, placeId, placeName, reason, state, revision, createdAt`을 포함한다. 확인 전 후보는 판매처 ID와 등록 시각을 `caseId`와 `createdAt`에 사용한다. API-14에서 최신 버전과 조사 근거를 받는다.
- API-12의 입력은 `{decision, reason, expectedRevision, reportId?}`다. `decision`은 `VERIFY, APPLY_CORRECTION, CLOSE_REPORT, HIDE, RESTORE` 중 승인된 동작이다. `APPLY_CORRECTION, CLOSE_REPORT`는 같은 판매처의 열린 신고 ID가 필수다. 승인된 다른 동작에 연결된 신고가 있으면 같은 커밋에서 처리한다. 확인 해제 기준과 숨김·복원 권한은 DEC-003을 따른다.
- API-13은 `{sourcePlaceId, targetPlaceId, sourceRevision, targetRevision, reason}`을 받는다. 두 활성 판매처가 다르고 기준 버전이 맞아야 한다. 충돌한 활성 후기가 있고 DEC-004의 병합 규칙이 미정이면 `409 REVIEW_COLLISION`으로 운영자에게 보류를 알린다. 나머지 병합은 [DB 설계서](데이터베이스설계서.md)의 원자적 처리에 따라 실행한다.
- 병합된 기존 ID에 대한 공개 상세 및 쓰기는 현재 공개된 대표 후보가 있으면 `409 PLACE_MERGED`에 `replacementPlaceId`를 준다. 대표가 숨김이거나 대상이 공개 범위 밖이면 `404 NOT_FOUND`를 반환한다. 자동으로 원래 쓰기를 대표에 재제출하지 않는다.

### 5.4 운영 입력과 지표

| 작업 ID | 입력 | 결과 |
| --- | --- | --- |
| OPS-001 | 검토된 카탈로그 파일. 출처 제공처·원본 링크, 승인된 실물 식별자, 위치·자치구·취급 간식, 공개 승인 근거. 동일 출처 입력은 안정된 원본 키로 식별한다. | 승인된 한 실물 장소에 여러 출처 링크를 보존한다. 출처별 확인 수, 고유 공개 수, 보류·오류를 기록한다. 현장 방문과 별점은 입력하지 않는다. |
| OPS-002 | 실험 ID, 시작·종료·둘째 주 경계, 시작 때 고정한 판매처 표본, 운영·테스트 계정 분류, 유효 기여 판정 범위. | 비운영 유효 제보자 수와 둘째 주 제보를 받은 표본 판매처 비율을 별도로 계산한다. 원본과 분모가 확인되지 않으면 판정을 보류한다. |

운영 실행 방법은 후속 상세 설계에서 고른다. 초기에는 내부 작업으로 실행할 수 있다. API가 없는 조사를 위해 공개 화면에 대량 가져오기 버튼을 추가할 필요는 없다. FR-013~014 및 DEC-005의 범위다.

## 6. 오류·재시도 관리

| HTTP | 코드 | UI가 처리할 의미 |
| --- | --- | --- |
| 400 | MALFORMED_REQUEST | JSON·커서 형식 오류, 재작성 필요 |
| 401 | AUTH_REQUIRED | 로그인 필요, 작성 작업과 입력 유지 |
| 403 | FORBIDDEN | 권한·요청 출처 불일치, 변경 없음 |
| 404 | NOT_FOUND | 공개 범위에서 대상이 없거나 현재 조회할 수 없음 |
| 409 | PLACE_MERGED / STALE_REVISION | 대표 장소 확인 또는 운영 데이터 다시 읽기 |
| 409 | REVIEW_COLLISION / IDEMPOTENCY_CONFLICT | 후기 충돌 보류 또는 키와 입력 재검토 |
| 422 | VALIDATION_ERROR | 필드별 검증 안내 및 작성 입력 유지 |
| 429 | RATE_LIMITED | 제한이 설정된 경우 재시도 안내와 `Retry-After` 사용 |
| 503 | TEMPORARY_FAILURE | 저장·조회 실패, 같은 제출 재시도 가능 |

동일 키의 실행이 아직 완료되지 않은 경우 클라이언트는 같은 요청 키로 결과를 다시 확인한다. 서버의 키 보존 및 쓰기 제한 값은 예상 운영량과 DEC-007에 맞춰 확정한다. 공개 조회의 성공 0건은 200과 빈 배열이다.

## 7. 변경·검증 관리

- 주요 변경은 문서 버전과 SRS/RTM ID에 연결한다. 필드 추가 및 구버전 호환을 확인한 뒤 시범 클라이언트를 교체한다.
- 검증 기준은 [RTM](../01-요구사항분석/요구사항추적매트릭스-RTM.md)의 TC 후보와 [화면 설계서](화면설계서.md)로 이어진다. 특히 같은 위치 재제보, 로그인 복귀, 확인 전 공개, 후기 0건, 숨김 장소 조회 거절과 병합 충돌을 확인한다.
- 이 문서의 경로와 필드는 G2의 후보 계약이다. [워터폴 가이드](../AGENT.md), [시스템아키텍처 설계서](시스템아키텍처설계서-SAD.md), [데이터베이스 설계서](데이터베이스설계서.md)를 함께 검토한다.

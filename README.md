# 겨울한입

서울 마포구 망원동의 겨울간식 판매처를 찾고 방문 결과를 공유하는 모바일 웹 앱입니다. [기획](Plan.md), [작업 가이드](Agent.md), [지도·제보 검증 절차](Skill.md)를 참고하세요.

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```sh
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_bitter_tag.sql
npm run dev
node --test
```

`npm run dev`가 표시한 주소를 엽니다. 이 개발 환경에서는 로그인과 운영자 기능을 로컬 테스트 계정으로 검증할 수 있습니다. 운영 사이트에서는 ChatGPT 로그인과 D1을 사용합니다. 운영자 이메일 목록은 Sites의 `ADMIN_EMAILS` 비밀 환경 변수에 쉼표로 구분해 설정합니다.

GitHub Pages의 `docs/`는 공개 지도 서비스로 연결합니다. 판매처, 제보, 핀 신고는 앱의 서버에서 D1에 저장됩니다. 사이트 DB에 판매처가 0곳이면 메뉴와 상태를 보여 주는 예시 핀이 표시됩니다. 첫 실제 판매처를 등록하면 실제 핀으로 전환됩니다.

지도 바탕 데이터는 [OpenStreetMap 기여자](https://www.openstreetmap.org/copyright)가 제공합니다.

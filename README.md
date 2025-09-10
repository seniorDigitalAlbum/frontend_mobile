# DearMind Frontend

React Native Expo 앱의 웹 버전입니다.

## 로컬 실행

```bash
# 의존성 설치
npm install

# 웹 개발 서버 실행
npx expo start --web
```

## 빌드

```bash
# 웹용 빌드
npx expo export --platform web
```

## 배포

GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

- 메인 브랜치에 푸시하면 자동으로 배포됩니다.
- 배포된 사이트: https://[username].github.io/[repository-name]
# 시니어 접근성 기능 가이드

## 고급 접근성 기능 구현 완료

이 프로젝트에 시니어 사용자를 위한 고급 접근성 기능이 구현되었습니다.

### 구현된 기능

1. **세밀한 글씨 크기 조절**
   - 4단계 폰트 크기: 작게(0.9배), 보통(1.0배), 크게(1.4배), 매우 크게(1.8배)
   - 아이콘 크기 자동 조정 (폰트 크기에 비례)
   - 버튼과 입력 필드 크기 자동 조정

2. **스마트 레이아웃 자동 조절**
   - 폰트 크기에 따라 자동으로 간격 조정
   - 큰 글씨 모드에서 가로 배치를 세로 스택 레이아웃으로 자동 변경
   - 그리드 레이아웃을 세로 스택으로 자동 변환
   - 터치 영역 확대 (최소 3.5em × 3.5em)

3. **고대비 모드**
   - 검은 배경에 흰 글씨
   - 버튼과 입력 필드의 대비 강화
   - 포커스 표시 강화 (노란색 아웃라인)
   - 링크 색상 강조 (시안색, 호버 시 노란색)

4. **설정 영구 저장**
   - AsyncStorage를 사용하여 설정 저장
   - 앱 재시작 시에도 설정 유지

### 사용 방법

#### 1. 설정 화면에서 조절
- MyPage 화면에서 "접근성 설정" 섹션 확인
- **글씨 크기**: 작게, 보통, 크게, 매우 크게 중 선택 (자동으로 레이아웃 조정)
- **고대비 모드**: 스위치로 토글

#### 2. 프로그래밍 방식으로 사용
```typescript
import { useAccessibility } from '../contexts/AccessibilityContext';

function MyComponent() {
  const { 
    settings, 
    toggleLargeTextMode, 
    toggleHighContrastMode,
    setFontSizeLevel
  } = useAccessibility();
  
  return (
    <View>
      <Text>현재 폰트 크기: {settings.fontSizeLevel}</Text>
      <Text>큰 글씨 모드: {settings.isLargeTextMode ? 'ON' : 'OFF'}</Text>
      <Text>고대비 모드: {settings.isHighContrastMode ? 'ON' : 'OFF'}</Text>
    </View>
  );
}
```

#### 3. 유틸리티 훅 사용
```typescript
import { useAccessibilityStyles } from '../hooks/useAccessibilityStyles';

function MyComponent() {
  const { getTextSize, getTextColor, getButtonStyle } = useAccessibilityStyles();
  
  return (
    <Text className={getTextColor('text-gray-800', 'text-white')}>
      텍스트
    </Text>
  );
}
```

### 적용된 컴포넌트

- ✅ **RecommendedQuestion**: 추천 질문 카드
- ✅ **StartButton**: 시작하기 버튼
- ✅ **MyPage**: 마이페이지 (설정 화면)

### 추가 적용이 필요한 컴포넌트

다음 컴포넌트들에도 접근성 기능을 적용할 수 있습니다:

- Home 화면
- Album 화면
- Login 화면
- Conversation 화면
- Chat 화면
- DiaryResult 화면

### CSS 클래스

#### 큰 글씨 모드용 Tailwind 클래스
```css
/* 폰트 크기 */
text-xs-large    /* 15.6px */
text-sm-large    /* 18.2px */
text-base-large  /* 20.8px */
text-lg-large    /* 23.4px */
text-xl-large    /* 26px */
text-2xl-large   /* 31.2px */

/* 여백 */
p-1-large        /* 4.8px */
p-2-large        /* 9.6px */
p-4-large        /* 19.2px */
m-4-large        /* 19.2px */
```

#### CSS 클래스
```css
.large-text-mode     /* 큰 글씨 모드 전체 적용 */
.high-contrast-mode  /* 고대비 모드 전체 적용 */
```

### 접근성 가이드라인 준수

이 구현은 다음 접근성 가이드라인을 준수합니다:

- **WCAG 2.1 AA**: 색상 대비 4.5:1 이상
- **WCAG 2.1 AA**: 텍스트 크기 200% 확대 지원
- **WCAG 2.1 AA**: 사용자 설정 존중

### 향후 개선 사항

1. **음성 안내**: 스크린 리더 지원
2. **키보드 네비게이션**: 키보드만으로 모든 기능 접근
3. **애니메이션 제어**: 모션 감소 옵션
4. **색상 테마**: 다양한 색상 테마 옵션
5. **폰트 크기 슬라이더**: 세밀한 크기 조절

### 문제 해결

#### 설정이 저장되지 않는 경우
- AsyncStorage 권한 확인
- 디바이스 저장 공간 확인

#### 스타일이 적용되지 않는 경우
- Tailwind CSS 빌드 확인
- 컴포넌트에서 useAccessibility 훅 사용 확인
- CSS 클래스명 오타 확인

### 개발자 노트

새로운 컴포넌트를 만들 때는 항상 접근성 기능을 고려하여 개발하세요:

```typescript
// 좋은 예
const { settings } = useAccessibility();
<Text className={`text-base ${settings.isLargeTextMode ? 'text-lg' : ''}`}>

// 나쁜 예
<Text className="text-base">
```

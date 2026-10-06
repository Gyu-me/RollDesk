# Domain

- **Scenario**: 하나의 전체 TRPG 시나리오.
- **ScriptLine**: 시나리오를 구성하는 개별 스크립트 줄.
- **Tag**: 지문, 대사, 조사, 판정 등 ScriptLine의 출력 역할.
- **MacroTemplate**: 반복해서 적용할 수 있는 매크로 템플릿.
- **UserMacro**: 사용자가 저장한 매크로.
- **Branch**: 시나리오 진행이 갈라지는 분기.
- **Route**: Branch 내부의 개별 진행 경로.
- **Transformer**: 플랫폼 독립적인 데이터를 Roll20, CCFOLIA 등의 출력 형식으로 변환하는 계층.

`ScriptLine` 모델은 특정 플랫폼 문자열에 종속시키지 않는다. 플랫폼별 출력은 `Transformer`를 통해 생성한다.

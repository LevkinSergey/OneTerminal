# OneTerminal — agent guide

## What this is

Веб-терминал (xterm.js) в поле HTML документа 1С:Предприятие. 1С управляет терминалом через `window.appTo1C`, терминал шлёт события через `document.dispatchEvent(new CustomEvent(...))`.

**Это только frontend (представление терминала). Бекенда в проекте нет.**

## Entrypoint & architecture

- `src/index.ts` — entry (core-js → polyfills → app → appTo1C). **Не трогать порядок импортов.**
- `src/app/one-terminal.ts` — создаёт `window.terminal`, вешает resize/fit, запускает fake terminal.
- `src/app/OneTerminal.ts` — класс `OneTerminal` (управление xterm, input buffer, command history, cursor, key handling).
- `src/appFor1C/app-to-1c.ts` — объект `window.appTo1C` (методы: `init`, `setBaseUrl`, `close`, `endOperation`, `setInput`, `insertText`, `clearInput`).
- `src/appFor1C/eventDispatcherTo1C.ts` — `emitEventTo1C(name, data, event?)` — диспатч CustomEvent. **Не используется.**
- `src/appFor1C/eventNamesTo1C.ts` — константа `ACE_EVENT_CONTENT_CHANGED`. **Не используется.**

## Commands

| command                 | what                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `npm start`             | dev-server на **порту 8084**, HMR                                                         |
| `npm run build`         | clean + webpack (production). Сборка с `cross-env NODE_ENV=production`                    |
| `npm run clean`         | `rimraf dist`                                                                             |
| `npm run format`        | Prettier: `'**/*.{js,css,md,mdx,ts,tsx,yml}'`                                            |
| `npm run format:diff`   | Проверка форматирования (list-different)                                                 |
| `npm run lint`          | ESLint: `'**/*.{js,ts,tsx,md,mdx}'` — max-warnings=0                                      |
| `npm run lint:fix`      | ESLint с флагом `--fix`                                                                   |
| `npm test`              | Jest — **нет тестов и конфига**                                                          |
| `npm run tscheck`       | `tsc` (only type-check, `noEmit: true`)                                                  |
| `npm run tscheck:watch` | `tsc -w`                                                                                  |
| `npm run test:e2e`      | Playwright e2e тесты                                                                      |
| `npm run test:e2e:ui`   | Playwright e2e тесты с UI                                                                 |
| `npm run test:1c`       | Playwright e2e тест `e2e/1c-html.spec.ts` (QUnit tests в HTML)                           |
| `npm run testreport`    | Открыть отчёт Playwright (`playwright show-report`)                                      |

Рекомендуемый порядок: `format → lint → tscheck → build`.

**Тесты** (Playwright):
- `e2e/terminal-init.spec.ts` — инициализация, рендер, фокус, resize
- `e2e/terminal-input.spec.ts` — setInput, insertText, clearInput, write, clear
- `e2e/terminal-history.spec.ts` — command history, navigation (ArrowUp/Down, Home/End), editing (Backspace, Delete)
- `e2e/terminal-1c-bridge.spec.ts` — `window.appTo1C` API (setInput, insertText, clearInput, setBaseUrl, close, endOperation)
- `e2e/1c-html.spec.ts` — интеграция с 1C HTML (QUnit тесты)

## Toolchain quirks

- **Сборка**: Babel 7 + Webpack 5. `tsc` — **только проверка типов**, не сборка.
- **xterm**: версия `^3.14.5` (старая). Импорты: `from 'xterm'`, аддоны — `from 'xterm/lib/addons/fit/fit'`.
- **Babel**: три режима (development/production/test). Плагин `transform-replace-expressions` заменяет `__DEV__` и `process.env.NODE_ENV`.
- **postcssOptions**: в `webpack/webpack.common.js:104` обнаружен **задвоенный** `postcssOptions` — потенциальный баг.
- **`@svgr/webpack`**: используется в webpack конфиге (SVG → React-компоненты), но **не указан** в devDependencies.
- **CopyWebpackPlugin**: подключен в `webpack.common.js`, но **закомментирован** в `plugins`.
- **`babel-core` v6**: есть как зависимость наряду с `@babel/core` v7 — возможно, лишняя.
- **Browserslist**: IE 6+, Safari 5+, Firefox 5+, Chrome 32+ (широкий, но xterm 3.x едва ли тянет IE 6-10).
- **`window.isWebClient`**: объявлен в `src/app-env.d.ts:7`, но нигде не инициализируется.
- **SVG**: обрабатываются через `@svgr/webpack` как React-компоненты (legacy — React в проекте не используется).
- **polyfills**: `src/polyfills.js` (JS) + `src/index.ts:5` (core-js/stable).

## Type-checking & configs

- `tsconfig.json` — type-checking с `noEmit: true` (исключает `**/*.spec.ts`).
- `jsconfig.json` — алиас `@/*` → `./src/*`.
- ESLint: **нет конфига** (дефолтный или глобальный).
- Prettier: `semi: false, singleQuote: true, arrowParens: 'avoid', trailingComma: 'none'`.

## Style

- Prettier: **no semi**, singleQuote, arrowParens: avoid, no trailingComma
- `.editorconfig`: 2 пробела, UTF-8, LF
- ESLint: `--max-warnings=0`; линтит `{js,ts,tsx,md,mdx}` (CSS/SCSS — нет)
- Алиас: `@/*` → `src/*` (настроен в jsconfig.json и tsconfig.json)

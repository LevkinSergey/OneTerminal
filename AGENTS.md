# OneTerminal — agent guide

## What this is

Веб-терминал (xterm.js) в поле HTML документа 1С:Предприятие. 1С управляет терминалом через `window.appTo1C`, терминал шлёт события через `document.dispatchEvent(new CustomEvent(...))`.

**Это только frontend (представление терминала). Бекенда в проекте нет.**

## Entrypoint & architecture

- `src/index.ts` — entry (core-js → polyfills → app → appTo1C). **Не трогать порядок импортов.**
- `src/app/one-terminal.ts` — создаёт `OneTerminal`, вешает resize/fit, запускает fake terminal.
- `src/appFor1C/app-to-1c.ts` — объект `window.appTo1C` (методы: `init`, `setBaseUrl`, `close`, `endOperation`).
- `src/appFor1C/eventDispatcherTo1C.ts` — диспатч CustomEvent. **Пока нигде не вызывается** — требуется интеграция.
- `src/appFor1C/eventNamesTo1C.ts` — константа `ACE_EVENT_CONTENT_CHANGED`. **Не используется.**

## Commands

| command                 | what                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm start`             | dev-server на **порту 8084**, HMR                                                                                |
| `npm run build`         | **Внимание:** использует `&` (параллельно), а не `&&`. clean и webpack запускаются одновременно — вероятно, баг. |
| `npm run clean`         | `rimraf dist`                                                                                                    |
| `npm run format`        | Prettier (no semi, singleQuote, avoid parens, no trailingComma)                                                  |
| `npm run format:diff`   | проверка форматирования                                                                                          |
| `npm run lint`          | ESLint — в репозитории **нет конфига** (дефолтный или глобальный)                                                |
| `npm test`              | Jest — **нет тестов и конфига**                                                                                  |
| `npm run tscheck`       | `tsc` (only type-check, `noEmit: true`)                                                                          |
| `npm run tscheck:watch` | `tsc -w`                                                                                                         |

Рекомендуемый порядок: `format → lint → tscheck → build`.

## Toolchain quirks

- **Сборка**: Babel 7 + Webpack 5. `tsc` — **только проверка типов**, не сборка.
- **xterm**: версия `^3.14.5` (старая). Импорты: `from 'xterm'`, аддоны — `from 'xterm/lib/addons/fit/fit'`.
- **Babel**: три режима (development/production/test). Плагин `transform-replace-expressions` заменяет `__DEV__` и `process.env.NODE_ENV`.
- **postcssOptions**: в `webpack/webpack.common.js` обнаружен **задвоенный** `options.postcssOptions` — может вызывать проблемы.
- **`@svgr/webpack`**: используется в webpack конфиге, но **не указан** в devDependencies.
- **CopyWebpackPlugin**: закомментирован в конфиге, но подключен в package.json.
- **`babel-core` v6**: есть как зависимость наряду с `@babel/core` v7 — возможно, лишняя.
- **Browserslist**: IE 6+, Safari 5+, Chrome 32+ (широкий, но xterm 3.x едва ли тянет IE 6-10).
- **`window.isWebClient`**: объявлен в типах, но нигде не инициализируется.
- **SVG**: обрабатываются через `@svgr/webpack` как React-компоненты (legacy — React в проекте не используется).

## Style

- Prettier: **no semi**, singleQuote, arrowParens: avoid, no trailingComma
- `.editorconfig`: 2 пробела, UTF-8, LF
- ESLint: `--max-warnings=0`; линтит `{js,ts,tsx,md,mdx}` (CSS/SCSS — нет)
- Алиас: `@/*` → `src/*` (настроен в jsconfig.json и tsconfig.json)

# Сессия 2026-08-21 — итоги, находки, план на завтра

## Цель проекта
Автоматизация тест-кейсов на https://conduit.bondaracademy.com/ (Conduit / RealWorld) двумя
способами: **Playwright MCP** (`browser_*` инструменты) и **playwright-cli** (скилл), с
последующим сравнением подходов и расхода токенов.

## Что сделано сегодня
1. Test Case 1 "Create a new article" — ручной проход через Playwright MCP →
   `tests/create-new-article.spec.ts` (прогон: 1 passed).
2. Тот же кейс через playwright-cli по воркфлоу скилла →
   `tests/create-new-article-cli.spec.ts` (прогон: 1 passed, с первого раза).
3. `tests/seed.spec.ts` — теперь навигирует на https://conduit.bondaracademy.com/
   (требование воркфлоу генерации: сценарии стартуют из seed).
4. `prompts.txt` — оба промпта (MCP и CLI) уже сохранены.

## Ключевые находки (критично для завтра)
1. **MCP vs CLI — дело не в снапшотах, а в контексте.**
   Оба инструмента делают ОДИНАКОВЫЙ accessibility-снапшот (это не DOM!): рефы `e1..`
   (CLI, файлы в `.playwright-cli/`) и `f1e..` (MCP, файлы в `.playwright-mcp/`), по ~360 строк /
   ~15 КБ на главной странице у обоих. Разница в том, сколько контента попадает в контекст:
   MCP `browser_snapshot` отдаёт полное дерево инлайн; CLI-воркфлоу использует точечные
   `find` (~13 строк), `snapshot --depth` (~30 строк), `eval`. Тарифицируется только контекст;
   файлы на диске бесплатны до момента чтения.
2. **Жизненный цикл debug-сессии (`--debug=cli`).**
   `playwright-cli resume` доводит seed до конца — раннер закрывает браузер и сессия `tw-XXXX`
   умирает. Рабочий приём: **`step-over`** — выполняет `page.goto` и оставляет тест
   приостановленным на «Close context»: браузер жив, страница в нужном состоянии → можно
   интерактивно ходить по шагам сценария.
3. **Sandbox (важно!).** `playwright test` (раннер форкает воркеры с piped stdio → EPERM) и
   `playwright-cli` (демон пишет в `%LocalAppData%\ms-playwright\daemon` → EPERM) требуют
   `danger-full-access`; эскалация разовая на команду (подтверждает пользователь).
4. **CLI сам генерирует `.first()`** там, где локаторов несколько (Delete Article встречается ×2).
   Иконки Font Awesome в именах (например « New Article») лучше заменять на regex-имя — это
   часть «хила».
5. **Минимальный промпт CLI-генерации (~10 строк):** упомянуть «using the playwright-cli skill» +
   «Do not use MCP browser tools» + целевой файл + не перезаписывать эталон. Всё остальное
   агент берёт из скилла и живого приложения.
6. **Ассерты в обоих тестах эквивалентны:** URL `/login` и `/editor`, `.navbar` содержит `pwtest`,
   URL `/article/...`, Edit/Delete `.first()` visible, блок комментариев («Write a comment...» +
   «Post Comment»), вкладка Global Feed активна (фильтр `hasText`, т.к. `.nav-link.active`
   совпадает с 2 элементами), первая `.article-preview` = созданная статья, после удаления
   `heading` count 0. Описание статьи на странице деталей НЕ показывается — ассертить body.

## План на завтра: универсальный воркфлоу planner-generator-healer
Дока скилла: `C:\Users\vital\.dsh\skills\playwright-cli\references\test-generation.md`
1. **Planner** — `specs/<feature>.plan.md`: сценарии (для conduit: логин, CRUD статьи,
   комментарии), каждый со структурой Seed / шаги / `- expect:`.
2. **Generator** — на каждый сценарий: `PLAYWRIGHT_HTML_OPEN=never npx playwright test
   tests/seed.spec.ts --debug=cli` (фон) → `playwright-cli attach tw-XXXX` → `step-over` →
   проход шагов (`find`/`fill`/`click`) → сборка блоков «Ran Playwright code» →
   `tests/<scenario>.spec.ts`.
3. **Healer** — прогон всех тестов, починка падений по одному (debug + attach), сверка со spec.
4. **Контрольный замер** расхода токенов MCP vs CLI на одинаковом сценарии.

## Файлы проекта
- `tests/create-new-article.spec.ts` — эталон, создан через MCP
- `tests/create-new-article-cli.spec.ts` — создан через playwright-cli
- `tests/seed.spec.ts` — seed для воркфлоу генерации
- `specs/README.md` — папка для plan-спецификаций
- `prompts.txt` — промпты MCP и CLI
- `SESSION-NOTES.md` — этот файл

## Полезные команды
- Запуск CLI-сессии: `playwright-cli open <url>` (нужен полный доступ)
- Снапшот/поиск: `playwright-cli snapshot --depth=4`, `playwright-cli find "text"`
- Генерация локатора: `playwright-cli generate-locator e5`
- Закрыть всё: `playwright-cli close-all`

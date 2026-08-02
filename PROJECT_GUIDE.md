# Foundry: полное описание проекта для нейросети

> Актуально для текущего состояния репозитория. Этот документ описывает фактически реализованное поведение, а не только продуктовый замысел. Его можно передать нейросети как вводный контекст перед разработкой, отладкой или изменением интерфейса.

## 1. Кратко о продукте

**Foundry** — MVP-воркспейс для подготовки YouTube-видео. Он ведёт один ролик через последовательный производственный процесс:

```text
Research
  -> Script
  -> Storyboard
  -> Producing (scenes, assets)
  -> Export
```

Пользователь собирает источники и заметки, пишет текст дикторской начитки (или получает его от LLM по теме), превращает текст в сцены, редактирует каждую сцену, генерирует или загружает медиа и экспортирует результат — текстовые документы либо таймлайн для монтажки (FCPXML/EDL).

Это не видеомонтажная программа. Текущий MVP организует сценарий, сцены, промпты и ассеты и отдаёт таймлайн в реальный редактор (DaVinci Resolve, Premiere, Final Cut), но не рендерит готовый MP4.

## 2. Что уже умеет проект

- Создавать и показывать проекты в библиотеке со статусом, прогрессом, числом сцен, слов и расчётной длительностью.
- Ведение проекта по четырём этапам в полноэкранном редакторе: Research, Script, Storyboard, Producing.
- Research: список источников (title/url/note) и свободные заметки с автосохранением.
- Script: полноширинный редактор начитки с автосохранением через 1,2 секунды, счётчиком слов и длительности; кнопка `Split into scenes` (Gemini или локальный fallback) с подтверждением замены; копирование промпта для внешней нейросети.
- Два режима раскадровки: разбить уже написанный скрипт или написать скрипт с нуля по теме (топик + бриф + целевая длина + язык) и сразу разрезать на сцены.
- Импорт раскадровки из JSON, полученного от внешней нейросети; импорт умеет подставлять `projectTitle` и сохранять `fullScript` в Script.
- Storyboard: список сцен с drag-and-drop перестановкой, inline-переименованием, удалением, дублированием и разбивкой из скрипта.
- Producing: канвас с key-art сцены (переключение кадр/клип), редактирование voiceover прямо на холсте, панель промптов на канвасе, таймлайн с зумом, дорожкой музыки и черновым preview-проигрыванием.
- Редактировать voiceover, image prompt и video prompt сцены с debounce и общей историей Ctrl+Z; переписывать промпты из текущей начитки (`Prompts from voiceover`).
- Запускать генерацию изображения, клипа, голоса или музыки для сцены; загружать собственные файлы (в том числе перетаскиванием прямо на сцену таймлайна).
- Базовый музыкальный трек проекта: один на весь ролик, сцена может перебить его своим override.
- Показывать статус каждого ассета, опрашивать API до завершения генерации, выбирать активный вариант каждого типа.
- Измерять реальную длительность загруженных аудио/видео через ffprobe; длительность сцены берётся из голосового файла, а не из счётчика слов.
- Панель готовности (Readiness): список пробелов до экспорта, сгруппированный по типу, и пакетная догенерация недостающего.
- Экспорт в Markdown, TXT, JSON, CSV, SRT, Prompts, а также FCPXML и EDL — таймлайн для монтажки с абсолютными путями к файлам и музыкальной дорожкой.
- Тёмная/светлая тема (хранится в localStorage).

## 3. Основной пользовательский сценарий

1. Пользователь открывает `/` и видит библиотеку проектов.
2. Нажимает `New project`, вводит рабочее название (или `Start a project` в пустой библиотеке).
3. Нажимает карточку проекта и попадает в `/projects/{id}/editor`.
4. Пустой проект автоматически открывается на этапе Script.
5. Этап Research: добавляет источники и заметки, затем переходит к Script.
6. Этап Script: пишет текст начитки и ждёт автосохранения; либо, если текста ещё нет, открывает импорт-диалог и в режиме `from-topic` копирует промпт, по которому модель пишет сценарий по теме.
7. Разбивает скрипт на сцены (`Split into scenes`) или импортирует JSON-раскадровку из внешнего чата.
8. Этап Storyboard: правит состав и порядок сцен (drag-and-drop, rename, delete, duplicate).
9. Этап Producing: выбирает сцену на таймлайне, редактирует voiceover и промпты (в инспекторе или на канвасе), генерирует/загружает ассеты, выбирает активные варианты, задаёт музыку проекта.
10. Нажимает бейдж готовности в шапке, смотрит пробелы, при необходимости заполняет их пакетно.
11. Нажимает `Export` и скачивает документ или таймлайн (FCPXML/EDL) для монтажки.

## 4. Маршруты сайта

### `/` — Project Library

Главная страница и библиотека всех проектов текущего пользователя. Показывает заголовок `Library`, пояснение, кнопку создания проекта, сетку карточек (обложка/placeholder, название, дата изменения, число сцен, слов, длительность, статус, прогресс), skeleton при загрузке, пустое состояние, сообщение о недоступном API.

Карточка кликабельна целиком и ведёт в `/projects/{id}`.

### `/projects/{id}` — технический redirect

Не имеет собственного интерфейса. Перенаправляет на `/projects/{id}/editor`.

### `/projects/{id}/editor` — основной редактор

Композиция (`apps/web/src/app/projects/[id]/editor/page.tsx`):

- `EditorChrome` — верхняя панель: назад в библиотеку, название, статус, степпер пайплайна (Research → Script → Storyboard → Producing + кнопки Readiness/Import/Export) и переключатель темы;
- `LeftRail` — левая навигация: Library, Script, Assets;
- `EditorWorkspace` — переключатель этапов; смонтирован ровно один вид: `ResearchView`, `ScriptView`, `StoryboardListView` или `ProducingView` (этап — это ВИД, а не оверлей);
- модальные окна: `ImportStoryboardDialog`, `ReadinessPanel`, `ExportPanel`.

При загрузке показывается пульсирующий круг, при ошибке — `Project not found` и `Back to library`.

## 5. Карта кнопок и элементов управления

### 5.1. Библиотека проектов

- `New project` — inline-форма с полем `Working title for the video...`; `Create` создаёт проект (Enter = то же действие), `Cancel` закрывает.
- `Start a project` — только в пустой библиотеке; создаёт `Untitled project`.
- `Library` (в шапке редактора) — возврат на `/`.
- Кнопок переименования и удаления проекта в UI нет (API их поддерживает).

### 5.2. Верхняя панель редактора (EditorChrome)

- Назад/`Library` — возврат на `/`.
- Название проекта и человекочитаемый статус: `Draft`, `Research`, `Script`, `Storyboard`, `Producing`, `Ready`.
- `PipelineStepper` — статичная панель по центру шапки (не плавающая): этапы Research/Script/Storyboard/Producing и справа через разделитель кнопки: готовность (бейдж с числом пробелов), импорт раскадровки, экспорт.
- Переключатель темы (светлая/тёмная), состояние в localStorage.

### 5.3. Левая панель (LeftRail)

- `Library` — возврат в библиотеку.
- `Script` — переключает этап на Script.
- `Assets` — переключает на Producing с инструментом `frames` (открывает инспектор сцены, фильтр Visuals); повторный клик закрывает.

### 5.4. Этап Research (ResearchView)

- Список источников: поля `Title` (обязательно для сохранения), `URL`, `Note`; кнопки открыть ссылку и удалить.
- `Add source` — новая строка; источник без заголовка остаётся черновиком в UI, но на сервер не уходит.
- Поле `Notes` — свободный текст.
- Автосохранение через 1,2 секунды после изменения (то же, что в Script).
- `Write the script` — переход к этапу Script.

### 5.5. Этап Script (ScriptView)

- Полноширинное текстовое поле с автозапуском сохранения через 1200 мс; шапка показывает число слов, длительность и `Saving…`/`Saved`. Пустая строка допустима.
- `Copy storyboard prompt` — виден при непустом сценарии; копирует промпт для внешней модели (режим `from-script`), на две секунды меняет подпись на `Copied!`.
- `Split into scenes` — отправляет сценарий на backend; при существующих сценах первый клик предупреждает (`Replaces N scenes and their assets`), второй (`Split anyway`) выполняет. Несохранённый текст перед нарезкой дописывается на сервер.
- Несохранённые правки уходят на сервер при уходе со степа (размонтирование вида не теряет текст).
- Пустой проект открывается именно на этом этапе.

### 5.6. Диалог Import storyboard

Два режима, которые определяются состоянием проекта, а не выбором пользователя:

- `from-script` — Script заполнен: модель обязана разложить именно его (`buildStoryboardPrompt`). VoiceText копируется дословно и не переводится.
- `from-topic` — Script пуст: модель пишет сценарий по теме (`buildScriptFromTopicPrompt`). Показываются поля: Topic (название проекта, редактируется через бриф — до 600 символов), пресеты Length (Short 1–1.5 min / Standard 2.5–3 min / Long 5–6 min) и требование, что название или бриф обязательны.

Общее:

- `Language` — выпадающий список (ru/en/uk/es/de/fr); по умолчанию язык уже написанного текста (по письменности, `detectScriptLanguage`), ручной выбор перебивает его. Инструкции промпта остаются английскими, меняется только язык контента. В режиме `from-script` предупреждение: язык начитки не переводится.
- `Copy prompt` — копирует промпт (сначала сохраняет черновик брифа).
- Поле JSON — принимает ответ модели; разбор на backend, ошибки отображаются под полем.
- `Import scenes` — импортирует раскадровку с полной заменой существующих сцен; предупреждение о замене показывается при `sceneCount > 0` (счётчик передаётся корректно).
- `Cancel` — закрывает диалог.

### 5.7. Этап Storyboard (StoryboardListView)

Список сцен: номер, название, ReadinessBadge, длительность (с `~`, если оценка по тексту), кнопки Rename и удалить.

- Drag-and-drop перестановка (за иконку), порядок сохраняется через API.
- Двойной клик или `Rename` — inline-редактирование названия (Enter сохраняет, Escape отменяет).
- Клик по сцене открывает её в Producing.
- `Split from script` — разбивка скрипта; отключена без скрипта.
- `Add scene` — создаёт `New scene` с пустым voiceover в конце.
- Импорт/экспорт доступны из шапки.

### 5.8. Этап Producing

#### Канвас (Stage)

- Левая треть: voiceover редактируется прямо на холсте (общий с инспектором источник данных и debounce); ниже — плееры голоса сцены и музыки (своя или проектная).
- Центр: key-art активной сцены — явно выбранный кадр/клип (`activeFrameId`/`activeVideoId`), а не «последний сгенерированный». Если есть и кадр, и клип — переключатель Frame/Clip; по умолчанию клип.
- `Show prompts` — оверлей с image/video промптами, редактируются прямо на канвасе.
- Видео и аудио рендерятся настоящими `<video>`/`<audio>`-плеерами.

#### Таймлайн (Timeline)

- Линейка времени, метки в зависимости от длины ролика, общая длительность закреплена справа.
- Зум: `Ctrl+колесо` и кнопки −/+/Reset (px per second, default 40).
- Автопрокрутка к выбранной сцене.
- Карточка сцены: миниатюра (кадр предпочтительнее клипа), номер и длительность поверх кадра, статус-точка, предупреждение о рассинхроне длительностей, ReadinessBadge.
- Клик выбирает/снимает сцену; drag-and-drop перестановка.
- Drop файла прямо на карточку — загрузка ассета (тип по расширению); недопустимый файл показывает `Unsupported file`.
- `MusicLane` — дорожка под сценами: базовый трек проекта сплошной полосой, сцены с override перекрывают его на своём отрезке.
- `MusicBar` — управление базовым треком: промпт + `Generate`, `Upload`, удаление, предупреждение `X without music`, если трек короче ролика (кладётся один раз, не зацикливается), список `Other takes` для перевыбора.
- `PreviewPlayer` — черновое preview-проигрывание всего ролика (картинки, клипы, голос, музыка по сценам).

#### Инспектор (InspectorPanel)

- Название сцены (клик — inline rename), номер `Scene 01`, длительность с источником (`~` для оценки), кнопки: дублировать сцену, удалить, закрыть.
- `Voiceover`, `Image prompt`, `Video prompt` — живые поля с debounce 400 мс и общей (модульной) историей Ctrl+Z; одно поле, отредактированное на канвасе, сразу видно в инспекторе и наоборот.
- `Prompts from voiceover` — переписывает оба промпта из текущей начитки (Gemini или локальный fallback).
- Вкладки `Generate` / `Upload`; три слота: Frame (IMAGE), Clip (VIDEO), Voice (VOICE). Во время генерации кнопки disabled и показывают `Generating…`.
- `SceneMusicOverride` — секция «Music (optional)»: сцена играет свой трек вместо проектного; `Override for this scene` (upload) и `Back to project music` (снимает override).
- Список ассетов с фильтром `Visuals` / `Audio`; активный ассет каждого типа подсвечен, у каждого — preview, статус, durationSec и расхождение со сценой, удаление; незавершённые опрашиваются каждые 3 секунды.
- `Alt+←`/`Alt+→` — переход к соседней сцене.

### 5.9. Панель готовности (ReadinessPanel)

- Открывается кнопкой с бейджем в степпере.
- Пробелы `projectGaps` группируются по типу: `No frame chosen`, `No clip chosen`, `No voiceover audio`, `Image prompt is empty`, `Video prompt is empty`, `Voiceover text is empty`, `Voice is shorter than the scene`. Считаются по активным ассетам. Клик по пробелу открывает сцену в Producing.
- Строка проекта: `Project music: …` или `No music on this project` — музыка ничего не блокирует (optional).
- `Fill the gaps` — пакетная догенерация по типам (Frames / Clips / Voice / Everything); в очередь идут только типы без активного ассета; результат: `Queued N · skipped M without a prompt`.

### 5.10. Экспорт (ExportPanel)

Окно закрывается кликом по фону; каждая строка — кнопка, сразу формирует и скачивает файл; во время экспорта всё отключено.

Две группы:

- **Timeline** (для монтажки; медиа указываются абсолютными путями на этой машине):
  - `FCPXML` (`.fcpxml`) — FCPXML 1.9, 1080p30, импортируется в DaVinci Resolve / Premiere / Final Cut; кадры как ресурсы (still-картинки без frameDuration), пустые сцены — `<gap>`, голос — дорожка `dialogue`, музыка — дорожка `music`;
  - `EDL` (`.edl`) — CMX3600: только склейки, видеодорожка V, музыка отдельными событиями A, имена файлов в комментариях.
- **Document**:
  - `Markdown` (`.md`) — скрипт + breakdown сцен;
  - `Plain text` (`.txt`) — narration (по сценам, если они есть, иначе скрипт);
  - `JSON` (`.json`) — полный payload проекта;
  - `CSV` (`.csv`) — таблица сцен;
  - `SRT` (`.srt`) — субтитры по сценам;
  - `Prompts` (`.txt`) — image+video промпты по сценам для пакетной генерации вовне.

Сгенерированные заглушки (data URL) файлами не являются — в таймлайн-экспортах они пропускаются (сцена с пустым видео становится `<gap>`), в EDL — `BLACK`.

## 6. Сущности и связи данных

```text
Project 1 --- 0..1 Research
Project 1 --- 0..1 Script
Project 1 --- many Scene
Project 1 --- many Asset   (базовая музыка)
Scene   1 --- many Asset   (ассеты сцены)
```

Ассет принадлежит либо сцене, либо проекту — ровно одному из двух (`sceneId` XOR `projectId`).

### Project

- `id`: cuid; `userId`: владелец; `title`; `brief` — пара фраз о замысле ролика (нужен внешней модели, когда сценария ещё нет); `coverUrl`; `status`: этап pipeline; `activeMusicId` — выбранный базовый трек; `createdAt`, `updatedAt`.

### Research

- одна запись на проект; `sources`: JSON-массив `{ title, url, note }` (битые записи отбрасываются при чтении); `notes`.

### Script

- одна запись на проект; `content`; `wordCount`, `estSeconds` — считает backend; `updatedAt`.

### Scene

- `order`; `title`; `voiceText`; `imagePrompt`, `videoPrompt` (nullable); `durationSec` (Float, nullable — оценка по тексту или длина выбранного голосового файла); `status`; `activeFrameId`, `activeVideoId`, `activeVoiceId`, `activeMusicId` — выбранный активный ассет каждого типа.

### Asset

- `sceneId` XOR `projectId`; `type`: IMAGE/VIDEO/VOICE/MUSIC; `provider`: `gemini`/`upload`; `prompt`; `status`; `url`: data URL, placeholder URL или `/api/uploads/{filename}`; `durationSec` — реальная длина файла (ffprobe), для картинок null; `errorMsg`; `createdAt`.

Удаление Project каскадно удаляет Research, Script, Scenes и Assets; удаление Scene — её Assets.

## 7. Статусы и производственный pipeline

Статус проекта:

```text
DRAFT -> RESEARCH -> SCRIPTING -> STORYBOARDING -> PRODUCING -> READY
```

- Новый проект — `DRAFT`; сохранение research → `RESEARCH`; сохранение script → `SCRIPTING`; создание/split/import сцен → `STORYBOARDING`; запуск генерации (в т.ч. пакетной) → `PRODUCING`.
- `ProjectsService.advanceStatus` продвигает статус монотонно и не откатывает назад.
- `READY` сейчас нигде автоматически не выставляется (логика завершения ассетов помечает сцены, не проект).

Статус сцены: `PENDING` → `GENERATING` → `READY`/`FAILED`. Сцена становится `READY`, только когда не осталось незавершённых ассетов; при наличии FAILED — `FAILED`.

Статус ассета: `QUEUED -> GENERATING -> READY | FAILED`.

## 8. Как работает backend

API — один NestJS-сервис с глобальным префиксом `/api`.

### Persistence

- Prisma 6, PostgreSQL. `PrismaService` — общая граница доступа к данным.
- Все project-scoped операции проверяют ownership через `ProjectsService.assertOwned`; для сцен — через их проект.

### Очередь ассетов

- BullMQ/Redis, имя очереди в `assets.queue.ts`, worker внутри того же процесса (concurrency 2).
- После создания ассет `QUEUED`, worker переводит в `GENERATING`, затем `READY` (с url) или `FAILED` (с errorMsg).
- Музыка проекта обрабатывается тем же worker'ом, но не трогает статус сцены (sceneId null).

### Генерация

- Разбиение скрипта и генерация промптов (`promptsFor`): Gemini `gemini-2.5-flash` с ключом `GEMINI_API_KEY`, иначе детерминированный локальный fallback (абзац = сцена; промпты из первой фразы).
- IMAGE-генерация: Gemini `gemini-2.5-flash-image`, результат — base64 data URL в БД; без ключа/при ошибке — локальный placeholder.
- VIDEO, VOICE, MUSIC: провайдеры не подключены, worker всегда возвращает placeholder после задержки 1,2 с.
- `GenerateMissing` — пакетная догенерация: для каждой сцены только типы без активного ассета и без незавершённых.

### Длительности

- Загруженные файлы меряются ffprobe при загрузке (`probeDurationSec`); старые файлы домериваются фоном при чтении сцен (`backfillDurations`).
- `durationSec` сцены: при загрузке VOICE пересчитывается вверх от длины файла (min 3 c); при PATCH с voiceText — оценка по тексту с пунктуацией (`estimateSpeechSeconds`: слова по 150 слов/мин + паузы 0,45 с на предложение и 0,2 с на запятую/тире).
- Единый источник длительности сцены — helper `sceneDuration()`: измеренный голос, иначе оценка по тексту (min 3 c).

### Загрузка файлов

- Multer пишет в `uploads` относительно рабочей директории API; имя — timestamp + очищенное имя; лимит 100 MB; расширения проверяются по типу ассета.
- Статика раздаётся по `/api/uploads/`; `apps/web/next.config.ts` проксирует `/api/:path*` на API.

### Экспорт таймлайна

- `toClips` строит куски из сцен: видео = активный VIDEO (или IMAGE), аудио = активный VOICE; абсолютные пути на диске.
- `toMusicSegments`: базовый трек проекта от нуля на свою длину (не зацикливается), сцены с override вырезают свои отрезки.
- FCPXML 1.9 (1080p30, рациональные длительности, still-изображения без frameDuration, дорожки dialogue/music) и EDL CMX3600 (V-события, A-события для музыки).

## 9. REST API

Все пути имеют префикс `/api`. Zod-схемы контракта — в `packages/shared-types`.

### Projects

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/projects` | Создать проект |
| `GET` | `/projects` | Список проектов пользователя с агрегатами |
| `GET` | `/projects/{id}` | Проект с research, script, scenes (с assets) и project assets |
| `PATCH` | `/projects/{id}` | Обновить `title`, `brief`, `coverUrl`, `status` |
| `DELETE` | `/projects/{id}` | Удалить каскадно |

### Research

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/projects/{projectId}/research` | Research или пустой default |
| `PUT` | `/projects/{projectId}/research` | Сохранить `{ sources, notes }` |

### Script

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/projects/{projectId}/script` | Script или пустой default |
| `PUT` | `/projects/{projectId}/script` | Сохранить и пересчитать метрики |
| `POST` | `/projects/{projectId}/script/split-into-scenes` | Пересобрать сцены из script (полная замена) |

### Scenes

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/projects/{projectId}/scenes` | Сцены по порядку с assets |
| `POST` | `/projects/{projectId}/scenes` | Создать сцену |
| `POST` | `/projects/{projectId}/scenes/import` | Импорт JSON-раскадровки (полная замена; сохраняет projectTitle/fullScript) |
| `POST` | `/scenes/reorder` | Переупорядочить `{ items: [{ sceneId, newOrder }] }` |
| `POST` | `/scenes/{id}/prompts` | Переписать image/video промпты из voiceText |
| `POST` | `/scenes/{id}/duplicate` | Дублировать сцену (текст и промпты, без ассетов) |
| `PATCH` | `/scenes/{id}` | Обновить поля сцены (voiceText пересчитывает durationSec) |
| `PATCH` | `/scenes/{id}/active-asset` | Выбрать активный ассет типа (`assetId: null` снимает выбор) |
| `DELETE` | `/scenes/{id}` | Удалить сцену |

### Assets

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/scenes/{sceneId}/assets` | Создать ассет и поставить в очередь (новый сразу активный) |
| `POST` | `/scenes/{sceneId}/assets/upload` | Загрузить готовый файл (`type` + multipart `file`) |
| `GET` | `/assets/{id}` | Получить ассет (используется для polling) |
| `DELETE` | `/assets/{id}` | Удалить; если был активным — выбрать другой READY-вариант |

### Music (проект)

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/projects/{projectId}/music` | `{ activeMusicId, assets }` |
| `POST` | `/projects/{projectId}/music` | Сгенерировать базовый трек (`prompt` обязателен; сразу активный) |
| `POST` | `/projects/{projectId}/music/upload` | Загрузить готовый трек |
| `PATCH` | `/projects/{projectId}/music` | Выбрать трек (`assetId: null` снимает музыку) |
| `POST` | `/projects/{projectId}/assets/generate-missing` | Пакетно догенерировать `{ types }` по всем сценам |

### Export

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/projects/{projectId}/export` | `{ format }` → `{ filename, mime, content }` |

Форматы: `md`, `txt`, `json`, `csv`, `srt`, `prompts`, `fcpxml`, `edl`.

## 10. Авторизация и ownership

Весь REST API защищён `AuthGuard`.

- Без `CLERK_SECRET_KEY` — dev-режим: userId из заголовка `x-user-id`, иначе `dev-user`.
- С ключом — guard требует `x-user-id`; верификация Clerk bearer token ещё не реализована (TODO в `auth.guard.ts`).
- Сервисы проверяют ownership проекта перед чтением/изменением project-scoped данных.
- Frontend не отправляет auth-заголовок и рассчитывает на dev-режим.

## 11. Frontend-архитектура

- Next.js 15 App Router, React 19.
- TanStack Query — server state; канонический ключ списка сцен `sceneKeys.list`; сцены читаются одним кешем и на канвасе, и в инспекторе, и на таймлайне.
- `EditorProvider` — только локальный UI-state: `step` (этап), `tool` (фокус инспектора), `selectedSceneId`, `timelineZoom`, `theme`.
- `useSceneField` — общий для канваса и инспектора механизм текстовых полей сцены: живой оптимистичный ввод в кеш, debounce 400 мс, модульная история Ctrl+Z (глубина 50), дописывание несохранённого при размонтировании.
- Framer Motion — анимации; Tailwind — только проектные токены; Fraunces — display, Inter — UI.
- Dialog'и перетаскиваются за шапку (позиция в состоянии компонента).

Основные директории:

```text
apps/web/src/app                           маршруты Next.js
apps/web/src/components/library            библиотека проектов
apps/web/src/components/editor             редактор (4 вида этапов, chrome, rail)
apps/web/src/components/scenes             preview, медиа-плееры, импорт раскадровки
apps/web/src/components/export             окно экспорта
apps/web/src/lib/queries                   TanStack Query hooks (projects/script/research/scenes/music)
apps/web/src/lib/editor-store.tsx          локальное состояние редактора
apps/web/src/lib/use-scene-field.ts        живые поля сцены (debounce + undo)
```

## 12. Backend-архитектура

```text
apps/api/src/projects     CRUD проектов, ownership, pipeline status
apps/api/src/research     источники и заметки
apps/api/src/scripts      script, метрики, split into scenes
apps/api/src/scenes       CRUD, import, reorder, duplicate, active-asset, prompts
apps/api/src/assets       upload, queue, worker, placeholders, project music, generate-missing
apps/api/src/export       документы + FCPXML/EDL таймлайн (timeline.ts)
apps/api/src/llm          Gemini и локальные fallback (split, prompts)
apps/api/src/prisma       доступ к PostgreSQL
apps/api/src/common       auth, user id, Zod validation
apps/api/prisma           schema и migrations
```

Shared contract:

```text
packages/shared-types/src
  enums.ts      статусы, типы, ExportFormat, pipeline helpers
  project.ts    Project, brief, ProjectMusic, shortfall
  research.ts   источники и заметки
  script.ts     слова, оценка длительности (с пунктуацией), форматирование
  storyboard.ts импорт-схемы, промпты из скрипта/темы, языки, пресеты длины
  scene.ts      Scene, активные ассеты, готовность, пробелы (ProjectGap), музыка
  asset.ts      Asset, Create/GenerateMissing схемы
  export.ts     ExportFormat спецификации
```

Zod-схемы и inferred types — канонический контракт между web и API. Cross-boundary изменение сначала вносится в `packages/shared-types`, затем синхронизируются Prisma, API и web.

## 13. Технологический стек

- Node.js 20+, pnpm 11, Turborepo, TypeScript strict.
- Web: Next.js 15, React 19, TanStack Query, Tailwind CSS 3, Framer Motion.
- API: NestJS 11, Prisma 6/PostgreSQL 16, BullMQ 5/Redis 7, Zod 3.
- Тесты: Vitest 4 (V8 coverage), GitHub Actions на PR/push в main.

Локально: web `:3000`, API `:4000/api`, PostgreSQL `:5432`, Redis `:6379`.

## 14. Основные переменные окружения

- `DATABASE_URL`, `REDIS_URL` (или `REDIS_HOST`/`REDIS_PORT`), `PORT` (default 4000), `WEB_ORIGIN` (default `http://localhost:3000`).
- `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).
- `GEMINI_API_KEY` — опционально: split, промпты, генерация изображений.
- `CLERK_SECRET_KEY` — переключает auth guard из dev-режима (верификация ещё не реализована).

## 15. Команды разработки

```bash
pnpm install
pnpm db:up
pnpm --filter @foundry/shared-types build
pnpm db:migrate
pnpm dev
```

Проверки: `pnpm test`, `pnpm typecheck`, `pnpm build`. После изменения исходников обновлять knowledge graph: `graphify update .`

## 16. Важные ограничения и незавершённые части

1. Проект не собирает и не экспортирует готовый MP4; FCPXML/EDL — это передача таймлайна в монтажку.
2. Реальная генерация — только IMAGE через Gemini. VIDEO/VOICE/MUSIC возвращают placeholders.
3. Таймлайн-экспорты ссылаются на локальные абсолютные пути в `uploads`; сгенерированные data-URL заглушки в них не попадают. При переносе на другую машину файлы нужно брать с собой.
4. Базовый трек в экспорте кладётся один раз и не зацикливается — короткий трек оставляет тишину в хвосте (о ней предупреждает UI и Readiness).
5. Clerk token verification не реализована.
6. Загруженные файлы лежат на локальном диске (без S3); удаление записи Asset не удаляет физический файл.
7. Сгенерированные изображения хранятся как base64 data URL в PostgreSQL — приемлемо для MVP, плохо масштабируется.
8. `READY` проекту автоматически не выставляется — статусы завершения живут на уровне сцен.
9. Ошибки некоторых mutations не имеют отдельного видимого UI-сообщения.
10. Локальная директория upload зависит от рабочей директории процесса API.

## 17. Правила для нейросети, которая будет менять проект

- Не считать этот документ продуктовым планом: сначала сверять конкретную реализацию с кодом.
- Сохранять простую MVP-архитектуру: один NestJS API и worker внутри API, без микросервисов, CQRS и GraphQL.
- Перед изменением API payload менять Zod contract в `packages/shared-types`, затем собирать его и синхронизировать Prisma/API/web.
- Всегда проверять ownership для project-scoped операций (`ProjectsService.assertOwned`).
- Продвигать pipeline status через `ProjectsService.advanceStatus`, не выставлять статусы вручную.
- Длительность сцены считает backend: при voiceText — `estimateSpeechSeconds`; при загрузке VOICE — от файла; не дублировать логику на фронте, использовать `sceneDuration()`.
- Server state — TanStack Query; после mutations инвалидировать сценные/проектные кеши; текст сцен живёт в одном кеше списка сцен.
- `EditorProvider` хранит только UI-state (step/tool/selectedSceneId/zoom/theme), данные — в React Query.
- Текстовые поля сцены редактировать через `useSceneField` (debounce + undo), не писать свои таймеры.
- Соблюдать strict TypeScript, двойные кавычки, точки с запятой; использовать Tailwind-токены и редакционный workbench-язык дизайна.
- Перед завершением задачи запускать test, typecheck и build; после изменения исходников — `graphify update .`.

## 18. Ключевые файлы для быстрого входа

- `README.md` — запуск и краткая архитектура.
- `apps/web/src/app/page.tsx` — библиотека проектов.
- `apps/web/src/app/projects/[id]/editor/page.tsx` — композиция редактора.
- `apps/web/src/components/editor/editor-workspace.tsx` — переключатель этапов.
- `apps/web/src/components/editor/producing-view.tsx`, `stage.tsx`, `timeline.tsx` — этап Producing.
- `apps/web/src/components/editor/inspector-panel.tsx` — сцены, промпты, generate/upload, музыка сцены.
- `apps/web/src/components/editor/script-view.tsx`, `storyboard-list-view.tsx`, `research-view.tsx` — остальные этапы.
- `apps/web/src/components/editor/readiness-panel.tsx`, `music-track.tsx` — готовность и музыка проекта.
- `apps/web/src/components/scenes/import-storyboard-dialog.tsx` — промпты и импорт раскадровки.
- `apps/web/src/lib/use-scene-field.ts` — живые поля сцены.
- `apps/web/src/lib/queries` — все frontend API operations.
- `apps/api/prisma/schema.prisma` — модель данных.
- `apps/api/src/projects/projects.service.ts` — ownership и статусы проекта.
- `apps/api/src/scenes/scenes.service.ts` — сцены/import/reorder/duplicate/active-asset.
- `apps/api/src/assets/assets.service.ts`, `assets.processor.ts` — ассеты, очередь, музыка проекта.
- `apps/api/src/export/export.service.ts`, `export/timeline.ts` — форматы экспорта и FCPXML/EDL.
- `packages/shared-types/src` — канонический общий контракт.

## 19. Одноабзацное резюме для другого AI

Foundry — TypeScript pnpm/Turborepo monorepo с Next.js frontend, NestJS REST API, PostgreSQL/Prisma и Redis/BullMQ. Пользователь ведёт YouTube-проект по четырём этапам редактора (Research → Script → Storyboard → Producing): собирает источники, пишет сценарий начитки (или получает его от LLM по теме/брифу с выбором языка и длины), разбивает его на сцены или импортирует JSON-раскадровку из внешнего чата, переставляет сцены, редактирует voiceover и промпты, генерирует либо загружает IMAGE/VIDEO/VOICE/MUSIC ассеты (выбирая активный вариант каждого типа), задаёт базовый музыкальный трек проекта, проверяет готовность и экспортирует в md/txt/json/csv/srt/prompts, а также в FCPXML и EDL для монтажки. Реальная AI-генерация — только IMAGE через Gemini и разбиение/промпты через Gemini; без ключа — локальные fallbacks; VIDEO/VOICE/MUSIC generation остаётся placeholder. Длительность сцен мерится по загруженным голосовым файлам (ffprobe) с оценкой по тексту как fallback. Канонический контракт — `packages/shared-types`; ownership и монотонный pipeline — в `ProjectsService`; server state — TanStack Query; локальный UI-state редактора — в `EditorProvider`.

SYSTEM / PROJECT BRIEF (ввод для AI-агента — пожалуйста, прочитай всё и начни работу):
(УБЕРИ ВСЕП УПОМИНАНИЯ ML И DOCKER)
Ты — Senior full-stack инженер + ML инженер. Твоя задача — полностью реализовать проект "resQ — Forecast Mode" (под челлендж NASA "Will It Rain On My Parade?") как production-grade PWA + backend + ML + интеграция GPT-5 (RAG). Проект включает: сбор исторических данных NASA/реанализов, подсчёт статистик «день-в-году», вероятностей превышения порогов, трендов, визуализацию на карте, экспорт CSV/JSON/GeoTIFF, и — ключевая фича — интеграция GPT-5, которая на основе агрегированных и/или предвычисленных статистик и метаданных отвечает пользователю понятными рекомендациями (e.g., very hot, very wet, very windy, very cold, very uncomfortable) и объясняет неопределённость.

Требования к реализации: полный стек (frontend, backend, ETL/ML pipelines), документация, unit/integration tests, Docker, CI config, инструкции по деплою. Код должен быть хорошо структурирован, модульным, с README и примером запуска локально.

=== Технический стек (обязательный):
- Frontend: React + Next.js (PWA), TypeScript, Tailwind CSS. Использовать Leaflet или Mapbox GL для карты. Использовать service worker + workbox для оффлайн.
- Backend: Python + FastAPI (async). Использовать Uvicorn/Gunicorn для продакшн. Endpoints описаны ниже.
- Data processing: Python, xarray, rioxarray, netCDF4, zarr, dask для масштабирования. Использовать OPeNDAP/HDF/HTTP для доступа к NASA datasets.
- Database: PostgreSQL (PostGIS) для векторных данных, Redis для кэша. Vector DB для RAG: Pinecone или Weaviate (агент должен поддержать оба варианта, с выбором конфигом).
- Embeddings/LLM: использовать GPT-5 (через доступный API). Для векторизации — OpenAI embeddings (или альтернативу). Использовать LangChain-like orchestration (или реализовать RAG вручную).
- Storage: S3-compatible (AWS S3 / MinIO) для Zarr, GeoTIFF, статических артефактов.


=== Источники данных (обязательное использование/поддержка):
- GPM IMERG (осадки) — через GES DISC / Giovanni / OPeNDAP (для исторических осадков).
- MODIS (Terra/Aqua) — облачность, снежный покров (по необходимости).
- MERRA-2 или ERA5 (реанализ) — температура, ветер, влажность.
- NASA POWER (для surface meteorology).
- Опционально Copernicus (ERA5) для повышения качества.
Агент должен уметь подгружать данные через OPeNDAP/Hyrax или через предзагруженные NetCDF/Zarr, а также уметь подготовить pipeline для конвертации NetCDF → Zarr и хранения на S3.

=== Функциональные Endpoints (обязательные):
1) POST /api/forecast/statistics
   - Вход: { lat: float, lon: float, day_of_year: int, window_days: int (default 3), variable: string, threshold: number | null, baseline_period: {start_year, end_year}, recent_period: {start_year, end_year} }
   - Выход: JSON {
       variable, units, n_years, mean, median, std, percentiles: {p10,p25,p50,p75,p90,p95},
       p_exceed: value (probability),
       p_exceed_CI: [low,high],
       trend: {slope, p_value, method},
       baseline_vs_recent: {p_exceed_baseline, p_exceed_recent, delta_percent},
       source: [ {dataset, url, doi, resolution} ],
       time_series: [{year, value}],
       caveats
     }

2) GET /api/forecast/map?variable=&threshold=&date=&bbox=
   - Возвращает raster/probability tiles (GeoJSON or TMS/XYZ) или ссылку на предварительно сгенерированный GeoTIFF/Zarr chunk.

3) POST /api/ai/query
   - Вход: { user_query: string, location: {lat,lon} or polygon, day_of_year, window_days, variables: [], thresholds: {}, user_profile: {age_group, activity_type (picnic/hike/parade)}, language }
   - Backend должен:
     a) вызвать /api/forecast/statistics для каждой переменной,
     b) собрать сопутствующие метаданные (source links),
     c) сформировать RAG-чат-запрос к GPT-5, передавая структурированные контекстные блоки: краткие статистики, графики (base64 ссылки), и таблицу time_series.
   - Выход: { answer: string (user-friendly), explanation: string (technical), recommended_actions: [..], confidence_score: 0-1, sources: [...], downloadable: {csv_url, json_url} }

4) WebSocket /api/realtime/alerts — опционально для push / realtime.

=== Как GPT-5 должен работать внутри (архитектура RAG / retrieval):
- Не давать GPT-5 «сырые» большие NetCDF. Вместо этого:
  1. Предобработай данные в backend: подсчитай статистики (см. endpoint /statistics) и составь компактный контекст: краткое summary (<=300 токенов) + таблицы (time_series сокращённые) + список источников.
  2. Сформируй embeddings для документов: каждый «document» = {location_hash, variable, day_of_year_bucket, text_summary, time_series_snippet, metadata}. Загружай в vector DB.
  3. При пользовательском запросе — извлеки top_k релевантных документов (например, k=5), передай их в качестве контекста в GPT-5 вместе с системным промптом, инструкцией и JSON данных с p_exceed и CI.
  4. Используй шаблон system prompt (внизу) для поведения GPT-5: давать краткий совет, выдавать probabilistic phrase (ex: "60% chance of >20mm"), объяснять неопределённость, и в конце — давать action items (take shelter, move event, bring water etc.), адаптированные к user_profile.

=== Конкретные алгоритмы статистики и ML (обязательные):
- Выборка: для day_of_year D и window ±w дней извлечь по каждому году значение (сумма осадков в окне, средняя Tmax и т.д.). Формировать ряд по годам.
- P(exceed t) = count(years where value > t) / N.
- CI для P — bootstrap по годам (N_boot=1000).
- Trend: Mann–Kendall test + Sen's slope, а также OLS с Newey-West для p-value.
- Если требуется повышенная точность на 6–12 часов, предусмотреть легкую ML модель (CatBoost / LightGBM) как опциональное улучшение, но в челлендже главное — исторический статистический подход.
- Все вычисления должны быть повторяемы (pipeline), сохранять provenance (какие данные, какие агрегаты).

=== RAG / Embeddings / Контекст модели — как «скормливать» информацию нейронке:
- Для каждого location+variable+day bucket генерируем:
  - short_summary (<=200 токенов): "For lat,lon on day 180 (June29) across 2001-2023, mean precipitation = X mm, median=Y, p(>20mm)=Z% (CI ...). Trend: increasing at S mm/decade (p=0.02). Source: GPM IMERG 0.1deg."
  - time_series_snippet: last 10 years values as CSV string.
  - metadata string: dataset links, resolution, years_covered, method.
- Индексируем эти documents в vector DB с embedding-вектором (use embeddings API).
- При запросе: retrieve top_k by semantic similarity to user prompt + exact match on location/day bucket (if available). Передавать retrieved_docs в GPT-5 при генерации ответа.

=== System / prompt templates (обязательные — копировать в код):
SYSTEM prompt (для GPT-5 call):
"You are ForecastGPT-5 — an expert on climatology, risk communication, and actionable advice. You will be given structured data blocks (short_summary, statistics, time_series_snippet, metadata) and a user question about the likelihood of weather conditions for a given location and day. Your output MUST include: 1) short human-friendly answer (1-2 sentences), 2) technical explanation (2-3 sentences) including probability and uncertainty, 3) recommended actions tailored to user_profile and activity_type (3 bullet points), 4) confidence_score (0-1), 5) sources list and a short caveat that this is statistical/climatological info — not a short-term forecast. Be concise, do not hallucinate, and cite sources from the provided metadata. If data gaps exist, explicitly say so."

User prompt template:
"User: {user_query}
Context:
- Location: {lat,lon} ({place_name})
- Day_of_year: {doy} (window ±{w} days)
- Retrieved_summaries: [ {short_summary_1}, ..., {short_summary_k} ]
- Key stats: {variable: {p_exceed,CI,mean,median,trend}}
- TimeSeriesSnippets: {csv_snippets}
UserProfile: {age_group, activity_type}
Language: {language}
Return JSON with fields: answer, explanation, recommended_actions[], confidence_score, sources[], downloadable_urls[].
"

=== Frontend requirements (PWA specifics):
- Next.js + TypeScript, PWA manifest, service worker (workbox) for offline caching.
- Offline bundle: minimal survival pack (short PDFs, low-res video links, cached summary graphs). For Forecast mode, cache recent queries and last map tiles.
- Accessibility: TTS for answers, alt text, large font UI mode.
- Map: time slider for Now / +3h/+6h/+12h / day-of-year animation for climatology heatmap.
- UI pattern: main tab = Forecast; secondary tab = Alerts (disabled or stub for hackathon).
- Export: CSV/JSON buttons that call backend to produce downloadable file stored on S3.

=== Tests / quality gates:
- Unit tests for statistical functions (bootstrap, p_exceed).
- Integration tests: mock OPeNDAP responses and ensure /api/forecast/statistics returns correct shape.
- End-to-end: Cypress for key flows (pin location → fetch stats → show chart → AI answer).
- Linting, typechecks (TS and MyPy), pre-commit hooks.

=== DevOps / CI:
- GitHub Actions pipeline: lint → unit tests → build docker images → push to registry.
- docker-compose for local dev with services: backend, frontend, postgres, redis, minio, pinecone-mock (or weaviate).
- Production: frontend to Vercel; backend container to AWS ECS/Fargate or Render. Use S3 for storage.

=== Security / rate-limits / cost control:
- Add request throttling for heavy endpoints (/api/forecast/statistics) and queue long-running jobs (Celery/RQ or background tasks with FastAPI + Redis).
- Cache popular queries (lat, doy, variable) in Redis for 24h.
- For GPT-5 calls: batch context (short_summary + key stats) and limit max tokens; use streaming for user response if supported.

=== Deliverables (what сode должен сгенерировать агент):
1) Репозиторий с двумя подпроектами: /frontend и /backend.
2) Рабочий FastAPI backend с описанными endpoints + ETL scripts (scripts/etl) для NetCDF→Zarr.
3) Next.js PWA frontend с картой, pin, day selector, thresholds UI, chatbox интегрированным с /api/ai/query.
4) RAG pipeline: document builder, embeddings uploader, retrieval API + GPT-5 orchestration.
5) README.md с инструкцией: локальный запуск, env vars (S3, DB, GPT_API_KEY), тесты и deploy.
6) Basic dataset examples (sample NetCDF or small precomputed Zarr) для демонстрации.
7) Unit/integration tests + Cypress e2e.



- Экспорт CSV/JSON работает и содержит year,value,source.
- CI проходит (lint+unit tests).

=== Ограничения/этика:
- GPT-5 НЕ должен выдавать мед/юридические предписания. Любой совет должен быть «рекомендательного характера» и содержать disclaimer.
- Не хранить пользовательские локации без разрешения — добавь конфиг для opt-in сохранения.
- Всегда указывай источник данных и DOI.

=== Доп. пожелания (можно реализовать после MVP):
- Precompute probability tiles for top 100 cities to show instant map.
- Optionally, tiny ML model (LightGBM) to correct bias for local microclimates.
- i18n (английский + русский + испанский).

---

IMPLEMENTATION NOTES (actionable steps агента):
1) Сгенерируй проект skeleton (monorepo): frontend/backend/scripts/tests/docs.
2) Реализуй ETL script: example для GPM IMERG: скачивает NetCDF chunk для заданного bbox и years, агрегирует по date-of-year ±w и сохраняет Zarr на local S3. Добавь helper для OPeNDAP.
3) Реализуй /api/forecast/statistics: читает Zarr/NetCDF, делает выборку, считает p_exceed, bootstrap CI, trend (Mann-Kendall + Sen's slope).
4) Реализуй simple in-memory document builder: генерирует short_summary, pushes embeddings to vector DB.
5) Реализуй /api/ai/query: retrieval → create prompt using templates → call GPT-5 API → postprocess → return JSON.
6) Сделай frontend: map, pin, day selector, threshold, hist chart (D3/Chart.js), ask AI modal.


--- END OF PROMPT ---
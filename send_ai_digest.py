import urllib.request
import json

BOT_TOKEN = '8766542758:AAFZ566aM4uWF-NYsumkN-abZ79jOoQ68CI'
CHAT_ID = 325846422

MESSAGE = """🗞 <b>AI Daily Digest — 6 апреля 2026</b>

<b>🔥 Главное</b>
• <b>Claude лёг на 2 часа</b> — Масштабный сбой Anthropic с 10:30 до 12:44 по ET затронул Claude.ai, десктопное приложение и Claude Code. Ошибки логина, голосового режима и чатов. Починили в 12:44, официальная причина не раскрыта.
  ↳ https://www.techradar.com/news/live/claude-anthropic-down-outage-april-6-2026

• <b>Критическая уязвимость в Claude Code — патч v2.1.90</b> — Исследователи обнаружили баг в парсере команд: атакующий мог спрятать вредоносную 51-ю субкоманду за жёстким лимитом в 50, обходя developer-настроенные deny rules. Риск — утечка SSH-ключей и API-токенов в CI-окружениях. Anthropic выпустил v2.1.90 с немедленным исправлением.
  ↳ https://letsdatascience.com/news/anthropic-patches-claude-code-bypass-vulnerability-f0cd666c

• <b>Anthropic закрыл OpenClaw для подписчиков</b> — С 4 апреля платные подписчики Claude больше не могут использовать популярный open-source агент OpenClaw в рамках своей подписки. Все запросы через сторонние обвязки теперь списываются с отдельного "extra usage" баланса. Anthropic предложил кредиты для смягчения перехода, но сообщество недовольно.
  ↳ https://www.theregister.com/2026/04/06/anthropic_closes_door_on_subscription/

<b>🤖 Claude &amp; Anthropic</b>
• <b>Claude Code v2.1.90</b> — Помимо патча безопасности: новая политика <code>forceRemoteSettingsRefresh</code>, интерактивный визард настройки Bedrock прямо из экрана логина, разбивка стоимости по моделям и cache-hits в команде <code>/cost</code>, улучшены sandbox и MCP-конфигурации, ускорена запись больших файлов.
  ↳ https://releasebot.io/updates/anthropic/claude-code

• <b>OpenClaw-скандал</b> — История вскрывает более глубокую тенденцию: Anthropic де-факто монополизирует экосистему агентов вокруг платного API, постепенно вытесняя open-source обвязки из subscription tier.
  ↳ https://www.infoworld.com/article/4154435/anthropic-cuts-openclaw-access-from-claude-subscriptions-offers-credits-to-ease-transition.html

<b>⚡ Инструменты &amp; Агенты</b>
• <b>MCP Dev Summit в Нью-Йорке</b> — Мейнтейнеры MCP от Anthropic, AWS, Microsoft и OpenAI провели roundtable, представив enterprise security roadmap. Agentic AI Foundation (AAIF) уже насчитывает 170 членов с декабря 2025. MCP стал де-факто стандартом для подключения AI-агентов к инструментам.
  ↳ https://startupnews.fyi/2026/04/07/mcp-maintainers-from-anthropic-aws-microsoft-and-openai-lay-out-enterprise-security-roadmap-at-dev-summit/

• <b>Pinterest запустил MCP в продакшн</b> — Инженеры Pinterest развернули полноценную MCP-экосистему с domain-specific серверами, центральным реестром и human-in-the-loop approval. Результат: тысячи сэкономленных человеко-часов в месяц.
  ↳ https://www.infoq.com/news/2026/04/pinterest-mcp-ecosystem/

• <b>oh-my-codex (OMX)</b> — Новый open-source инструмент: кастомизируемые хуки, AI agent teams и HUD-интерфейс поверх любого git-репозитория. Стремительно набирает звёзды на GitHub.
  ↳ https://aitoolly.com/ai-news/article/2026-04-04-introducing-oh-my-codex-omx-enhancing-code-repositories-with-hooks-agent-teams-and-hud-features

<b>🌐 Индустрия</b>
• <b>Google Gemma 4 и Qwen3 — новые релизы</b> — 6 апреля вышли Google Gemma 4 26B A4B Instruct и серия Qwen3 (0.6B, 1.7B, 4B, 8B, 14B, 30B base). Гонка open-weight моделей продолжается на всех размерных классах одновременно.
  ↳ https://llm-stats.com/ai-news

• <b>UnitedHealth вкладывает $3 млрд в AI</b> — Крупнейший медстраховщик США разворачивает AI-инструменты по всей операционной деятельности. Аналитики задаются вопросом о последствиях для пациентов при автоматизированных отказах в страховании.
  ↳ https://www.statnews.com/2026/04/06/unitedhealth-group-massive-artificial-intelligence-push-patient-implications/

• <b>GPU-уязвимости GeForge и GDDRHammer</b> — Два новых Rowhammer-подобных атаки на VRAM видеокарт Nvidia: bit flips в памяти GPU могут давать read/write доступ к памяти других процессов. Критично для мультитенантных GPU-кластеров.
  ↳ https://www.xloggs.com/2026/04/06/breaking-news-cyber-threats-2026-04-06-1700-pdt/

• <b>Законодательство по AI в Джорджии</b> — Губернатор Кемп получил три AI-закона: SB 540 (раскрытие чат-ботов + детская безопасность), SR 789 (комитет по изучению AI) и SB 444 (запрет принятия страховых решений исключительно на основе AI).
  ↳ https://www.transparencycoalition.ai/news/ai-legislative-update-april3-2026

<b>💡 Инсайт дня</b>
6 апреля обнажило хрупкость AI-инфраструктуры сразу на нескольких уровнях: Claude упал сам по себе, его security оказалась обходимой через трюк с лимитом субкоманд, а решение Anthropic закрыть OpenClaw показывает, что платформы всё агрессивнее закрывают экосистему вокруг себя. При этом MCP-саммит демонстрирует обратную тенденцию — крупные игроки договариваются об открытых стандартах. Индустрия одновременно открывается (MCP, Qwen3, OMX) и закрывается (OpenClaw ban, подписочные ограничения). Разработчикам стоит диверсифицировать зависимости — строить поверх открытых протоколов, а не vendor-специфичных subscription tier.

<b>🚀 Вирусное / Must-try</b>
• <b>OpenClaw</b> — Локальный AI-агент с 210K+ GitHub звёзд. Работает полностью on-device, подключается к WhatsApp, Telegram, Slack, Discord, Signal, iMessage через 50+ интеграций. Иронично стал ещё более вирусным именно в день, когда Anthropic его "забанил" для платных подписчиков.
  ↳ https://www.kdnuggets.com/openclaw-explained-the-free-ai-agent-tool-going-viral-already-in-2026

• <b>oh-my-codex (OMX)</b> — Добавляет хуки, agent teams и HUD в любой git-репозиторий. Идеально для тех, кто хочет Claude Code-подобный workflow без vendor lock-in.
  ↳ https://aitoolly.com/ai-news/article/2026-04-04-introducing-oh-my-codex-omx-enhancing-code-repositories-with-hooks-agent-teams-and-hud-features

<b>🔗 Стоит почитать</b>
• <a href="https://letsdatascience.com/news/anthropic-patches-claude-code-bypass-vulnerability-f0cd666c">Anthropic Patches Claude Code Bypass Vulnerability</a> — технический разбор уязвимости с 51-й субкомандой
• <a href="https://www.theregister.com/2026/04/06/anthropic_closes_door_on_subscription/">Anthropic Closes Door on OpenClaw Subscriptions</a> — The Register о закрытии OpenClaw для подписчиков
• <a href="https://startupnews.fyi/2026/04/07/mcp-maintainers-from-anthropic-aws-microsoft-and-openai-lay-out-enterprise-security-roadmap-at-dev-summit/">MCP Enterprise Security Roadmap (Dev Summit)</a> — что Anthropic, AWS, Microsoft и OpenAI планируют для MCP
• <a href="https://www.infoq.com/news/2026/04/pinterest-mcp-ecosystem/">Pinterest Deploys Production MCP Ecosystem</a> — real-world кейс промышленного внедрения MCP
• <a href="https://thenewstack.io/model-context-protocol-roadmap-2026/">MCP's Biggest Growing Pains Will Soon Be Solved</a> — The New Stack о будущем протокола
• <a href="https://www.statnews.com/2026/04/06/unitedhealth-group-massive-artificial-intelligence-push-patient-implications/">UnitedHealth's $3B AI Bet</a> — что это значит для пациентов
• <a href="https://news.harvard.edu/gazette/story/2026/04/vibe-coding-may-offer-insight-into-our-ai-future/">Vibe Coding — Harvard Gazette</a> — академический взгляд на феномен, 92% US-разработчиков уже используют
• <a href="https://releasebot.io/updates/anthropic/claude-code">Claude Code Release Notes (April 2026)</a> — полный changelog обновлений"""


def send_message(text):
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    chunks = [text[i:i+4000] for i in range(0, len(text), 4000)]
    for i, chunk in enumerate(chunks):
        data = json.dumps({
            'chat_id': CHAT_ID,
            'parse_mode': 'HTML',
            'text': chunk,
            'disable_web_page_preview': True
        }).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f'Chunk {i+1} sent: ok={result.get("ok")}, msg_id={result.get("result", {}).get("message_id")}')


send_message(MESSAGE)

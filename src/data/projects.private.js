// Cases curados de repositórios privados. O código não é exposto; só descrição, stack e links públicos.
// palette: [fundo, primária, destaque] — usada para gerar a capa animada (ProjectCover).
export const privateProjects = [
  {
    slug: 'garagemx',
    title: 'GaragemX',
    visibility: 'private',
    year: 2026,
    role: { pt: 'Produto completo: design, front-end, mobile e back-end', en: 'End-to-end product: design, front-end, mobile and back-end' },
    tagline: {
      pt: 'Manutenção de veículos no piloto automático.',
      en: 'Vehicle maintenance on autopilot.',
    },
    summary: {
      pt: 'PWA mobile-first para gestão de manutenção de veículos, publicada na web, na Play Store e na App Store. O usuário cadastra seus veículos e recebe alertas push de revisões por quilometragem estimada ou por prazo.',
      en: 'Mobile-first PWA for vehicle maintenance, shipped to the web, Play Store and App Store. Users register their vehicles and get push alerts for service by estimated mileage or by deadline.',
    },
    challenge: {
      pt: 'Lembrar revisões depende de anotações soltas e da memória. O desafio era prever a quilometragem sem exigir que o usuário atualize o odômetro todo dia, e entregar um único código em três plataformas.',
      en: 'Remembering service intervals relies on scattered notes and memory. The challenge was predicting mileage without asking users to update the odometer daily, and shipping one codebase to three platforms.',
    },
    highlights: {
      pt: [
        'Estimativa de km por média diária, com alertas de aviso e perigo por km e por dias',
        'Perfis de manutenção para ~119 modelos de moto gerando o histórico automaticamente',
        'Push via FCM com Cloud Functions agendadas: alertas diários, lembretes e dicas semanais',
        'Login com e-mail, Google e Apple; exclusão de conta self-service',
        'Um código Nuxt/Vue empacotado com Capacitor para Android e iOS (CI no Codemagic)',
        'Microinterações e transições com GSAP',
      ],
      en: [
        'Mileage estimated from daily average, with warning/danger alerts by km and by days',
        'Maintenance profiles for ~119 motorcycle models that generate the history automatically',
        'FCM push with scheduled Cloud Functions: daily alerts, reminders and weekly tips',
        'Email, Google and Apple sign-in; self-service account deletion',
        'A single Nuxt/Vue codebase packaged with Capacitor for Android and iOS (Codemagic CI)',
        'Micro-interactions and transitions built with GSAP',
      ],
    },
    stack: ['Nuxt', 'Vue 3', 'GSAP', 'Pinia', 'Tailwind', 'Firebase', 'Capacitor', 'PWA'],
    links: { live: 'https://garagemx.com.br' },
    palette: ['#0f1512', '#c6ff3d', '#ff6b2c'],
    motif: 'gauge',
    featured: true,
  },
  {
    slug: 'estudamais',
    title: 'EstudaMais',
    visibility: 'private',
    year: 2026,
    role: { pt: 'Full-stack: produto, front-end e API', en: 'Full-stack: product, front-end and API' },
    tagline: {
      pt: 'Seu ciclo de estudos, uma tarefa por vez.',
      en: 'Your study cycle, one task at a time.',
    },
    summary: {
      pt: 'Aplicação para planejar e acompanhar estudos para concursos. Uma planilha complexa virou produto: edital, ciclos automáticos até a prova, tarefas, questões, caderno de erros, pomodoro e painel de desempenho.',
      en: 'An app to plan and track study for civil-service exams. A complex spreadsheet turned into a product: syllabus, automatic cycles up to exam day, tasks, questions, error log, pomodoro and a performance dashboard.',
    },
    challenge: {
      pt: 'Transformar cinco abas de planilha interdependentes num fluxo diário simples: abrir o app e saber exatamente qual é a próxima tarefa.',
      en: 'Turning five interdependent spreadsheet tabs into a simple daily flow: open the app and know exactly what the next task is.',
    },
    highlights: {
      pt: [
        'Ciclos gerados automaticamente até a data da prova, com metas crescentes',
        'Tela "Hoje" com fila de tarefas em rodízio e pomodoro em janela flutuante',
        'Caderno de erros com filtros, edição inline e classificação A–F',
        'Painel com evolução × meta, constância e erros por tipo (Chart.js)',
        'Importação de edital via CSV e duplicação de concursos',
        'API Spring Boot com JWT, Flyway e testes com Testcontainers',
      ],
      en: [
        'Cycles generated automatically up to exam day, with increasing goals',
        '"Today" screen with a rotating task queue and a floating pomodoro window',
        'Error log with filters, inline editing and A–F classification',
        'Dashboard with progress vs. goal, consistency and errors by type (Chart.js)',
        'Syllabus import via CSV and exam duplication',
        'Spring Boot API with JWT, Flyway and Testcontainers tests',
      ],
    },
    stack: ['Vue 3', 'PrimeVue', 'Pinia', 'Chart.js', 'Spring Boot', 'PostgreSQL', 'Docker'],
    links: {},
    palette: ['#10101a', '#8b7bff', '#3ee6c1'],
    motif: 'cycles',
    featured: true,
  },
  {
    slug: 'duelo-de-rosas',
    title: 'Duelo de Rosas',
    visibility: 'private',
    year: 2026,
    role: { pt: 'Desenvolvimento completo', en: 'Full development' },
    tagline: {
      pt: 'Batalha em tempo real para lives do TikTok.',
      en: 'Real-time battles for TikTok Live.',
    },
    summary: {
      pt: 'Overlay para lives do TikTok: cada presente de rosa pontua para um lado e uma barra "versus" mostra quem está vencendo, com porcentagens atualizadas ao vivo, inclusive durante combos.',
      en: 'A TikTok Live overlay: each rose gift scores for one side and a "versus" bar shows who is winning, with percentages updating live, even during combos.',
    },
    challenge: {
      pt: 'Eventos de presente chegam em rajadas e combos. A barra precisava ser fluida e fiel ao placar em tempo real, e o streamer tinha que configurar tudo sem reiniciar a live.',
      en: 'Gift events arrive in bursts and combos. The bar had to stay smooth and true to the score in real time, and the streamer had to configure everything without restarting the stream.',
    },
    highlights: {
      pt: [
        'Conexão com a live via tiktok-live-connector e broadcast por WebSocket',
        'Barra versus animada que acompanha combos em tempo real',
        'Painel de controle com log de presentes para descobrir IDs de gifts',
        'Configuração com hot reload: nomes e cores mudam em ~2s sem reiniciar',
        'Funciona com qualquer par de presentes, não só rosas',
      ],
      en: [
        'Live connection via tiktok-live-connector and WebSocket broadcast',
        'Animated versus bar that tracks combos in real time',
        'Control panel with a gift log to discover gift IDs',
        'Hot-reloaded config: names and colors update in ~2s without restarting',
        'Works with any pair of gifts, not just roses',
      ],
    },
    stack: ['Node.js', 'Express', 'WebSocket', 'JavaScript', 'OBS Overlay'],
    links: {},
    palette: ['#14080c', '#ff2d55', '#f5f0ea'],
    motif: 'versus',
    featured: true,
  },
]

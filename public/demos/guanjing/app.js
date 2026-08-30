(() => {
  const I18N = window.GUANJING_I18N;
  let lang = localStorage.getItem("guanjing-lang-global") || "en";

  const state = {
    where: "北京",
    whenKey: 0,
    whoKey: 1,
    budgetKey: 1,
  };

  const TRIPS_KEY = "guanjing-trips";
  const SAVED_KEY = "guanjing-saved";

  const els = {
    appRoot: document.getElementById("appRoot"),
    homePane: document.getElementById("homePane"),
    tripsPane: document.getElementById("tripsPane"),
    inspirePane: document.getElementById("inspirePane"),
    savedPane: document.getElementById("savedPane"),
    savedGrid: document.getElementById("savedGrid"),
    savedEmpty: document.getElementById("savedEmpty"),
    savedMeta: document.getElementById("savedMeta"),
    inspirePageGrid: document.getElementById("inspirePageGrid"),
    homeTripGrid: document.getElementById("homeTripGrid"),
    homeTripsEmpty: document.getElementById("homeTripsEmpty"),
    tripFlow: document.getElementById("tripFlow"),
    workspace: document.getElementById("workspace"),
    homeForm: document.getElementById("homeChatForm"),
    homeInput: document.getElementById("homeChatInput"),
    tripsProjectList: document.getElementById("tripsProjectList"),
    tripsEmpty: document.getElementById("tripsEmpty"),
    tripsListView: document.getElementById("tripsListView"),
    tripsDetailView: document.getElementById("tripsDetailView"),
    bookedOnlyToggle: document.getElementById("bookedOnlyToggle"),
    tripAiCard: document.getElementById("tripAiCard"),
    tripAiImg: document.getElementById("tripAiImg"),
    tripAiTitle: document.getElementById("tripAiTitle"),
    tripAiSummary: document.getElementById("tripAiSummary"),
    tripAiDays: document.getElementById("tripAiDays"),
    tripAiPlace: document.getElementById("tripAiPlace"),
    tripAiDaysPlan: document.getElementById("tripAiDaysPlan"),
    tripAiHint: document.getElementById("tripAiHint"),
    form: document.getElementById("chatForm"),
    input: document.getElementById("chatInput"),
    empty: document.getElementById("chatEmpty"),
    messages: document.getElementById("messages"),
    scroll: document.getElementById("chatScroll"),
    composer: document.getElementById("composer"),
    composerDock: document.getElementById("composerDock"),
    chatPane: document.querySelector(".chat-pane"),
    mapToggle: document.getElementById("mapToggle"),
    mapPanel: document.getElementById("mapPanel"),
    miniMap: document.getElementById("miniMap"),
    sheet: document.getElementById("filterSheet"),
    sheetTitle: document.getElementById("sheetTitle"),
    sheetBody: document.getElementById("sheetBody"),
    filterForm: document.getElementById("filterForm"),
    filterWhere: document.getElementById("filterWhere"),
    filterWhen: document.getElementById("filterWhen"),
    filterWho: document.getElementById("filterWho"),
    filterBudget: document.getElementById("filterBudget"),
    locBtn: document.getElementById("locBtn"),
    orbCore: document.getElementById("orbCore"),
    heroTitle: document.getElementById("heroTitle"),
    heroDesc: document.getElementById("heroDesc"),
    suggestRow: document.getElementById("suggestRow"),
    tripCards: document.getElementById("tripCards"),
    exploreGrid: document.getElementById("explore-grid"),
    exploreCategories: document.getElementById("exploreCategories"),
    placeDetailDialog: document.getElementById("placeDetailDialog"),
    placeDetailContent: document.getElementById("placeDetailContent"),
    langBtn: document.getElementById("langBtn"),
    berdLangBtn: document.getElementById("berdLangBtn"),
  };

  let pendingFilter = null;
  let mapOpen = false;
  let panel = "home";
  let tripViewMode = "list"; // list | detail
  let bookedOnly = false;
  let tripsTab = "trips";
  let trips = loadTrips();
  let saved = loadSaved();
  let activeTripId = null;
  let exploreCategory = "architecture";
  let agentPreviousResponseId = sessionStorage.getItem("guanjing-agent-response-id") || "";
  const AI_TRIP_ID = "ai-from-prefs";
  const DISMISSED_AI_TRIP_KEY = "guanjing-dismissed-ai-trip-v1";

  function loadTrips() {
    try {
      const raw = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function saveTrips() {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }

  function loadSaved() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function persistSaved() {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }

  function isSaved(id) {
    return saved.some((item) => item.id === id);
  }

  function saveHeartSvg() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.7 13A4.6 4.6 0 0 1 11.3 6L12 6.7 12.7 6a4.6 4.6 0 0 1 6.6 6.4L12 20.3Z"/></svg>`;
  }

  function saveToggleHtml(id) {
    const on = isSaved(id);
    return `<button type="button" class="save-toggle ${on ? "on" : ""}" data-save-id="${id}" aria-label="${on ? t("saveRemove") : t("saveAdd")}" title="${on ? t("saveRemove") : t("saveAdd")}">${saveHeartSvg()}</button>`;
  }

  function toggleSaved(item) {
    if (!item?.id) return;
    const idx = saved.findIndex((x) => x.id === item.id);
    if (idx >= 0) saved.splice(idx, 1);
    else saved.unshift({ ...item, savedAt: Date.now() });
    persistSaved();
    document.querySelectorAll(`[data-save-id="${item.id}"]`).forEach((btn) => {
      const on = isSaved(item.id);
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-label", on ? t("saveRemove") : t("saveAdd"));
      btn.setAttribute("title", on ? t("saveRemove") : t("saveAdd"));
    });
    if (panel === "saved") renderSaved();
  }

  function bindSaveButtons(root, resolveItem) {
    root?.querySelectorAll(".save-toggle[data-save-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = resolveItem(btn.dataset.saveId);
        if (item) toggleSaved(item);
      });
    });
  }

  function showPanel(next) {
    const allowed = { home: "home", chat: "home", trips: "trips", inspire: "inspire", saved: "saved" };
    panel = allowed[next] || "home";
    els.appRoot?.classList.remove("view-home", "view-chat", "view-trips", "view-inspire", "view-saved");
    els.appRoot?.classList.add(`view-${panel}`);

    const panes = [
      [els.homePane, "home"],
      [els.tripsPane, "trips"],
      [els.inspirePane, "inspire"],
      [els.savedPane, "saved"],
    ];
    panes.forEach(([el, name]) => {
      if (!el) return;
      const on = panel === name;
      el.inert = !on;
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });

    document.querySelectorAll(".side-nav .nav-item").forEach((btn) => {
      const target = btn.dataset.panel || "";
      const title = btn.getAttribute("data-i18n-title") || "";
      if (panel === "home") {
        btn.classList.toggle("active", title === "navHome");
      } else {
        btn.classList.toggle("active", target === panel);
      }
    });

    if (panel === "home") {
      renderHomeTripCards();
      renderCity();
    }
    if (panel === "trips") renderTrips();
    if (panel === "inspire") renderInspirePage();
    if (panel === "saved") renderSaved();
  }

  const t = (key) => I18N.ui[lang][key] || key;
  const cityName = (id) => I18N.cityNames[lang][id] || id;
  const pick = (node) => (node && typeof node === "object" && ("zh" in node || "en" in node) ? node[lang] : node);

  // Verified Unsplash subjects (avoid Great Wall / Hanoi train street mismatches)
  const IMG = {
    forbiddenCity: "https://images.unsplash.com/photo-1509265226434-5f4ddbdb2f7a?w=800&q=80",
    forbiddenDetail: "https://images.unsplash.com/photo-1751688412331-720d7f6d91f2?w=800&q=80",
    forbiddenCorner: "https://images.unsplash.com/photo-1770257733649-f145e06f0711?w=800&q=80",
    beijingNight: "https://images.unsplash.com/photo-1747746204512-33aad4292aaa?w=800&q=80",
    hutong: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80",
    templeHeaven: "https://images.unsplash.com/photo-1599577180530-64104c2ece9a?w=800&q=80",
    lakePavilion: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    classicalGarden: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
    gardenPath: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    waterLane: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80",
    rockery: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    tea: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    bund: "https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800&q=80",
    wukang: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    museum: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80",
    skyline: "https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800&q=80",
    shanghaiNight: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80",
    tianjin: "https://images.unsplash.com/photo-1474181487882-7abf9d529cbb?w=800&q=80",
    mountain: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    lingnan: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
  };
  const IMG_CATALOG_VER = "img-v2";

  const inspireRoutes = [
    {
      key: "bj-tj",
      img: IMG.forbiddenCity,
      cities: [
        {
          zh: {
            name: "北京",
            impression: "皇城秩序感极强：一条中轴线统摄礼仪空间，胡同与什刹海又把城市速度降回生活尺度。",
            spots: ["故宫博物院", "天安门广场", "北京中轴线", "景山万春亭", "什刹海", "烟袋斜街", "天坛", "颐和园"],
          },
          en: {
            name: "Beijing",
            impression: "Imperial order on one Central Axis—then hutongs and Shichahai slow the city back to lived scale.",
            spots: ["Forbidden City", "Tiananmen Square", "Central Axis", "Jingshan Pavilion", "Shichahai", "Yandai Xie Street", "Temple of Heaven", "Summer Palace"],
          },
        },
        {
          zh: {
            name: "天津",
            impression: "开埠码头气质：五大道万国立面、海河夜色与曲艺市井叠在一起，近代中国的另一面。",
            spots: ["五大道", "意式风情区", "海河", "天津之眼", "古文化街", "天后宫", "瓷房子", "静园"],
          },
          en: {
            name: "Tianjin",
            impression: "Treaty-port waterfront mood: Five Avenues façades, Haihe nights, and folk-arts streets as another modern China.",
            spots: ["Five Avenues", "Italian Style Town", "Haihe River", "Tianjin Eye", "Ancient Culture Street", "Mazu Temple", "Porcelain House", "Jingyuan"],
          },
        },
      ],
      zh: {
        title: "北京 · 天津",
        days: "3 日",
        sub: "故宫中轴胡同 × 五大道 / 意式风情 / 海河",
        highlights: ["故宫中轴", "胡同什刹海", "五大道", "意式风情区"],
        summary: "高铁约 30 分钟串联双城：北京读礼仪秩序与胡同生活，天津读开埠近代建筑与海河码头。",
        daysPlan: [
          { day: "D1 北京", items: ["天安门广场 → 故宫（午门入/神武门出，走中轴序列）", "景山万春亭俯瞰中轴收束", "傍晚什刹海 / 烟袋斜街胡同慢走"] },
          { day: "D2 天津", items: ["高铁抵津 → 五大道骑行/漫步（万国建筑）", "古文化街小吃与天后宫一带", "意式风情区 → 海河 / 天津之眼夜景"] },
          { day: "D3 选边加深", items: ["留京：天坛或颐和园补皇家园林", "或留津：瓷房子 / 静园 / 曲艺体验后返程"] },
        ],
        tips: ["故宫需提前官方预约", "京津高铁频繁，行李宜轻便", "两人适中预算，住宿可 D1 北京、D2 天津"],
      },
      en: {
        title: "Beijing · Tianjin",
        days: "3 days",
        sub: "Palace / Axis / Hutong × Five Avenues / Italian Style Town / Haihe",
        highlights: ["Forbidden City", "Hutong & Shichahai", "Five Avenues", "Italian Quarter"],
        summary: "Link both cities by ~30 min HSR: Beijing for ritual order and hutong life; Tianjin for treaty-port architecture and the Haihe waterfront.",
        daysPlan: [
          { day: "D1 Beijing", items: ["Tiananmen → Forbidden City (Meridian Gate in / Shenwu Gate out along the axis)", "Jingshan Wanchun Pavilion overlook", "Evening Shichahai / Yandai Xie street hutong walk"] },
          { day: "D2 Tianjin", items: ["HSR to Tianjin → Five Avenues stroll", "Ancient Culture Street & Mazu temple area", "Italian Style Town → Haihe / Tianjin Eye night view"] },
          { day: "D3 Go deeper", items: ["Stay in BJ: Temple of Heaven or Summer Palace", "Or stay in TJ: Porcelain House / Jingyuan / folk arts, then depart"] },
        ],
        tips: ["Book the Forbidden City officially in advance", "HSR is frequent—pack light", "Moderate budget for 2: sleep BJ night 1, TJ night 2"],
      },
    },
    {
      key: "xa-cd",
      img: IMG.classicalGarden,
      cities: [
        {
          zh: {
            name: "西安",
            impression: "黄土与礼制之城：城墙圈出的厚重尺度，兵马俑把帝国秩序推到极致，市井在回坊与钟鼓楼之间喘息。",
            spots: ["秦始皇帝陵博物院（兵马俑）", "西安城墙", "钟楼", "鼓楼", "回民街 / 大皮院", "华清宫", "大唐不夜城"],
          },
          en: {
            name: "Xi’an",
            impression: "Loess and ritual: the wall frames imperial scale; Terracotta pushes order to the extreme; Muslim Quarter keeps the city breathing.",
            spots: ["Terracotta Army Museum", "City Wall", "Bell Tower", "Drum Tower", "Muslim Quarter / Dapiyuan", "Huaqing Palace", "Great Tang Mall"],
          },
        },
        {
          zh: {
            name: "成都",
            impression: "巴适慢城：茶馆、巷弄与火锅定节奏，武侯祠与都江堰提醒你——松弛背后仍有治水与叙事的厚底。",
            spots: ["宽窄巷子", "武侯祠", "锦里", "大熊猫繁育研究基地", "都江堰", "青城山", "春熙路"],
          },
          en: {
            name: "Chengdu",
            impression: "Easy pace city: teahouses, lanes, and hotpot set the tempo—Wuhou and Dujiangyan keep depth under the ease.",
            spots: ["Kuanzhai Alley", "Wuhou Shrine", "Jinli", "Panda Base", "Dujiangyan", "Mount Qingcheng", "Chunxi Road"],
          },
        },
      ],
      zh: {
        title: "西安 · 成都",
        days: "5 日",
        sub: "兵马俑与城墙礼制 × 宽窄巷子市井慢生活",
        highlights: ["兵马俑", "城墙回民街", "宽窄巷子", "武侯祠锦里"],
        summary: "先厚重后巴适：西安读礼制与黄土文明，高铁穿秦岭后，成都读街巷节奏与茶馆生活。",
        daysPlan: [
          { day: "D1 西安", items: ["钟楼 / 鼓楼 → 城墙段步行", "回民街或大皮院吃泡馍/烤肉（避开纯网红主街）"] },
          { day: "D2 西安", items: ["秦始皇帝陵博物院（兵马俑）早场", "华清宫", "可选大唐不夜城夜景"] },
          { day: "D3 西成高铁", items: ["西安北 → 成都东（约 3–4h）", "下午武侯祠 → 锦里过渡"] },
          { day: "D4 成都", items: ["大熊猫基地（早）", "宽窄巷子茶馆与川菜", "夜：地道火锅（社区店优于景区店）"] },
          { day: "D5 成都", items: ["都江堰或青城山半日", "返程；或春熙路自由活动"] },
        ],
        tips: ["兵马俑尽早入场", "西成高铁提前购票", "西安住钟楼/南门，成都住宽窄或春熙附近"],
      },
      en: {
        title: "Xi’an · Chengdu",
        days: "5 days",
        sub: "Terracotta & city wall × Kuanzhai alleys and slow living",
        highlights: ["Terracotta Army", "City wall & Muslim Quarter", "Kuanzhai Alley", "Wuhou & Jinli"],
        summary: "Heavy history first, then easy living: Xi’an for ritual landscape; after HSR across Qinling, Chengdu for lanes, teahouses, and pace.",
        daysPlan: [
          { day: "D1 Xi’an", items: ["Bell / Drum Tower → wall walk segment", "Muslim Quarter or Dapiyuan for local food (skip pure selfie streets)"] },
          { day: "D2 Xi’an", items: ["Emperor Qin’s Mausoleum Museum (Terracotta) early entry", "Huaqing Palace", "Optional Great Tang Mall night"] },
          { day: "D3 HSR west", items: ["Xi’an North → Chengdu East (~3–4h)", "Afternoon Wuhou Shrine → Jinli"] },
          { day: "D4 Chengdu", items: ["Panda Base (morning)", "Kuanzhai teahouse & Sichuan food", "Night: neighborhood hotpot over tourist chains"] },
          { day: "D5 Chengdu", items: ["Half-day Dujiangyan or Qingcheng", "Depart—or free time at Chunxi"] },
        ],
        tips: ["Enter Terracotta early", "Book Xi’an–Chengdu HSR ahead", "Stay near Bell Tower in Xi’an; Kuanzhai/Chunxi in Chengdu"],
      },
    },
    {
      key: "sh-sz",
      img: IMG.bund,
      cities: [
        {
          zh: {
            name: "上海",
            impression: "海派对照城市：外滩历史立面与对岸天际线对望，衡复/武康路用街道尺度讲出日常摩登。",
            spots: ["外滩万国建筑群", "陆家嘴天际线", "武康路", "衡复风貌区", "外滩夜景", "当代文化空间（可选）"],
          },
          en: {
            name: "Shanghai",
            impression: "Haipai contrast city: Bund façades face the Pudong skyline; Hengfu/Wukang streets make modernity walkable.",
            spots: ["The Bund façades", "Lujiazui skyline", "Wukang Road", "Hengfu historic district", "Bund night lights", "Contemporary culture space (optional)"],
          },
        },
        {
          zh: {
            name: "苏州",
            impression: "园林即剧本：墙廊水石控制视线，平江水巷承接日常——宁深读一座园，勿清单打卡。",
            spots: ["拙政园", "苏州博物馆", "平江路", "留园", "网师园", "山塘街", "虎丘"],
          },
          en: {
            name: "Suzhou",
            impression: "Gardens as scripts: walls, corridors, water, and rockery steer the eye; Pingjiang carries everyday life—depth over checklists.",
            spots: ["Humble Administrator’s Garden", "Suzhou Museum", "Pingjiang Road", "Lingering Garden", "Master of Nets", "Shantang Street", "Tiger Hill"],
          },
        },
      ],
      zh: {
        title: "上海 · 苏州",
        days: "3 日",
        sub: "外滩海派立面 × 拙政园 / 平江路园林叙事",
        highlights: ["外滩", "武康路", "拙政园", "平江路"],
        summary: "沪苏高铁约 30 分钟：上海读立面与街道尺度，苏州深读一座园林 + 水巷，宁深勿杂。",
        daysPlan: [
          { day: "D1 上海", items: ["外滩万国建筑群对望陆家嘴", "下午武康路 / 衡复风貌漫步", "夜：外滩灯光（19:00 后）"] },
          { day: "D2 苏州", items: ["高铁抵苏 → 拙政园早场（空间开合与借景）", "苏州博物馆（需预约）", "平江路摇橹船 / 评弹"] },
          { day: "D3 苏州", items: ["留园或网师园对照小园尺度", "山塘街或虎丘选一", "傍晚返沪"] },
        ],
        tips: ["拙政园、苏博务必提前预约", "园林上午人少", "住平江路附近便于步行串联"],
      },
      en: {
        title: "Shanghai · Suzhou",
        days: "3 days",
        sub: "Bund façades × Humble Administrator’s Garden / Pingjiang narrative",
        highlights: ["The Bund", "Wukang Road", "Humble Administrator’s Garden", "Pingjiang Road"],
        summary: "~30 min HSR: Shanghai for façades and street scale; Suzhou for one deep garden + water lanes—depth over checklist.",
        daysPlan: [
          { day: "D1 Shanghai", items: ["Bund historic façades facing Lujiazui", "Afternoon Wukang / Hengfu walk", "Night: Bund lights after 19:00"] },
          { day: "D2 Suzhou", items: ["HSR → Humble Administrator’s Garden early (borrowed views & enclosure)", "Suzhou Museum (reserve)", "Pingjiang boat / pingtan"] },
          { day: "D3 Suzhou", items: ["Lingering or Master of Nets as small-garden contrast", "Shantang or Tiger Hill—pick one", "Return to Shanghai evening"] },
        ],
        tips: ["Reserve garden & museum early", "Gardens are quieter before 10am", "Stay near Pingjiang for walkable days"],
      },
    },
    {
      key: "lingnan",
      img: IMG.lingnan,
      cities: [
        {
          zh: {
            name: "广州",
            impression: "广府生活底色：骑楼、早茶与陈家祠的雕镂，西关把岭南温润写进日常街道。",
            spots: ["陈家祠", "沙面", "永庆坊", "恩宁路骑楼", "上下九", "荔枝湾涌", "老字号早茶", "珠江 / 西堤"],
          },
          en: {
            name: "Guangzhou",
            impression: "Cantonese everyday: qilou, morning tea, and Chen Clan carving—Xiguan writes Lingnan warmth into the street.",
            spots: ["Chen Clan Academy", "Shamian", "Yongqing Fang", "Enning qilou", "Shangxiajiu", "Lychee Bay", "Classic morning tea", "Pearl River / West Bund"],
          },
        },
        {
          zh: {
            name: "深圳",
            impression: "新城里的旧根：南头古城保存县治与宗祠肌理，再对照湾区天际线，才读得懂深圳的时间层。",
            spots: ["南头古城", "中山公园", "南山博物馆", "深圳湾天际线", "海岸城一带"],
          },
          en: {
            name: "Shenzhen",
            impression: "Old roots in a new city: Nantou keeps yamen and ancestral-hall fabric—set against the bay skyline to read Shenzhen’s time layers.",
            spots: ["Nantou Old Town", "Zhongshan Park", "Nanshan Museum", "Shenzhen Bay skyline", "Coastal City area"],
          },
        },
      ],
      zh: {
        title: "广深 · 岭南文化",
        days: "4 日",
        sub: "陈家祠骑楼早茶 × 南头古城与当代深圳",
        highlights: ["陈家祠", "永庆坊骑楼", "早茶", "南头古城"],
        summary: "广州西关读岭南建筑与广府生活，深圳南头读深港历史之根，对照当代都市，避免只逛商场。",
        daysPlan: [
          { day: "D1 广州", items: ["陈家祠（木石砖雕 · 岭南建筑明珠）", "沙面欧陆建筑漫步", "夜：珠江边或西堤"] },
          { day: "D2 广州西关", items: ["老字号早茶（陶陶居/莲香楼等）", "永庆坊 → 恩宁路骑楼", "上下九 / 荔枝湾涌"] },
          { day: "D3 抵深", items: ["高铁/城际赴深圳", "南头古城（县衙、宗祠、骑楼街巷）", "毗邻中山公园慢走"] },
          { day: "D4 深圳", items: ["南山博物馆或当代文化空间", "海岸城/深圳湾天际线对照", "返程"] },
        ],
        tips: ["早茶建议工作日错峰", "呈现岭南生活勿猎奇化", "广深城际密集，可当日往返调整"],
      },
      en: {
        title: "Guangzhou · Shenzhen · Lingnan",
        days: "4 days",
        sub: "Chen Clan Academy, qilou & morning tea × Nantou Old Town",
        highlights: ["Chen Clan Academy", "Yongqing Fang qilou", "Morning tea", "Nantou Old Town"],
        summary: "Guangzhou Xiguan for Lingnan fabric and Cantonese life; Shenzhen Nantou for deep-Hong Kong roots—contrast with the modern city, not malls only.",
        daysPlan: [
          { day: "D1 Guangzhou", items: ["Chen Clan Academy (carving masterpiece)", "Shamian European fabric walk", "Night: Pearl River / West Bund"] },
          { day: "D2 Xiguan", items: ["Classic morning tea (Taotaoju / Lianxianglou etc.)", "Yongqing Fang → Enning qilou", "Shangxiajiu / Lychee Bay"] },
          { day: "D3 To Shenzhen", items: ["HSR / intercity to SZ", "Nantou Old Town (yamen, ancestral halls, lanes)", "Zhongshan Park stroll"] },
          { day: "D4 Shenzhen", items: ["Nanshan Museum or contemporary space", "Bay skyline contrast", "Depart"] },
        ],
        tips: ["Morning tea is calmer on weekdays", "Portray Lingnan life respectfully", "Intercity trains are frequent—adjust flexibly"],
      },
    },
    {
      key: "gz-gx",
      img: IMG.mountain,
      cities: [
        {
          zh: {
            name: "贵州",
            impression: "喀斯特与聚落叠影：黄果树的水声之外，黔东南苗侗村寨以鼓楼、风雨桥与礼仪维系公共生活——访客当克制、先尊重。",
            spots: ["黄果树瀑布", "天星桥", "荔波小七孔（可选）", "西江千户苗寨", "肇兴侗寨", "鼓楼群", "岜沙（可选，忌舞台化）"],
          },
          en: {
            name: "Guizhou",
            impression: "Karst and settlement layers: beyond Huangguoshu’s water, Qiandongnan Miao–Dong villages hold public life in drum towers and etiquette—visit with restraint and respect.",
            spots: ["Huangguoshu Falls", "Tianxingqiao", "Libo Xiaoqikong (optional)", "Xijiang Miao village", "Zhaoxing Dong village", "Drum-tower clusters", "Basha (optional; avoid staged exoticism)"],
          },
        },
        {
          zh: {
            name: "广西",
            impression: "漓江山水与梯田农耕叙事：阳朔控节奏，龙脊看田与村的共生——风景是人居与劳作的结果，不是布景。",
            spots: ["漓江（磨盘山精华段）", "阳朔遇龙河", "阳朔西街", "龙脊梯田（金坑 / 平安）", "黄洛等村寨文化体验", "桂林"],
          },
          en: {
            name: "Guangxi",
            impression: "Li River landscape and terrace farming stories: keep Yangshuo calm; read Longji as lived agriculture—not a backdrop.",
            spots: ["Li River (Mopanshan classic stretch)", "Yulong River", "West Street, Yangshuo", "Longji terraces (Jinkeng / Ping’an)", "Village cultural visit", "Guilin"],
          },
        },
      ],
      zh: {
        title: "贵州 · 广西",
        days: "8–9 日",
        sub: "黄果树 / 苗侗村寨 × 漓江阳朔 / 龙脊梯田",
        highlights: ["黄果树", "肇兴侗寨", "漓江", "龙脊梯田"],
        summary: "黔桂山水与村寨联线：贵州侧重黄果树与苗侗聚落，广西侧重漓江、阳朔与龙脊。民族志视角，拒绝猎奇。",
        daysPlan: [
          { day: "D1–2 贵州自然", items: ["贵阳集结 → 黄果树（大瀑布 + 天星桥）", "可选荔波小七孔"] },
          { day: "D3–5 黔东南", items: ["西江千户苗寨（尊重礼仪，少扰民）", "肇兴侗寨鼓楼群 / 侗族大歌", "可选岜沙等村寨，避免舞台化猎奇"] },
          { day: "D6 转入广西", items: ["高铁/公路赴桂林或从江方向衔接"] },
          { day: "D7 漓江阳朔", items: ["磨盘山码头漓江游船精华段", "阳朔遇龙河 / 西街（控制节奏）"] },
          { day: "D8–9 龙脊", items: ["龙脊梯田（金坑或平安）", "黄洛等村寨文化体验", "返桂林散团"] },
        ],
        tips: ["村寨摄影先征得同意", "雨季注意山路", "行程长，建议含 1 个休整半日", "与当地文化持有者视角对齐"],
      },
      en: {
        title: "Guizhou · Guangxi",
        days: "8–9 days",
        sub: "Huangguoshu / Miao–Dong villages × Li River / Longji terraces",
        highlights: ["Huangguoshu", "Zhaoxing Dong", "Li River", "Longji terraces"],
        summary: "Mountains and villages: Guizhou for falls and Miao–Dong settlements; Guangxi for Li River, Yangshuo, Longji—ethnographic care, no exoticizing.",
        daysPlan: [
          { day: "D1–2 Guizhou nature", items: ["Guiyang → Huangguoshu (falls + Tianxingqiao)", "Optional Libo Xiaoqikong"] },
          { day: "D3–5 Qiandongnan", items: ["Xijiang Miao village (respect local etiquette)", "Zhaoxing Dong drum towers / grand song", "Optional Basha—avoid staged exotic shows"] },
          { day: "D6 Into Guangxi", items: ["HSR/road link toward Guilin or Congjiang"] },
          { day: "D7 Li River & Yangshuo", items: ["Mopanshan pier classic Li River cruise", "Yulong River / West Street—keep a calm pace"] },
          { day: "D8–9 Longji", items: ["Longji terraces (Jinkeng or Ping’an)", "Village cultural visit", "Return via Guilin"] },
        ],
        tips: ["Ask before photographing people", "Watch mountain roads in rainy season", "Build in a rest half-day", "Align storytelling with local cultural holders"],
      },
    },
  ];

  const cities = {
    北京: {
      orb: { zh: "京", en: "BJ" },
      title: { zh: "今天去哪，北京？", en: "Where to today, Beijing?" },
      desc: {
        zh: "将故宫空间序列、中轴线秩序与胡同生活体验，读成一条皇城叙事。",
        en: "Read the Palace sequence, Central Axis, and hutong life as one imperial-city narrative.",
      },
      suggests: [
        {
          label: { zh: "故宫半天空间叙事", en: "Half-day Palace narrative" },
          prompt: {
            zh: "帮我规划故宫半天深度游，按中轴线与院落序列讲解空间",
            en: "Plan a half-day Forbidden City visit focusing on the axis and courtyard sequence",
          },
        },
        {
          label: { zh: "中轴线 + 胡同", en: "Axis + hutong" },
          prompt: {
            zh: "串联中轴线关键节点与周边胡同文化体验，别只打卡拍照",
            en: "Link Central Axis nodes with nearby hutong culture—not just photo stops",
          },
        },
        {
          label: { zh: "皇城一日对照", en: "Imperial city contrast day" },
          prompt: {
            zh: "一天对比故宫礼仪空间与胡同生活空间的差异",
            en: "One day contrasting Palace ritual space with hutong living space",
          },
        },
      ],
      trip: {
        img: IMG.forbiddenCity,
        title: { zh: "北京中轴与故宫 · 2 日", en: "Beijing Axis & Palace · 2 days" },
        sub: { zh: "故宫 → 中轴线 → 胡同文化体验", en: "Palace → Central Axis → Hutong culture" },
      },
      mapPins: [
        { left: "48%", top: "28%", label: { zh: "故宫", en: "Palace" } },
        { left: "48%", top: "42%", label: { zh: "中轴", en: "Axis" } },
        { left: "36%", top: "48%", label: { zh: "什刹海", en: "Shichahai" } },
        { left: "58%", top: "52%", label: { zh: "南锣", en: "Nanluogu" } },
      ],
      places: [
        { tag: { zh: "空间叙事", en: "Spatial" }, tagClass: "accent", title: { zh: "故宫博物院", en: "Forbidden City" }, sub: { zh: "中轴序列 · 院落节奏", en: "Axis sequence · courtyards" }, img: IMG.forbiddenCity, prompt: { zh: "用空间叙事讲故宫：中轴线、院落开合与礼仪动线", en: "Narrate the Forbidden City: axis, courtyard rhythm, ritual paths" } },
        { tag: { zh: "轴线", en: "Axis" }, title: { zh: "北京中轴线", en: "Beijing Central Axis" }, sub: { zh: "城市秩序 · 礼仪地理", en: "Urban order · ritual geography" }, img: IMG.forbiddenDetail, prompt: { zh: "讲解北京中轴线如何组织城市与人的身体路径", en: "Explain how the Central Axis organizes the city and the body" } },
        { tag: { zh: "文化体验", en: "Culture" }, title: { zh: "胡同漫游", en: "Hutong walk" }, sub: { zh: "生活尺度 · 巷弄肌理", en: "Lived scale · lane fabric" }, img: IMG.hutong, prompt: { zh: "安排胡同文化体验：四合院尺度、生活节奏、避免网红打卡堆砌", en: "Plan a hutong experience: courtyard scale, daily pace—not influencer checklists" } },
        { tag: { zh: "Attraction", en: "Attraction" }, title: { zh: "景山 / 端门对照", en: "Jingshan overlook" }, sub: { zh: "俯瞰中轴 · 视线收束", en: "Axis overlook · visual closure" }, img: IMG.forbiddenCorner, prompt: { zh: "从景山看中轴线：视线如何收束皇城秩序", en: "From Jingshan: how the view closes imperial order" } },
        { tag: { zh: "文化体验", en: "Culture" }, title: { zh: "什刹海 · 烟袋斜街", en: "Shichahai · Yandai" }, sub: { zh: "水岸胡同 · 市井层", en: "Waterfront hutong life" }, img: IMG.beijingNight, prompt: { zh: "什刹海与烟袋斜街：胡同亲水生活如何展开", en: "Shichahai & Yandai: how hutong life meets water" } },
        { tag: { zh: "Attraction", en: "Attraction" }, title: { zh: "天坛（可选延伸）", en: "Temple of Heaven (optional)" }, sub: { zh: "祭天空间 · 象征秩序", en: "Ritual space · symbolic order" }, img: IMG.templeHeaven, prompt: { zh: "若时间允许，如何把天坛作为中轴礼仪空间延伸", en: "If time allows, extend the axis narrative to the Temple of Heaven" } },
      ],
    },
    苏州: {
      orb: { zh: "苏", en: "SZ" },
      title: { zh: "今天去哪，苏州？", en: "Where to today, Suzhou?" },
      desc: {
        zh: "将园林的墙、廊、水与借景，读成可走的空间剧本。",
        en: "Read garden walls, corridors, water, and borrowed views as a walkable spatial script.",
      },
      suggests: [
        { label: { zh: "拙政园空间导读", en: "Humble Administrator’s guide" }, prompt: { zh: "拙政园半天：按空间开合与借景逻辑讲解，不要景点清单", en: "Half-day Humble Administrator’s Garden by enclosure and borrowed views—not a checklist" } },
        { label: { zh: "留园 vs 网师园", en: "Lingering vs Master of Nets" }, prompt: { zh: "对比留园与网师园的尺度与动线差异", en: "Compare Lingering Garden and Master of Nets in scale and path" } },
        { label: { zh: "园林半日慢走", en: "Slow garden half-day" }, prompt: { zh: "苏州园林半日慢游，适合两人，预算适中", en: "A slow half-day garden visit for two, moderate budget" } },
      ],
      trip: {
        img: IMG.lakePavilion,
        title: { zh: "苏州园林叙事 · 1–2 日", en: "Suzhou garden narrative · 1–2 days" },
        sub: { zh: "拙政园 → 留园 / 网师园", en: "Humble Administrator’s → Lingering / Master of Nets" },
      },
      mapPins: [
        { left: "42%", top: "40%", label: { zh: "拙政园", en: "Humble" } },
        { left: "58%", top: "36%", label: { zh: "留园", en: "Lingering" } },
        { left: "50%", top: "55%", label: { zh: "网师园", en: "Nets" } },
        { left: "35%", top: "58%", label: { zh: "平江路", en: "Pingjiang" } },
      ],
      places: [
        { tag: { zh: "空间叙事", en: "Spatial" }, tagClass: "accent", title: { zh: "拙政园", en: "Humble Administrator’s" }, sub: { zh: "开合 · 借景 · 水院", en: "Enclosure · borrowed views · water" }, img: IMG.lakePavilion, prompt: { zh: "拙政园空间叙事：如何用墙与廊控制看见与被看见", en: "Humble Administrator’s: walls and corridors controlling seeing" } },
        { tag: { zh: "园林", en: "Garden" }, title: { zh: "留园", en: "Lingering Garden" }, sub: { zh: "序列转折 · 大中见小", en: "Sequence turns · vast in small" }, img: IMG.classicalGarden, prompt: { zh: "留园的空间序列与转折如何设计", en: "How Lingering Garden designs sequence and turns" } },
        { tag: { zh: "园林", en: "Garden" }, title: { zh: "网师园", en: "Master of Nets" }, sub: { zh: "小园极致 · 尺度精微", en: "Tiny garden perfection" }, img: IMG.gardenPath, prompt: { zh: "网师园为何能在极小尺度里完成完整园林体验", en: "Why Master of Nets feels complete at tiny scale" } },
        { tag: { zh: "巷弄", en: "Lane" }, title: { zh: "平江路", en: "Pingjiang Road" }, sub: { zh: "水巷生活 · 城市肌理", en: "Water lane life · urban fabric" }, img: IMG.waterLane, prompt: { zh: "园林之外，平江路水巷如何承接苏州日常", en: "Beyond gardens: how Pingjiang carries everyday Suzhou" } },
        { tag: { zh: "可选", en: "Optional" }, title: { zh: "狮子林", en: "Lion Grove" }, sub: { zh: "叠山路径 · 游戏性", en: "Rockery paths · playful maze" }, img: IMG.rockery, prompt: { zh: "狮子林叠山路径的游戏性与空间迷惑如何解读", en: "Reading Lion Grove’s playful rockery maze" } },
        { tag: { zh: "文化体验", en: "Culture" }, title: { zh: "园林茶歇节奏", en: "Garden tea pause" }, sub: { zh: "停 · 看 · 转 · 再看", en: "Pause · see · turn · see again" }, img: IMG.tea, prompt: { zh: "园林游览中的停驻点与茶歇如何安排才不破坏节奏", en: "Where to pause for tea without breaking garden rhythm" } },
      ],
    },
    上海: {
      orb: { zh: "沪", en: "SH" },
      title: { zh: "今天去哪，上海？", en: "Where to today, Shanghai?" },
      desc: {
        zh: "将外滩立面、街巷与当代文化空间，读出海派如何被空间生产。",
        en: "Read Bund façades, lanes, and cultural spaces as how Haipai is produced spatially.",
      },
      suggests: [
        { label: { zh: "外滩建筑对照", en: "Bund façade dialogue" }, prompt: { zh: "外滩历史建筑与对岸天际线的空间对照导读", en: "Guide the Bund historic façades against the Pudong skyline" } },
        { label: { zh: "武康路文化漫步", en: "Wukang culture walk" }, prompt: { zh: "武康路 / 衡复风貌区文化体验半日，侧重建筑与街道尺度", en: "Half-day Wukang / Hengfu walk focused on buildings and street scale" } },
        { label: { zh: "海派一日", en: "Haipai day" }, prompt: { zh: "上海一日：历史建筑 + 当代文化空间，不要纯购物线", en: "One Shanghai day: historic fabric + contemporary culture—not shopping only" } },
      ],
      trip: {
        img: IMG.bund,
        title: { zh: "上海文化体验 · 1–2 日", en: "Shanghai culture · 1–2 days" },
        sub: { zh: "外滩建筑 → 衡复风貌 → 当代文化", en: "Bund → Hengfu → contemporary culture" },
      },
      mapPins: [
        { left: "62%", top: "40%", label: { zh: "外滩", en: "Bund" } },
        { left: "70%", top: "38%", label: { zh: "陆家嘴", en: "Lujiazui" } },
        { left: "40%", top: "52%", label: { zh: "武康路", en: "Wukang" } },
        { left: "48%", top: "58%", label: { zh: "文化空间", en: "Culture" } },
      ],
      places: [
        { tag: { zh: "空间叙事", en: "Spatial" }, tagClass: "accent", title: { zh: "外滩建筑群", en: "The Bund" }, sub: { zh: "岸线 · 立面 · 对望", en: "Waterfront · façades · facing" }, img: IMG.bund, prompt: { zh: "外滩：历史立面序列与对岸天际线如何形成对话", en: "Bund: historic façade sequence in dialogue with the skyline" } },
        { tag: { zh: "风貌区", en: "District" }, title: { zh: "武康路 / 衡复", en: "Wukang / Hengfu" }, sub: { zh: "街道尺度 · 海派生活", en: "Street scale · Haipai life" }, img: IMG.wukang, prompt: { zh: "武康路文化漫步：街道宽度、建筑退界与生活氛围", en: "Wukang walk: street width, setbacks, lived atmosphere" } },
        { tag: { zh: "文化体验", en: "Culture" }, title: { zh: "当代文化空间", en: "Contemporary space" }, sub: { zh: "博物馆 / 艺术空间", en: "Museum / art space" }, img: IMG.museum, prompt: { zh: "推荐一个上海当代文化空间，并讲解展陈与流线", en: "Recommend a Shanghai contemporary cultural space and its flow" } },
        { tag: { zh: "城市", en: "City" }, title: { zh: "陆家嘴天际线", en: "Lujiazui skyline" }, sub: { zh: "现代性景观 · 观景位置", en: "Modern skyline · viewpoints" }, img: IMG.skyline, prompt: { zh: "从哪里看陆家嘴天际线最能理解上海现代性", en: "Best viewpoints to read Shanghai modernity in the skyline" } },
        { tag: { zh: "巷弄", en: "Lane" }, title: { zh: "石库门肌理（选）", en: "Shikumen fabric (opt.)" }, sub: { zh: "里弄生活 · 城市基因", en: "Lilong life · urban DNA" }, img: IMG.hutong, prompt: { zh: "石库门/里弄如何作为上海城市基因被体验", en: "How shikumen / lilong can be experienced as Shanghai’s urban DNA" } },
        { tag: { zh: "体验", en: "Experience" }, title: { zh: "夜景与节奏", en: "Night rhythm" }, sub: { zh: "何时看 · 如何走", en: "When to look · how to walk" }, img: IMG.shanghaiNight, prompt: { zh: "上海夜景文化体验：路线节奏与停留点", en: "Shanghai night culture: route pace and pause points" } },
      ],
    },
  };

  function cityData() {
    return cities[state.where] || cities.北京;
  }

  function exploreItems(cityId) {
    const d = cities[cityId] || cities.北京;
    const covers = {
      architecture: "assets/explore-architecture-v3.png",
      culture: "assets/explore-culture-v3.png",
      technology: "assets/explore-technology-v4.png",
      modern: "assets/explore-modern-v4.png",
      food: "assets/explore-food-v3.png",
      slow: "assets/explore-slow-v3.png",
    };
    const rows = {
      "北京": [
        ["architecture", "故宫与中轴古建", "Imperial architecture", "从屋顶、斗拱、院落到礼仪轴线，理解古建筑如何组织权力与人的行走。", "Read roofs, brackets, courtyards and the ritual axis as a spatial system.", IMG.forbiddenCity],
        ["culture", "汉服礼仪与书法", "Hanfu ritual & calligraphy", "通过服装形制、礼仪表演与书法体验进入传统文化，而不是停留在拍照打卡。", "Enter tradition through dress, ritual performance and guided calligraphy—not costume snapshots.", IMG.hutong],
        ["technology", "首钢园与未来城市", "Shougang & future Beijing", "工业遗产、冬奥设施与数字科技叠加，观察北京如何更新旧城市空间。", "Industrial heritage, Olympic infrastructure and digital culture reveal how Beijing renews itself.", IMG.beijingNight],
        ["modern", "当代建筑空间", "Contemporary architecture", "从国家大剧院到银河 SOHO，阅读曲面、公共性与超大城市尺度。", "Read curves, publicness and megacity scale from the NCPA to Galaxy SOHO.", IMG.museum],
        ["food", "烤鸭、肉夹馍与京味糕点", "Roast duck, roujiamo & pastries", "从烤鸭刀工到胡同糕点铺，把味觉放回街区、时令和手艺的语境。", "Put flavor back into neighborhood, season and craft—from roast-duck carving to courtyard pastries.", IMG.tea],
        ["slow", "胡同、玄学与城市日常", "Hutongs, divination & daily life", "慢走胡同，理解院落生活，也可体验传统命理、占卜与民俗叙事。", "Walk slowly through courtyard life, with optional folk divination and cosmology interpreted in context.", IMG.forbiddenCorner],
      ],
      "苏州": [
        ["architecture", "古典园林与现代博物馆", "Gardens & modern museum", "古典园林的借景、框景，与苏州博物馆的现代几何形成跨时代对话。", "Borrowed views and framed scenes meet the modern geometry of Suzhou Museum.", IMG.lakePavilion],
        ["culture", "昆曲、苏绣与扎染", "Kunqu, embroidery & indigo", "从昆曲身段到苏绣针脚和扎染工坊，以手和身体理解江南文化。", "Understand Jiangnan through Kunqu movement, Su embroidery stitches and indigo workshops.", IMG.classicalGarden],
        ["technology", "运河数字体验", "Canal digital experience", "用数字地图与沉浸展览理解水系、贸易和当代城市治理。", "Use spatial media and immersive exhibitions to read canals, trade and the city today.", IMG.waterLane],
        ["modern", "苏州当代空间", "Contemporary Suzhou", "工业园区、文化中心与滨水公共空间展示一座古城的现代一面。", "Industrial parks, cultural venues and waterfront public space reveal the modern city.", IMG.gardenPath],
        ["food", "小笼包、糕点与时令苏味", "Xiaolongbao & seasonal Suzhou", "小笼包、苏式糕点与时令面点，适合以一条小尺度味觉路线慢慢体验。", "Explore xiaolongbao, Suzhou pastries and seasonal noodles along a compact tasting route.", IMG.tea],
        ["slow", "茶、评弹与水巷", "Tea, pingtan & water lanes", "在园林茶席、评弹和水巷步行之间留出停顿，感受苏州的低速节奏。", "Leave room to pause between garden tea, pingtan storytelling and canal-side walks.", IMG.rockery],
      ],
      "上海": [
        ["architecture", "石库门与海派建筑", "Shikumen & Haipai architecture", "从里弄石库门到外滩立面，观察居住、商业与城市身份如何交织。", "See housing, commerce and identity intertwine from shikumen lanes to Bund façades.", IMG.bund],
        ["culture", "旗袍、银饰与海派手工", "Qipao & urban craft", "以旗袍工艺、首饰制作和海派表演理解现代中国的审美流动。", "Read modern Chinese aesthetics through qipao tailoring, jewelry craft and performance.", IMG.wukang],
        ["technology", "陆家嘴与智能城市", "Lujiazui & smart city", "高密度天际线、交通系统与数字生活共同构成上海的未来城市切面。", "Skyline density, mobility and digital life form a vivid section through future Shanghai.", IMG.skyline],
        ["modern", "西岸与当代艺术空间", "West Bund contemporary spaces", "由旧工业结构改造出的美术馆和滨水空间，连接艺术、建筑与公共生活。", "Converted industrial structures connect art, architecture and public waterfront life.", IMG.museum],
        ["food", "小笼包、生煎与本帮味", "Xiaolongbao & local flavors", "从小笼包、生煎到糕点与凉菜，用清晨、午后和夜宵拆解上海味觉。", "Decode Shanghai through breakfast dumplings, pastries, cold dishes and late-night bites.", IMG.shanghaiNight],
        ["slow", "梧桐街区慢行", "Slow walks under plane trees", "避开清单，在武康路、衡复里弄与小店之间体验城市生活的细部。", "Skip the checklist and notice everyday detail along Wukang Road and Hengfu lanes.", IMG.hutong],
      ],
    };
    const supplementalRows = {
      "北京": [
        ["architecture", "天坛与祭祀空间", "Temple of Heaven", "沿圜丘、皇穹宇和祈年殿读取天、地、人之间的礼仪秩序。", "Read the ritual relationship between heaven, earth and people through the Circular Mound, Imperial Vault and Hall of Prayer.", IMG.forbiddenCorner, "assets/explore-beijing-temple-heaven-v1.png"],
        ["architecture", "颐和园与皇家园林", "Summer Palace gardens", "从长廊、昆明湖与万寿山理解皇家园林如何组织视线、路径与山水。", "See how corridor, lake and hill compose movement, views and imperial landscape.", IMG.lakePavilion, "assets/explore-beijing-summer-palace-v1.png"],
        ["architecture", "首钢园城市更新", "Shougang urban renewal", "保留工业骨架并植入公共文化与冬奥设施，观察旧工业区如何获得新生活。", "Industrial frames, public culture and Olympic reuse show how an old production district gains new life.", IMG.beijingNight, "assets/explore-beijing-shougang-v1.png"],
        ["architecture", "国家大剧院", "National Centre for the Performing Arts", "以水面、曲面外壳与地下入口理解当代公共建筑的纪念性。", "Read monumentality through the reflecting pool, curved shell and subterranean entrance.", IMG.museum, "assets/explore-beijing-ncpa-v1.png"],
        ["culture", "唐宋明清服饰", "Dress through four dynasties", "比较唐、宋、明、清的轮廓、层次、色彩与礼仪语境，不把传统服饰简化为拍照道具。", "Compare silhouette, layering, color and etiquette across Tang, Song, Ming and Qing dress.", "assets/ip-character-ming-cutout-v1.png"],
        ["culture", "扎染手作", "Indigo dyeing workshop", "从扎结、浸染到氧化显色，理解纹样如何由手工控制与偶然共同形成。", "Follow tying, dyeing and oxidation to see how pattern emerges from control and chance.", IMG.tea],
        ["culture", "银饰打造", "Silversmithing", "认识錾刻、锤揲与焊接等基础工序，并理解银饰与地方身份的关系。", "Learn chasing, hammering and joining while reading silverwork as local identity.", IMG.classicalGarden],
        ["culture", "书法入门", "Calligraphy session", "从执笔、运腕与单字结构进入书法，让一次体验连接文字、身体与时间。", "Enter calligraphy through grip, wrist movement and character structure—linking writing, body and time.", IMG.hutong],
        ["culture", "民俗与占卜解读", "Folk cosmology & divination", "在历史与民俗语境中理解命理、节气和占卜文化，避免神秘化与消费化。", "Understand divination, seasonal thought and folk cosmology in context rather than as spectacle.", IMG.rockery],
        ["food", "陕西肉夹馍", "Shaanxi roujiamo", "从白吉馍、腊汁肉与街头摊档理解西北主食的结构与风味。", "Read a northwestern staple through baiji bread, braised meat and street-shop craft.", IMG.tea],
        ["food", "小笼包", "Xiaolongbao", "观察薄皮、汤汁和褶口的手艺，并区分江南不同城市的小笼风格。", "Notice wrapper, broth and pleating while comparing regional xiaolongbao traditions.", IMG.tea],
        ["food", "凉皮与凉菜", "Liangpi & cold dishes", "以调味、质地与季节性为线索，理解西北凉皮和四川凉菜的差异。", "Compare seasoning, texture and seasonality across northwestern liangpi and Sichuan cold dishes.", IMG.tea],
        ["food", "烧鸭与烤鸭", "Roast duck traditions", "从炉型、火候、片制和佐食方式分辨不同城市的烧鸭传统。", "Compare ovens, heat, carving and accompaniments across regional roast-duck traditions.", IMG.tea],
        ["food", "江南糕点", "Jiangnan pastries", "从时令、馅料和米麦比例认识江南糕点与城市日常。", "Understand Jiangnan pastries through season, fillings and the balance of rice and wheat.", IMG.tea],
        ["technology", "陆家嘴未来天际线", "Lujiazui skyline", "把超高层、轨道交通与滨水公共空间作为一个立体城市系统来阅读。", "Read towers, transit and waterfront public space as one vertical urban system.", IMG.skyline],
        ["technology", "奥体中心与大型赛事", "Olympic urban systems", "从场馆结构、客流组织与赛后利用理解大型赛事如何改变城市。", "See how structure, crowd flow and post-event reuse reshape a city.", IMG.beijingNight],
        ["technology", "机场作为城市门户", "Airport as urban gateway", "从大兴机场的放射形平面、换乘距离与结构系统理解超级交通建筑。", "Read Daxing Airport through radial planning, transfer distance and megastructure.", IMG.museum],
        ["technology", "滨水更新", "Waterfront regeneration", "比较河岸工业遗产、艺术设施与慢行系统如何共同形成新的公共生活。", "Compare industrial heritage, cultural venues and slow mobility in regenerated waterfronts.", IMG.waterLane],
        ["slow", "长城徒步", "Great Wall walking", "选择与体力相符的城段和时段，把山势、关隘与防御体系串成一次慢读。", "Choose a section and pace that reveal terrain, passes and defense as a connected system.", IMG.forbiddenCorner],
        ["slow", "瘦西湖晨游", "Slender West Lake morning", "在游客高峰前沿水岸慢行，以桥、塔与柳岸构成连续的园林视线。", "Walk before the crowds and follow a continuous garden sequence of bridges, towers and willow banks.", IMG.lakePavilion],
        ["slow", "胡同漫步", "Hutong walk", "避开打卡主街，在院门、转角、树荫和社区小店之间理解北京日常尺度。", "Leave the checklist streets and read Beijing through gates, corners, shade and neighborhood shops.", IMG.hutong],
        ["slow", "园林晨游", "Garden at first light", "在清晨低密度时段观察借景、框景与光线变化，让空间而不是清单主导行走。", "Visit at first light and let borrowed views, frames and changing light guide the walk.", IMG.gardenPath],
      ],
      "苏州": [
        ["architecture", "拙政园", "Humble Administrator’s Garden", "以水面为中心读取厅堂、廊桥和植物之间层层展开的借景。", "Read halls, bridges and planting as layered borrowed views organized around water.", IMG.classicalGarden],
        ["architecture", "苏州博物馆", "Suzhou Museum", "比较传统坡屋顶意象、白墙灰线与现代几何采光。", "Compare roof memory, white walls, dark lines and contemporary geometric daylight.", IMG.museum],
        ["culture", "汉服与园林礼仪", "Hanfu & garden etiquette", "用克制的服饰体验理解园林中的身体尺度与礼仪，而不是只完成摆拍。", "Use restrained dress interpretation to understand bodily scale and etiquette in the garden.", "assets/ip-character-song-cutout-v1.png"],
        ["culture", "苏绣与扎染", "Embroidery & indigo", "从针脚、丝线光泽与染色偶然性认识江南手艺。", "Read Jiangnan craft through stitches, silk sheen and the controlled accidents of dye.", IMG.classicalGarden],
        ["food", "小笼包与苏式糕点", "Xiaolongbao & Suzhou pastry", "把汤包、糕点和时令面组织成一条短而有节奏的味觉路线。", "Build a compact tasting route around soup dumplings, pastries and seasonal noodles.", IMG.tea],
        ["technology", "园区与文化新城", "SIP & cultural new town", "观察现代产业、轨道交通和公共文化空间如何在古城之外形成新中心。", "See industry, metro systems and cultural venues form a new center beyond the old city.", IMG.skyline],
        ["slow", "园林晨游与水巷", "Garden morning & canals", "以晨游、茶席和水巷步行连接园林内部与日常城市。", "Connect garden interiors with everyday city life through morning walks, tea and canals.", IMG.waterLane],
      ],
      "上海": [
        ["architecture", "外滩万国建筑群", "Bund historic façades", "沿岸线比较不同时期的立面、材料与城市权力表达。", "Compare façade, material and civic ambition along the waterfront sequence.", IMG.bund],
        ["architecture", "新天地城市更新", "Xintiandi renewal", "讨论石库门保护、商业改造与社区记忆之间的张力。", "Read the tension between shikumen conservation, commercial reuse and community memory.", IMG.wukang],
        ["culture", "旗袍与海派表演", "Qipao & Haipai performance", "从剪裁、身体姿态和舞台文化理解近现代上海审美。", "Understand modern Shanghai aesthetics through tailoring, posture and performance culture.", "assets/ip-character-qing-v1.png"],
        ["culture", "手作与书法", "Craft & calligraphy", "在当代工作室中体验传统手艺如何转化为今天的生活方式。", "See how traditional craft becomes contemporary urban practice in local studios.", IMG.classicalGarden],
        ["food", "小笼包与本帮凉菜", "Xiaolongbao & local cold dishes", "从早餐到夜宵，以汤包、生煎、糕点和凉菜理解上海味觉节奏。", "Read Shanghai’s daily rhythm from breakfast dumplings to pastries, cold dishes and late-night bites.", IMG.tea],
        ["technology", "陆家嘴与智慧交通", "Lujiazui & smart mobility", "把高密度天际线、轨道换乘与数字生活放在同一城市剖面中理解。", "Read density, metro transfers and digital life within one urban section.", IMG.skyline],
        ["slow", "滨水与梧桐街区", "Waterfront & plane-tree streets", "在西岸滨水和衡复街区之间切换尺度，感受快城市中的慢生活。", "Shift scale between West Bund waterfront and Hengfu streets to find slowness inside the fast city.", IMG.waterLane],
      ],
    };
    const cityRows = [...(rows[cityId] || rows["北京"]), ...(supplementalRows[cityId] || [])];
    return cityRows.map((r, index) => ({
      category: r[0], title: { zh: r[1], en: r[2] }, sub: { zh: r[3], en: r[4] },
      detail: { zh: `${r[3]} 详情页将真实场景、空间线索、体验方式与实用建议组织在一起。`, en: `${r[4]} The detail view connects real scenes, spatial clues, ways to experience it and practical advice.` },
      tag: { zh: r[1], en: r[2] }, img: r[5] || d.places[index]?.img,
      cover: r[6] || covers[r[0]],
      prompt: { zh: `把“${r[1]}”加入我的${cityId}旅行规划`, en: `Add “${r[2]}” to my ${I18N.cityNames.en[cityId]} trip` },
    }));
  }

  function whenValue() {
    return t("whenOpts")[state.whenKey];
  }
  function whoValue() {
    return t("whoOpts")[state.whoKey];
  }
  function budgetValue() {
    return t("budgetOpts")[state.budgetKey];
  }

  function applyStaticUI() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t("docTitle");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && I18N.ui[lang][key] != null) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (key) el.setAttribute("title", t(key));
    });

    const tabs = document.querySelectorAll(".city-tab");
    const tabKeys = ["tabBeijing", "tabSuzhou", "tabShanghai"];
    tabs.forEach((tab, i) => {
      if (tabKeys[i]) tab.textContent = t(tabKeys[i]);
    });

    if (els.langBtn) {
      els.langBtn.textContent = t("langSwitch");
      els.langBtn.setAttribute("aria-label", t("langAria"));
    }
    if (els.berdLangBtn) {
      els.berdLangBtn.textContent = t("langSwitch");
      els.berdLangBtn.setAttribute("aria-label", t("langAria"));
    }
    document.querySelectorAll(".berd-values article").forEach((article, index) => {
      const title = t("landingValues")?.[index];
      const desc = t("landingValueDescs")?.[index];
      if (title) article.querySelector("h3").textContent = title;
      if (desc) article.querySelector("p").textContent = desc;
    });

    if (els.mapToggle) {
      els.mapToggle.textContent = mapOpen ? t("mapClose") : t("map");
    }
  }

  function syncFilters() {
    els.filterWhere.textContent = cityName(state.where);
    els.filterWhen.textContent = whenValue();
    els.filterWho.textContent = whoValue();
    els.filterBudget.textContent = budgetValue();
    if (els.locBtn) els.locBtn.textContent = `${cityName(state.where)} ▾`;
  }

  function bindPromptButtons(root) {
    root.querySelectorAll("[data-prompt]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        ask(el.getAttribute("data-prompt"));
      });
    });
  }

  function placeComposer(mode) {
    const composer = els.composer;
    if (!composer) return;
    const chatting = mode === "chat";
    if (chatting && els.composerDock) {
      els.composerDock.hidden = false;
      if (composer.parentElement !== els.composerDock) els.composerDock.appendChild(composer);
      composer.classList.remove("composer-hero");
    } else if (els.empty) {
      if (els.composerDock) els.composerDock.hidden = true;
      if (composer.parentElement !== els.empty) {
        if (els.suggestRow) els.empty.insertBefore(composer, els.suggestRow);
        else els.empty.appendChild(composer);
      }
      composer.classList.add("composer-hero");
    }
    els.chatPane?.classList.toggle("is-chatting", chatting);
  }

  function showChat() {
    if (els.empty) {
      els.empty.hidden = true;
      els.empty.style.display = "none";
    }
    if (els.messages) {
      els.messages.hidden = false;
      els.messages.style.display = "grid";
    }
    placeComposer("chat");
  }

  function showEmptyChat() {
    if (els.messages) {
      els.messages.innerHTML = "";
      els.messages.hidden = true;
      els.messages.style.display = "none";
    }
    if (els.empty) {
      els.empty.hidden = false;
      els.empty.style.display = "";
    }
    placeComposer("empty");
    els.input?.focus();
  }

  function addMessage(role, text, route) {
    showChat();
    const wrap = document.createElement("div");
    wrap.className = `msg ${role}`;
    const who = document.createElement("div");
    who.className = "who";
    who.textContent = role === "user" ? t("you") : t("assistant");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    wrap.append(who, bubble);

    if (route?.length) {
      const card = document.createElement("div");
      card.className = "route-card";
      const ol = document.createElement("ol");
      route.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        ol.appendChild(li);
      });
      const foot = document.createElement("div");
      foot.className = "route-foot";
      foot.textContent = t("routeFoot");
      card.append(ol, foot);
      bubble.appendChild(card);
    }

    els.messages.appendChild(wrap);
    els.scroll.scrollTop = els.scroll.scrollHeight;
  }

  function addAgentWorkflow(trip) {
    if (!trip || !els.messages) return;
    trip.agentState = {
      stage: "roughly_approved",
      planStatus: "draft_ready",
      visualStatus: trip.visualMap ? "ready" : "not_started",
      readinessStatus: "review_required",
      updatedAt: Date.now(),
    };
    upsertTrip(trip);

    const card = document.createElement("section");
    card.className = "agent-workflow-card";
    card.innerHTML = `
      <div class="agent-workflow-head">
        <span>${lang === "zh" ? "MULTI-AGENT 编排" : "MULTI-AGENT ORCHESTRATION"}</span>
        <b>${lang === "zh" ? "草案已完成" : "Draft ready"}</b>
      </div>
      <div class="agent-stage-row">
        <span class="done">${lang === "zh" ? "建筑知识" : "Architecture"}</span>
        <span class="done">${lang === "zh" ? "路线规划" : "Planning"}</span>
        <span class="done">${lang === "zh" ? "可行性审核" : "Validation"}</span>
        <span>${lang === "zh" ? "出行准备" : "Readiness"}</span>
        <span>${lang === "zh" ? "风险检查" : "Risk check"}</span>
        <span>${lang === "zh" ? "视觉策划" : "Visual"}</span>
      </div>
      <p>${lang === "zh"
        ? "这版行程已经形成完整路线。是否生成一张与首页同风格的手绘旅游规划图？你也可以先查看入华准备事项与风险提醒。"
        : "This itinerary now has a complete route. Generate an illustrated travel map in the same style as the homepage, or review China travel readiness first?"}</p>
      <div class="agent-workflow-actions">
        <button type="button" data-agent-action="visual">${lang === "zh" ? "生成手绘旅行图" : "Generate illustrated map"}</button>
        <button type="button" data-agent-action="readiness">${lang === "zh" ? "查看出行准备" : "Review readiness"}</button>
      </div>
      <div class="agent-readiness" hidden>
        <h4>${lang === "zh" ? "出发前需要确认" : "Before you go"}</h4>
        <ul>
          <li><b>${lang === "zh" ? "必须核验" : "Verify"}</b>${lang === "zh" ? "护照、签证或免签条件，以及入境与离境路线。" : "Passport, visa or visa-free eligibility, entry and onward itinerary."}</li>
          <li><b>${lang === "zh" ? "建议完成" : "Prepare"}</b>${lang === "zh" ? "住宿登记、实名购票、景区预约、保险和至少两种支付方式。" : "Accommodation registration, real-name tickets, reservations, insurance and two payment methods."}</li>
          <li><b>${lang === "zh" ? "现场注意" : "On the ground"}</b>${lang === "zh" ? "天气、人流、饮食过敏、文物保护规则及紧急联系方式。" : "Weather, crowds, allergies, heritage-site rules and emergency contacts."}</li>
        </ul>
        <small>${lang === "zh" ? "政策信息需要在出发前再次从官方渠道核验。" : "Policy information must be rechecked against official sources before departure."}</small>
      </div>`;
    card.querySelector('[data-agent-action="readiness"]')?.addEventListener("click", (event) => {
      const box = card.querySelector(".agent-readiness");
      box.hidden = !box.hidden;
      event.currentTarget.textContent = box.hidden
        ? (lang === "zh" ? "查看出行准备" : "Review readiness")
        : (lang === "zh" ? "收起准备事项" : "Hide readiness");
    });
    card.querySelector('[data-agent-action="visual"]')?.addEventListener("click", (event) => {
      trip.visualMap = "assets/garden-handscroll-v1.png";
      trip.agentState.visualStatus = "ready";
      trip.agentState.stage = "visual_review";
      trip.updatedAt = Date.now();
      upsertTrip(trip);
      event.currentTarget.disabled = true;
      event.currentTarget.textContent = lang === "zh" ? "旅行图已生成" : "Map generated";
      const preview = document.createElement("figure");
      preview.className = "agent-visual-preview";
      preview.innerHTML = `<img src="${trip.visualMap}" alt="${lang === "zh" ? "手绘旅行规划图" : "Illustrated travel map"}" /><figcaption>${lang === "zh" ? "视觉策划 Agent · 与首页插画风格一致" : "Visual Agent · matched to the homepage illustration style"}</figcaption>`;
      card.appendChild(preview);
      renderHomeTripCards();
    });
    els.messages.appendChild(card);
    els.scroll.scrollTop = els.scroll.scrollHeight;
  }

  function addAgentProfile(result) {
    const profile = result.profile || {};
    const value = (v) => v == null || v === "" ? (lang === "zh" ? "待确认" : "To confirm") : v;
    const listValue = (v) => Array.isArray(v) && v.length ? v.join(" · ") : (lang === "zh" ? "待确认" : "To confirm");
    const card = document.createElement("section");
    card.className = "agent-profile-card";
    card.innerHTML = `
      <div class="agent-profile-head"><span>${lang === "zh" ? "客户旅行档案" : "TRAVELER PROFILE"}</span><b>${result.stage || "collecting"}</b></div>
      <dl>
        <div><dt>${lang === "zh" ? "目的地" : "Destination"}</dt><dd>${value(profile.destination)}</dd></div>
        <div><dt>${lang === "zh" ? "人数" : "Travelers"}</dt><dd>${value(profile.travelers)}</dd></div>
        <div><dt>${lang === "zh" ? "日期 / 时长" : "Dates / duration"}</dt><dd>${value(profile.dates)}</dd></div>
        <div><dt>${lang === "zh" ? "国籍" : "Nationality"}</dt><dd>${value(profile.nationality)}</dd></div>
        <div><dt>${lang === "zh" ? "偏好" : "Preferences"}</dt><dd>${listValue(profile.preferences)}</dd></div>
        <div><dt>${lang === "zh" ? "特殊备注" : "Special notes"}</dt><dd>${listValue(profile.specialNotes)}</dd></div>
      </dl>
      ${result.missingFields?.length ? `<p>${lang === "zh" ? "仍需确认：" : "Still needed: "}${result.missingFields.join(" · ")}</p>` : ""}`;
    els.messages.appendChild(card);
  }

  function parseDaysLabel(label, fallback = 2) {
    const s = String(label || "");
    const m = s.match(/(\d+)\s*[–-]?\s*(\d+)?/);
    if (!m) return fallback;
    return Number(m[2] || m[1]) || fallback;
  }

  function inferDaysFromPrompt(prompt, fallback = 2) {
    const p = String(prompt || "");
    if (/半日|半天|half[- ]?day/i.test(p)) return 1;
    if (/一日|1\s*日|一天|1\s*天|1[- ]?day/i.test(p)) return 1;
    if (/两日|2\s*日|两天|2\s*天|2[- ]?day/i.test(p)) return 2;
    if (/三日|3\s*日|三天|3\s*天|3[- ]?day/i.test(p)) return 3;
    if (/五日|5\s*日|五天|5\s*天|5[- ]?day/i.test(p)) return 5;
    const n = p.match(/(\d+)\s*(日|天|days?)/i);
    if (n) return Number(n[1]) || fallback;
    return fallback;
  }

  function inferCityId(prompt, fallback = state.where) {
    const p = String(prompt || "");
    if (/天津|Tianjin|西安|Xi.?an|成都|Chengdu|广州|Guangzhou|深圳|Shenzhen|贵州|Guizhou|广西|Guangxi|桂林|阳朔/i.test(p)) {
      return null; // multi-city / exhibition — place comes from title
    }
    if (/苏州|Suzhou|园林|拙政|garden/i.test(p)) return "苏州";
    if (/上海|Shanghai|外滩|Bund|武康|Wukang/i.test(p)) return "上海";
    if (/北京|Beijing|故宫|Palace|胡同|hutong|中轴|axis/i.test(p)) return "北京";
    return fallback;
  }

  function buildTripTitle(placeZh, placeEn) {
    return {
      zh: `${placeZh}之旅`,
      en: `Trip to ${placeEn}`,
    };
  }

  function showTripToast(tripId) {
    document.querySelector(".trip-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "trip-toast";
    toast.innerHTML = `<span>${t("tripSaved")}</span><button type="button">${t("viewTrip")}</button>`;
    toast.querySelector("button")?.addEventListener("click", () => {
      toast.remove();
      const trip = trips.find((x) => x.id === tripId);
      if (trip) openTripFlow(trip);
      else {
        tripViewMode = "list";
        showPanel("trips");
        highlightTrip(tripId);
      }
    });
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }

  function highlightTrip(tripId) {
    const card = els.tripsProjectList?.querySelector(`[data-trip-id="${tripId}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function upsertTrip(trip) {
    const existing = trips.findIndex((x) => x.id === trip.id);
    if (existing >= 0) trips[existing] = trip;
    else trips.unshift(trip);
    saveTrips();
    return trip;
  }

  function createTripProject({
    id,
    placeZh,
    placeEn,
    days,
    img,
    steps = [],
    daysPlan = null,
    summary = null,
    prompt = "",
    booked = false,
    source = "agent",
    prefsFingerprint = "",
    goToTrips = false,
    toast = true,
  }) {
    const titles = buildTripTitle(placeZh, placeEn);
    const plan =
      daysPlan ||
      (steps.length
        ? [
            {
              day: { zh: `第 1 天`, en: "Day 1" },
              items: { zh: steps, en: steps },
            },
          ]
        : []);
    const trip = {
      id: id || `trip-${Date.now()}`,
      createdAt: Date.now(),
      booked: !!booked,
      source,
      prefsFingerprint,
      place: { zh: placeZh, en: placeEn },
      title: titles,
      summary:
        summary ||
        {
          zh: steps.slice(0, 2).join(" · ") || `${placeZh}深度行程`,
          en: steps.slice(0, 2).join(" · ") || `Deep trip in ${placeEn}`,
        },
      days: Number(days) || 2,
      img:
        img ||
        cities[state.where]?.trip?.img ||
        IMG.forbiddenCity,
      steps,
      daysPlan: plan,
      prompt,
    };
    upsertTrip(trip);
    if (goToTrips) {
      openTripFlow(trip);
    } else if (toast) {
      showTripToast(trip.id);
      if (panel === "home") renderHomeTripCards();
      if (panel === "trips" && tripViewMode === "list") renderTripsList();
    }
    return trip;
  }

  function prefsFingerprint() {
    const savedSig = saved
      .slice(0, 8)
      .map((x) => x.id)
      .join("|");
    return `${IMG_CATALOG_VER}|${state.where}|${state.whenKey}|${state.whoKey}|${state.budgetKey}|${savedSig}`;
  }

  function habitInterestLabels() {
    const labels = [];
    saved.slice(0, 6).forEach((item) => {
      const title = pick(item.title);
      if (title) labels.push(title);
    });
    return labels;
  }

  function preferredDaysFromWhen() {
    if (state.whenKey === 1) return 2;
    if (state.whenKey === 2) return 3;
    return 2;
  }

  function resolveCityIdFromTrip(trip) {
    const placeKey = trip?.place?.zh || state.where;
    if (placeKey in cities) return placeKey;
    if (/北京|Beijing|故宫|Palace|胡同/i.test(placeKey)) return "北京";
    if (/苏州|Suzhou|园林|Garden/i.test(placeKey)) return "苏州";
    if (/上海|Shanghai|外滩|Bund/i.test(placeKey)) return "上海";
    return state.where in cities ? state.where : "北京";
  }

  function matchPlaceImage(cityId, text) {
    const places = cities[cityId]?.places || [];
    const hay = String(text || "");
    const hit = places.find(
      (p) => hay.includes(p.title.zh) || hay.includes(p.title.en) || hay.includes(p.sub.zh) || hay.includes(p.sub.en)
    );
    return hit?.img || null;
  }

  function resolveStepImage(trip, dayIdx, dayPlan) {
    if (dayPlan?.img) return dayPlan.img;
    const cityId = resolveCityIdFromTrip(trip);
    const items = pick(dayPlan?.items) || [];
    const text = Array.isArray(items) ? items.join(" ") : String(items || "");
    return (
      matchPlaceImage(cityId, text) ||
      cities[cityId]?.places?.[dayIdx]?.img ||
      trip.img ||
      cities[cityId]?.trip?.img ||
      IMG.forbiddenCity
    );
  }

  function buildDaysPlanFromCity(cityId, days) {
    const data = cities[cityId] || cities["北京"];
    const places = data.places || [];
    const n = Math.max(1, Math.min(Number(days) || 2, 5));
    return Array.from({ length: n }, (_, i) => {
      const chunk = places.slice(i * 2, i * 2 + 3);
      const use = chunk.length ? chunk : places.slice(0, 3);
      return {
        day: { zh: `第 ${i + 1} 天`, en: `Day ${i + 1}` },
        items: {
          zh: use.map((p) => `${p.title.zh} · ${p.sub.zh}`),
          en: use.map((p) => `${p.title.en} · ${p.sub.en}`),
        },
        img: use[0]?.img || data.trip.img,
      };
    });
  }

  function generateAiTripFromPrefs({ force = false } = {}) {
    const cityId = state.where in cities ? state.where : "北京";
    const data = cities[cityId];
    const days = preferredDaysFromWhen();
    const fp = prefsFingerprint();
    if (!force && localStorage.getItem(DISMISSED_AI_TRIP_KEY) === fp) return null;
    if (force) localStorage.removeItem(DISMISSED_AI_TRIP_KEY);
    const existing = trips.find((x) => x.id === AI_TRIP_ID);
    if (!force && existing?.prefsFingerprint === fp && existing?.daysPlan?.length) {
      return existing;
    }

    const interests = habitInterestLabels();
    const placeZh = I18N.cityNames.zh[cityId];
    const placeEn = I18N.cityNames.en[cityId];
    const daysPlan = buildDaysPlanFromCity(cityId, days);
    const habitNoteZh = interests.length
      ? `结合收藏：${interests.slice(0, 3).join("、")}`
      : "侧重空间叙事与文化体验，少购物打卡";
    const habitNoteEn = interests.length
      ? `Tuned with saves: ${interests.slice(0, 3).join(", ")}`
      : "Focus on spatial narrative & culture, not shopping checklists";

    const whoOpts = I18N.ui.zh.whoOpts;
    const whenOpts = I18N.ui.zh.whenOpts;
    const budgetOpts = I18N.ui.zh.budgetOpts;
    const whoEn = I18N.ui.en.whoOpts[state.whoKey];
    const whenEn = I18N.ui.en.whenOpts[state.whenKey];
    const budgetEn = I18N.ui.en.budgetOpts[state.budgetKey];

    const summary = {
      zh: `${placeZh} · ${days} 日 · ${whoOpts[state.whoKey]} · ${whenOpts[state.whenKey]} · 预算${budgetOpts[state.budgetKey]}。${habitNoteZh}。${data.trip.sub.zh}`,
      en: `${placeEn} · ${days} days · ${whoEn} · ${whenEn} · ${budgetEn}. ${habitNoteEn}. ${data.trip.sub.en}`,
    };

    const trip = {
      id: AI_TRIP_ID,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      pinnedAt: existing?.pinnedAt || 0,
      booked: false,
      source: "ai-prefs",
      prefsFingerprint: fp,
      place: { zh: placeZh, en: placeEn },
      title: {
        zh: `${placeZh}偏好行程 · ${days} 日`,
        en: `${placeEn} for you · ${days} days`,
      },
      summary,
      days,
      img: data.trip.img,
      steps: daysPlan.flatMap((d) => d.items.zh),
      daysPlan,
      prompt: summary.zh,
      habits: {
        zh: `偏好：${placeZh} · ${whoOpts[state.whoKey]} · ${whenOpts[state.whenKey]} · 预算${budgetOpts[state.budgetKey]}${interests.length ? ` · ${habitNoteZh}` : ""}`,
        en: `Prefs: ${placeEn} · ${whoEn} · ${whenEn} · ${budgetEn}${interests.length ? ` · ${habitNoteEn}` : ""}`,
      },
    };

    upsertTrip(trip);
    activeTripId = trip.id;
    return trip;
  }

  function createTripFromPrompt(prompt, reply, opts = {}) {
    if (!reply?.route?.length) return null;
    const cityId = inferCityId(prompt, state.where);
    let placeZh = I18N.cityNames.zh[state.where] || state.where;
    let placeEn = I18N.cityNames.en[state.where] || state.where;
    let img = cities[state.where]?.trip?.img;

    if (cityId && cities[cityId]) {
      placeZh = I18N.cityNames.zh[cityId];
      placeEn = I18N.cityNames.en[cityId];
      img = cities[cityId].trip.img;
      state.where = cityId;
    }

    const days = inferDaysFromPrompt(prompt, reply.route.length >= 4 ? 2 : 1);
    const goToTrips = !!opts.goToTrips;
    return createTripProject({
      placeZh,
      placeEn,
      days,
      img,
      steps: reply.route,
      prompt,
      goToTrips,
      toast: !goToTrips,
    });
  }

  function createTripFromInspire(route, opts = {}) {
    const zh = route.zh;
    const en = route.en;
    const days = parseDaysLabel(zh.days, zh.daysPlan?.length || 3);
    const goToTrips = opts.goToTrips !== false;
    return createTripProject({
      id: `inspire-${route.key}`,
      placeZh: zh.title,
      placeEn: en.title,
      days,
      img: route.img,
      steps: (lang === "zh" ? zh : en).daysPlan.map((d) => `${d.day}: ${d.items[0]}`),
      prompt: zh.title,
      goToTrips,
      toast: !goToTrips,
    });
  }

  function tripCardLabel(trip) {
    const place = pick(trip.place);
    const days =
      lang === "zh" ? `${trip.days} ${t("tripDays")}` : `${trip.days} ${t("tripDays")}`;
    return `${place} · ${days}`;
  }

  function tripCardTitle(trip) {
    return pick(trip.title);
  }

  function normalizeTripDaysPlan(trip) {
    if (Array.isArray(trip.daysPlan) && trip.daysPlan.length) return trip.daysPlan;
    const steps = trip.steps || [];
    if (!steps.length) {
      return [
        {
          day: { zh: "第 1 天", en: "Day 1" },
          items: { zh: [], en: [] },
        },
      ];
    }
    return [
      {
        day: { zh: "第 1 天", en: "Day 1" },
        items: { zh: steps, en: steps },
      },
    ];
  }

  function showTripHint(msg) {
    if (!els.tripAiHint) return;
    els.tripAiHint.hidden = false;
    els.tripAiHint.textContent = msg;
    window.clearTimeout(showTripHint._t);
    showTripHint._t = window.setTimeout(() => {
      if (els.tripAiHint) els.tripAiHint.hidden = true;
    }, 2600);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stepImagesForTrip(trip) {
    const cityId = resolveCityIdFromTrip(trip);
    const places = cities[cityId]?.places || [];
    return places.map((p) => p.img).filter(Boolean);
  }

  function fillTripEditor(trip) {
    if (!trip || !els.tripAiTitle) return;
    activeTripId = trip.id;
    const plan = normalizeTripDaysPlan(trip);
    const cityId = resolveCityIdFromTrip(trip);
    const heroImg = trip.img?.includes("1508804185872") || trip.img?.includes("1555921015")
      ? cities[cityId]?.trip?.img || IMG.forbiddenCity
      : trip.img || cities[cityId]?.trip?.img || IMG.forbiddenCity;
    if (els.tripAiImg) {
      els.tripAiImg.src = heroImg;
      els.tripAiImg.alt = tripCardTitle(trip);
    }
    const badge = document.querySelector(".trip-ai-badge");
    if (badge) {
      badge.textContent =
        trip.source === "ai-prefs" || trip.id === AI_TRIP_ID
          ? t("tripAiBadge")
          : lang === "zh"
            ? "可编辑流程行程"
            : "Editable itinerary flow";
    }
    els.tripAiTitle.value = tripCardTitle(trip);
    if (els.tripAiSummary) els.tripAiSummary.value = pick(trip.summary) || "";
    if (els.tripAiDays) els.tripAiDays.value = String(trip.days || plan.length || 2);
    if (els.tripAiPlace) els.tripAiPlace.value = pick(trip.place) || "";

    // Keep hidden daysPlan mirror for older readers
    if (els.tripAiDaysPlan) {
      els.tripAiDaysPlan.innerHTML = plan
        .map((d, idx) => {
          const dayLabel = pick(d.day) || (lang === "zh" ? `第 ${idx + 1} 天` : `Day ${idx + 1}`);
          const items = pick(d.items) || [];
          const text = Array.isArray(items) ? items.join("\n") : String(items || "");
          return `
          <div class="trip-ai-day" data-day-idx="${idx}">
            <input class="trip-ai-day-label" type="text" value="${escapeHtml(dayLabel)}" />
            <textarea class="trip-ai-day-items" rows="3">${escapeHtml(text)}</textarea>
          </div>`;
        })
        .join("");
    }

    if (els.tripFlow) {
      els.tripFlow.innerHTML = plan
        .map((d, idx) => {
          const side = idx % 2 === 0 ? "right" : "left";
          const num = String(idx + 1).padStart(2, "0");
          const dayLabel = pick(d.day) || (lang === "zh" ? `第 ${idx + 1} 天` : `Day ${idx + 1}`);
          const items = pick(d.items) || [];
          const text = Array.isArray(items) ? items.join("\n") : String(items || "");
          const img = resolveStepImage(trip, idx, d);
          const copy = `
            <div class="trip-flow-copy is-${side === "right" ? "left" : "right"}">
              <input class="trip-flow-day-input" data-flow-day="${idx}" type="text" value="${escapeHtml(dayLabel)}" />
              <textarea class="trip-flow-items-input" data-flow-items="${idx}" rows="4">${escapeHtml(text)}</textarea>
            </div>`;
          const media = `
            <div class="trip-flow-media">
              <img src="${img}" alt="${escapeHtml(dayLabel)}" loading="lazy" />
              <div class="trip-flow-overlay">
                <img src="${img}" alt="" />
                <textarea data-flow-note="${idx}" rows="2" placeholder="${escapeHtml(t("tripFlowPrompt"))}">${escapeHtml(
                  Array.isArray(items) ? items[0] || "" : ""
                )}</textarea>
                <button class="trip-flow-send" type="button" data-flow-apply="${idx}" title="${escapeHtml(t("tripStepAsk"))}">↑</button>
              </div>
            </div>`;
          const spacer = `<div class="trip-flow-spacer" aria-hidden="true"></div>`;
          const node = `<div class="trip-flow-node">${num}</div>`;
          if (side === "right") {
            return `<div class="trip-flow-step" data-side="right" data-day-idx="${idx}">${copy}${node}${media}</div>`;
          }
          return `<div class="trip-flow-step" data-side="left" data-day-idx="${idx}">${media}${node}${copy}</div>`;
        })
        .join("");

      els.tripFlow.querySelectorAll("[data-flow-apply]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.flowApply);
          const note = els.tripFlow.querySelector(`[data-flow-note="${idx}"]`)?.value.trim();
          const itemsEl = els.tripFlow.querySelector(`[data-flow-items="${idx}"]`);
          if (note && itemsEl) {
            const lines = itemsEl.value.split("\n").map((s) => s.trim()).filter(Boolean);
            lines[0] = note;
            itemsEl.value = lines.join("\n");
            showTripHint(t("tripSavedEdit"));
          }
        });
      });
    }
  }

  function syncHiddenDaysFromFlow() {
    if (!els.tripFlow || !els.tripAiDaysPlan) return;
    const steps = [...els.tripFlow.querySelectorAll(".trip-flow-step")];
    els.tripAiDaysPlan.innerHTML = steps
      .map((step, idx) => {
        const dayLabel = step.querySelector(`[data-flow-day="${idx}"]`)?.value || "";
        const items = step.querySelector(`[data-flow-items="${idx}"]`)?.value || "";
        return `
          <div class="trip-ai-day" data-day-idx="${idx}">
            <input class="trip-ai-day-label" type="text" value="${escapeHtml(dayLabel)}" />
            <textarea class="trip-ai-day-items">${escapeHtml(items)}</textarea>
          </div>`;
      })
      .join("");
  }

  function readTripEditor() {
    syncHiddenDaysFromFlow();
    const trip = trips.find((x) => x.id === activeTripId) || trips.find((x) => x.id === AI_TRIP_ID);
    if (!trip) return null;
    const titleVal = els.tripAiTitle?.value.trim() || tripCardTitle(trip);
    const summaryVal = els.tripAiSummary?.value.trim() || "";
    const placeVal = els.tripAiPlace?.value.trim() || pick(trip.place);
    const daysVal = Math.max(1, Math.min(14, Number(els.tripAiDays?.value) || trip.days || 2));
    const dayNodes = [...(els.tripAiDaysPlan?.querySelectorAll(".trip-ai-day") || [])];
    const daysPlan = dayNodes.map((node, idx) => {
      const dayLabel = node.querySelector(".trip-ai-day-label")?.value.trim() || (lang === "zh" ? `第 ${idx + 1} 天` : `Day ${idx + 1}`);
      const itemsRaw = node.querySelector(".trip-ai-day-items")?.value || "";
      const items = itemsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const prev = trip.daysPlan?.[idx];
      return {
        day: {
          zh: lang === "zh" ? dayLabel : prev?.day?.zh || dayLabel,
          en: lang === "en" ? dayLabel : prev?.day?.en || dayLabel,
        },
        items: {
          zh: lang === "zh" ? items : prev?.items?.zh || items,
          en: lang === "en" ? items : prev?.items?.en || items,
        },
      };
    });
    const steps = daysPlan.flatMap((d) => pick(d.items) || []);
    return {
      ...trip,
      updatedAt: Date.now(),
      title: {
        zh: lang === "zh" ? titleVal : trip.title?.zh || titleVal,
        en: lang === "en" ? titleVal : trip.title?.en || titleVal,
      },
      summary: {
        zh: lang === "zh" ? summaryVal : trip.summary?.zh || summaryVal,
        en: lang === "en" ? summaryVal : trip.summary?.en || summaryVal,
      },
      place: {
        zh: lang === "zh" ? placeVal : trip.place?.zh || placeVal,
        en: lang === "en" ? placeVal : trip.place?.en || placeVal,
      },
      days: daysVal,
      daysPlan,
      steps,
    };
  }

  function saveTripEdits() {
    const next = readTripEditor();
    if (!next) return;
    upsertTrip(next);
    activeTripId = next.id;
    fillTripEditor(next);
    if (panel === "home") {
      renderHomeTripCards();
    }
    showTripHint(t("tripSavedEdit"));
  }

  function tripShareText(trip) {
    const plan = normalizeTripDaysPlan(trip);
    const lines = [
      pick(trip.title),
      `${pick(trip.place)} · ${trip.days} ${t("tripDays")}`,
      pick(trip.summary) || "",
      "",
      ...plan.flatMap((d) => {
        const items = pick(d.items) || [];
        return [pick(d.day), ...items.map((s) => `· ${s}`), ""];
      }),
      "— 观境 Guanjing",
    ];
    return lines.filter((x, i, arr) => !(x === "" && arr[i - 1] === "")).join("\n");
  }

  async function shareActiveTrip() {
    const trip = readTripEditor() || trips.find((x) => x.id === activeTripId);
    if (!trip) return;
    const text = tripShareText(trip);
    try {
      if (navigator.share) {
        await navigator.share({ title: pick(trip.title), text });
        showTripHint(t("tripShareNative"));
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
      showTripHint(t("tripShared"));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showTripHint(t("tripShared"));
    }
  }

  function downloadActiveTrip() {
    const trip = readTripEditor() || trips.find((x) => x.id === activeTripId);
    if (!trip) return;
    const text = tripShareText(trip);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = (pick(trip.title) || "guanjing-trip").replace(/[\\/:*?"<>|]/g, "-");
    a.href = url;
    a.download = `${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showTripHint(t("tripDownloaded"));
  }

  function setTripsView(mode) {
    tripViewMode = mode === "detail" ? "detail" : "list";
    if (els.tripsListView) els.tripsListView.hidden = tripViewMode !== "list";
    if (els.tripsDetailView) els.tripsDetailView.hidden = tripViewMode !== "detail";
  }

  function tripCardHtml(trip) {
    const pinned = Boolean(trip.pinnedAt);
    const pinLabel = pinned
      ? (lang === "zh" ? "取消置顶" : "Unpin")
      : (lang === "zh" ? "置顶" : "Pin");
    const deleteLabel = lang === "zh" ? "删除" : "Delete";
    return `
      <article class="trip-project-card${pinned ? " is-pinned" : ""}" data-trip-id="${trip.id}" role="button" tabindex="0">
        <img src="${tripCoverImg(trip)}" alt="${tripCardTitle(trip)}" />
        <div class="trip-card-actions" aria-label="${lang === "zh" ? "行程操作" : "Trip actions"}">
          <button type="button" class="trip-card-action trip-card-pin${pinned ? " is-active" : ""}" data-trip-action="pin" title="${pinLabel}" aria-label="${pinLabel}">
            <span aria-hidden="true">${pinned ? "●" : "↑"}</span><b>${pinLabel}</b>
          </button>
          <button type="button" class="trip-card-action trip-card-delete" data-trip-action="delete" title="${deleteLabel}" aria-label="${deleteLabel}">
            <span aria-hidden="true">×</span><b>${deleteLabel}</b>
          </button>
        </div>
        <div class="trip-project-meta">
          <h3>${tripCardTitle(trip)}</h3>
          <p>${tripCardLabel(trip)}</p>
        </div>
      </article>`;
  }

  function bindTripCardClicks(root) {
    root?.querySelectorAll("[data-trip-id]").forEach((card) => {
      card.querySelector('[data-trip-action="pin"]')?.addEventListener("click", (event) => {
        event.stopPropagation();
        const trip = trips.find((x) => x.id === card.dataset.tripId);
        if (!trip) return;
        trip.pinnedAt = trip.pinnedAt ? 0 : Date.now();
        trip.updatedAt = Date.now();
        saveTrips();
        renderTripsList();
        renderHomeTripCards();
      });
      card.querySelector('[data-trip-action="delete"]')?.addEventListener("click", (event) => {
        event.stopPropagation();
        const trip = trips.find((x) => x.id === card.dataset.tripId);
        if (!trip) return;
        const message = lang === "zh"
          ? `确定删除“${tripCardTitle(trip)}”吗？此操作无法撤销。`
          : `Delete “${tripCardTitle(trip)}”? This cannot be undone.`;
        if (!window.confirm(message)) return;
        if (trip.id === AI_TRIP_ID) {
          localStorage.setItem(DISMISSED_AI_TRIP_KEY, prefsFingerprint());
        }
        trips = trips.filter((item) => item.id !== trip.id);
        if (activeTripId === trip.id) activeTripId = null;
        saveTrips();
        renderTripsList();
        renderHomeTripCards();
      });
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-trip-action]")) return;
        const trip = trips.find((x) => x.id === card.dataset.tripId);
        openTripFlow(trip);
      });
      card.addEventListener("keydown", (event) => {
        if (event.target.closest("[data-trip-action]")) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const trip = trips.find((x) => x.id === card.dataset.tripId);
        openTripFlow(trip);
      });
    });
  }

  function sortedTrips() {
    return trips.slice().sort((a, b) => {
      const pinned = Number(Boolean(b.pinnedAt)) - Number(Boolean(a.pinnedAt));
      if (pinned) return pinned;
      if (a.pinnedAt && b.pinnedAt) return b.pinnedAt - a.pinnedAt;
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    });
  }

  function renderTripsList() {
    if (!els.tripsProjectList) return;
    generateAiTripFromPrefs({ force: false });
    const list = sortedTrips();
    if (els.tripsEmpty) els.tripsEmpty.hidden = list.length > 0;
    els.tripsProjectList.innerHTML = list.map(tripCardHtml).join("");
    bindTripCardClicks(els.tripsProjectList);
    if (activeTripId) highlightTrip(activeTripId);
  }

  function openTripFlow(trip) {
    if (!trip) return;
    activeTripId = trip.id;
    tripViewMode = "detail";
    showPanel("trips");
  }

  function openTripsList() {
    tripViewMode = "list";
    showPanel("trips");
  }

  function tripCoverImg(trip) {
    const bad = /1508804185872|1555921015/;
    if (trip?.img && !bad.test(trip.img)) return trip.img;
    const cityId = resolveCityIdFromTrip(trip);
    return cities[cityId]?.trip?.img || IMG.forbiddenCity;
  }

  function renderHomeTripCards() {
    if (!els.homeTripGrid) return;
    generateAiTripFromPrefs({ force: false });
    const list = sortedTrips();
    if (els.homeTripsEmpty) els.homeTripsEmpty.hidden = list.length > 0;
    const tripHtml = list.map(tripCardHtml).join("");
    const createHtml = `
      <button class="create-card home-create" type="button" id="homeCreateTripCard">
        <span class="create-illus">＋</span>
        <strong>${t("createTripCard")}</strong>
        <small>${t("createTripSub")}</small>
      </button>
      <button class="create-card home-tools" type="button" id="homeToolsCard">
        <span class="create-illus">✦</span>
        <strong>${t("creatorTools")}</strong>
        <small>${t("creatorToolsSub")}</small>
      </button>`;
    els.homeTripGrid.innerHTML = tripHtml + createHtml;
    bindTripCardClicks(els.homeTripGrid);
    document.getElementById("homeCreateTripCard")?.addEventListener("click", () => {
      const trip = generateAiTripFromPrefs({ force: true });
      renderHomeTripCards();
      openTripFlow(trip);
    });
    document.getElementById("homeToolsCard")?.addEventListener("click", () => {
      showPanel("inspire");
    });
  }

  function renderTrips() {
    setTripsView(tripViewMode);
    if (tripViewMode === "list") {
      renderTripsList();
      return;
    }
    const trip =
      trips.find((x) => x.id === activeTripId) ||
      generateAiTripFromPrefs({ force: false }) ||
      trips[0];
    if (trip) {
      activeTripId = trip.id;
      fillTripEditor(trip);
    }
  }

  function openTripInChat(trip) {
    openTripFlow(trip);
  }

  function routeCitiesHtml(route, { compact = false } = {}) {
    const list = route.cities || [];
    if (!list.length) return "";
    return `
      <div class="route-cities ${compact ? "compact" : ""}">
        ${list
          .map((city) => {
            const c = pick(city);
            const spots = (c.spots || []).slice(0, compact ? 4 : 8);
            return `
          <div class="route-city">
            <div class="route-city-head">
              <strong>${c.name}</strong>
              <span>${t("cityImpression")}</span>
            </div>
            <p class="route-city-impression">${c.impression}</p>
            <div class="route-city-spots">
              <em>${t("citySpots")}</em>
              <ul>${spots.map((s) => `<li>${s}</li>`).join("")}</ul>
            </div>
          </div>`;
          })
          .join("")}
      </div>`;
  }

  function openInspireRoute(route, opts = {}) {
    const goToTrips = opts.goToTrips !== false;
    createTripFromInspire(route, { goToTrips: false });
    showPanel("chat");
    const r = pick(route);
    const cityLines = (route.cities || []).flatMap((city) => {
      const c = pick(city);
      return [
        lang === "zh" ? `【${c.name}】城市印象` : `[${c.name}] Impression`,
        c.impression,
        lang === "zh" ? `景点：${(c.spots || []).join(" · ")}` : `Spots: ${(c.spots || []).join(" · ")}`,
        "",
      ];
    });
    const lines = [
      lang === "zh" ? `【展览路线】${r.title} · ${r.days}` : `[Exhibition route] ${r.title} · ${r.days}`,
      r.summary,
      "",
      ...cityLines,
      ...r.daysPlan.flatMap((d) => [`${d.day}`, ...d.items.map((i) => `· ${i}`), ""]),
      t("tips"),
      ...r.tips.map((tip) => `· ${tip}`),
    ];
    const routeSteps = r.daysPlan.map((d) => `${d.day}: ${d.items[0]}`);
    addMessage("user", `${t("wantRoute")}${r.title}`);
    window.setTimeout(() => {
      addMessage("assistant", lines.join("\n"), routeSteps);
      if (goToTrips) showPanel("trips");
      else showTripToast(`inspire-${route.key}`);
    }, 280);
  }

  function bindRouteButtons(root) {
    root?.querySelectorAll("[data-route]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const route = inspireRoutes.find((r) => r.key === btn.dataset.route);
        if (route) openInspireRoute(route);
      });
    });
  }

  function renderSaved() {
    if (!els.savedGrid) return;
    if (els.savedMeta) {
      els.savedMeta.textContent = `${t("savedMeta")} · ${saved.length} ${t("savedMetaUnit")}`;
    }
    if (!saved.length) {
      els.savedGrid.innerHTML = "";
      if (els.savedEmpty) els.savedEmpty.hidden = false;
      return;
    }
    if (els.savedEmpty) els.savedEmpty.hidden = true;

    const kindLabel = {
      route: t("savedKindRoute"),
      city: t("savedKindCity"),
      place: t("savedKindPlace"),
      trip: t("savedKindTrip"),
    };

    els.savedGrid.innerHTML = saved
      .map((item) => {
        const title = pick(item.title);
        const sub = pick(item.sub);
        const days = item.days ? pick(item.days) : "";
        const spots = item.spots ? pick(item.spots) || [] : [];
        return `
      <article class="saved-card" data-saved-id="${item.id}" data-route="${item.routeKey || ""}" data-kind="${item.kind}">
        ${saveToggleHtml(item.id)}
        <button type="button" class="home-waterfall-main saved-card-open">
          <div class="saved-card-cover">
            <img src="${item.img}" alt="${title}" loading="lazy" />
          </div>
          <div class="saved-card-body">
            <span class="saved-kind">${kindLabel[item.kind] || item.kind}</span>
            <h3>${title}${days ? ` · ${days}` : ""}</h3>
            <p>${sub || ""}</p>
            ${
              Array.isArray(spots) && spots.length
                ? `<ul class="home-waterfall-spots">${spots.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul>`
                : ""
            }
          </div>
        </button>
      </article>`;
      })
      .join("");

    bindSaveButtons(els.savedGrid, (id) => saved.find((x) => x.id === id) || null);
    els.savedGrid.querySelectorAll(".saved-card-open").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest("[data-saved-id]");
        const item = saved.find((x) => x.id === card?.dataset.savedId);
        if (!item) return;
        if (item.routeKey) {
          const route = inspireRoutes.find((r) => r.key === item.routeKey);
          if (route) {
            openInspireRoute(route);
            return;
          }
        }
        if (item.prompt) {
          askFromHome(pick(item.prompt));
          return;
        }
        if (item.kind === "place" || item.kind === "trip") {
          showPanel("chat");
          ask(pick(item.prompt) || pick(item.title), { goToTrips: item.kind === "trip" });
        }
      });
    });
  }

  function renderInspirePage() {
    if (!els.inspirePageGrid) return;
    els.inspirePageGrid.innerHTML = inspireRoutes
      .map((c) => {
        const r = pick(c);
        const cityNames = (c.cities || []).map((city) => pick(city).name).join(" · ");
        return `
      <article class="home-route-card inspire-page-card">
        <button type="button" class="home-route-main" data-route="${c.key}">
          <div class="home-route-cover">
            <img src="${c.img}" alt="${r.title}" />
            <span class="home-route-days">${r.days}</span>
          </div>
          <div class="home-route-body">
            <span class="home-route-label">${t("inspireLabel")}</span>
            <h3>${r.title}</h3>
            <p class="home-route-cities-line">${cityNames}</p>
            <p>${r.sub}</p>
            <span class="home-route-cta">${t("homePlanCta")}</span>
          </div>
        </button>
        <div class="home-route-cities-wrap" data-route="${c.key}" role="button" tabindex="0">
          ${routeCitiesHtml(c, { compact: false })}
        </div>
      </article>`;
      })
      .join("");
    bindRouteButtons(els.inspirePageGrid);
    els.inspirePageGrid.querySelectorAll(".home-route-cities-wrap[data-route]").forEach((el) => {
      const open = () => {
        const route = inspireRoutes.find((r) => r.key === el.dataset.route);
        if (route) openInspireRoute(route);
      };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function renderCity() {
    const data = cityData();
    if (els.orbCore) els.orbCore.textContent = pick(data.orb);
    els.heroTitle.textContent = pick(data.title);
    els.heroDesc.textContent = pick(data.desc);

    els.suggestRow.innerHTML = data.suggests
      .map(
        (s, i) => `
      <button type="button" class="feature-card" data-prompt="${pick(s.prompt)}">
        <strong>${pick(s.label)}</strong>
        <span>${lang === "zh" ? "点此开始规划" : "Tap to start planning"}</span>
      </button>`
      )
      .join("");
    bindPromptButtons(els.suggestRow);

    const tripSaveId = `trip:${state.where}`;
    const tripSavePayload = {
      id: tripSaveId,
      kind: "trip",
      cityId: state.where,
      img: data.trip.img,
      title: data.trip.title,
      sub: data.trip.sub,
      prompt: {
        zh: `创建行程：${data.trip.title.zh}，侧重空间叙事与文化体验`,
        en: `Create a trip: ${data.trip.title.en}, focus on spatial narrative and culture`,
      },
    };

    if (els.tripCards) {
      els.tripCards.innerHTML = `
      <article class="trip-card wide" data-save-card="${tripSaveId}">
        ${saveToggleHtml(tripSaveId)}
        <img src="${data.trip.img}" alt="${pick(data.trip.title)}" />
        <div class="trip-card-body">
          <p class="eyebrow">${t("inProgress")}</p>
          <h3>${pick(data.trip.title)}</h3>
          <p>${pick(data.trip.sub)}</p>
        </div>
      </article>
      <button class="create-card" type="button" id="createTripCard">
        <span class="create-illus">＋</span>
        <strong>${t("createTripCard")}</strong>
        <small>${t("createTripSub")}</small>
      </button>`;
      document.getElementById("createTripCard")?.addEventListener("click", () => {
        ask(pick(tripSavePayload.prompt), { goToTrips: true });
      });
      bindSaveButtons(els.tripCards, (id) => (id === tripSaveId ? tripSavePayload : null));
    }

    els.miniMap.innerHTML =
      data.mapPins
        .map(
          (p) =>
            `<div class="pin" style="left:${p.left};top:${p.top}"><i></i><b>${pick(p.label)}</b></div>`
        )
        .join("") +
      `<svg class="path" viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M36 48 C 42 40, 46 32, 48 28 S 54 40, 58 52" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/></svg>`;

    const categoryLabels = {
      architecture: { zh: "建筑空间", en: "Architecture" },
      culture: { zh: "文化体验", en: "Culture" },
      technology: { zh: "城市科技", en: "Urban Tech" },
      modern: { zh: "现代空间", en: "Modern Space" },
      food: { zh: "特色饮食", en: "Local Food" },
      slow: { zh: "松弛生活", en: "Slow Living" },
    };
    if (els.exploreCategories) {
      els.exploreCategories.innerHTML = Object.entries(categoryLabels)
        .map(([key, label]) => `<button type="button" class="explore-category${exploreCategory === key ? " active" : ""}" data-explore-category="${key}" aria-pressed="${exploreCategory === key}">${label[lang]}</button>`)
        .join("");
    }
    const catalog = exploreItems(state.where);
    const visiblePlaces = catalog.filter((place) => place.category === exploreCategory);
    const placePayloads = {};
    els.exploreGrid.innerHTML = visiblePlaces
      .map((p) => {
        const placeId = `place:${state.where}:${p.title.zh || pick(p.title)}`;
        placePayloads[placeId] = {
          id: placeId,
          kind: "place",
          cityId: state.where,
          img: p.img,
          title: p.title,
          sub: p.sub,
          detail: p.detail,
          tag: p.tag,
          prompt: p.prompt,
        };
        return `
      <div class="place-card-wrap">
        ${saveToggleHtml(placeId)}
        <div class="place-flip" role="button" tabindex="0" aria-label="${pick(p.title)}" aria-pressed="false">
          <div class="place-flip-inner">
            <article class="place-face place-front">
              <span class="place-index">${String(catalog.indexOf(p) + 1).padStart(2, "0")}</span>
              <img class="place-cover-illustration" src="${p.cover}" alt="${pick(p.title)}" loading="lazy" decoding="async" />
              <h3>${pick(p.title)}</h3>
            </article>
            <article class="place-face place-back">
              <div>
                <span class="place-back-kicker">${pick(p.tag)}</span>
                <h3>${pick(p.title)}</h3>
              </div>
              <p>${pick(p.sub)}</p>
              <div class="place-back-row"><span>01</span><b>${cityName(state.where)}</b></div>
              <div class="place-back-row"><span>02</span><b>${lang === "zh" ? "文化体验" : "Cultural experience"}</b></div>
              <button class="place-detail-btn" type="button" data-place-detail="${placeId}">${lang === "zh" ? "查看真实场景与介绍 →" : "View real scenes & story →"}</button>
              <button class="place-plan-btn" type="button" data-prompt="${pick(p.prompt)}">${lang === "zh" ? "加入旅行规划 →" : "Plan this place →"}</button>
            </article>
          </div>
        </div>
      </div>`;
      })
      .join("");
    bindPromptButtons(els.exploreGrid);
    bindSaveButtons(els.exploreGrid, (id) => placePayloads[id] || null);
    els.exploreGrid.querySelectorAll("[data-place-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = placePayloads[button.dataset.placeDetail];
        if (!item || !els.placeDetailDialog || !els.placeDetailContent) return;
        els.placeDetailContent.innerHTML = `<img src="${item.img}" alt="${pick(item.title)}" /><div class="place-detail-copy"><span>${cityName(state.where)} · ${pick(item.tag)}</span><h2>${pick(item.title)}</h2><p>${pick(item.detail || item.sub)}</p><button type="button" data-prompt="${pick(item.prompt)}">${lang === "zh" ? "加入旅行规划" : "Add to trip"}</button></div>`;
        bindPromptButtons(els.placeDetailContent);
        els.placeDetailDialog.showModal();
      });
    });
    els.exploreGrid.querySelectorAll(".place-flip").forEach((card) => {
      const flip = () => {
        const next = !card.classList.contains("is-flipped");
        card.classList.toggle("is-flipped", next);
        card.setAttribute("aria-pressed", String(next));
      };
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        flip();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        flip();
      });
    });

    document.querySelectorAll(".city-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.city === state.where);
    });

    if (panel === "inspire") renderInspirePage();
    if (panel === "saved") renderSaved();
    if (panel === "home") {
      renderHomeTripCards();
    }
    if (panel === "trips") renderTrips();
    syncFilters();
  }

  function askFromHome(prompt) {
    const text = String(prompt || "").trim();
    if (!text) return;
    showPanel("chat");
    ask(text, { goToTrips: false });
  }

  function buildReply(prompt) {
    const city = cityName(state.where);
    const base =
      lang === "zh"
        ? `当前：${city} · ${whenValue()} · ${whoValue()} · 预算${budgetValue()}\n\n`
        : `Now: ${city} · ${whenValue()} · ${whoValue()} · Budget ${budgetValue()}\n\n`;

    if (/故宫|中轴|胡同|皇城|Forbidden|Palace|hutong|axis/i.test(prompt) || state.where === "北京") {
      if (!/园林|苏州|拙政|garden|Suzhou|上海|Bund|外滩|武康/i.test(prompt) || /故宫|中轴|胡同|Palace|hutong|axis/i.test(prompt)) {
        if (/胡同|hutong/i.test(prompt) && !/故宫|Palace/i.test(prompt)) {
          return {
            text:
              base +
              (lang === "zh"
                ? "胡同线重点不是网红街清单，而是「生活尺度」：巷宽、宅门、拐角如何降低城市速度；与故宫礼仪空间形成对照。"
                : "Hutongs are about lived scale—lane width, gates, corners slowing the city—contrasted with Palace ritual space."),
            route:
              lang === "zh"
                ? ["中轴节点（选 1）", "胡同慢走", "四合院或文化体验点", "茶歇复盘"]
                : ["One axis node", "Slow hutong walk", "Courtyard / culture stop", "Tea debrief"],
          };
        }
        return {
          text:
            base +
            (lang === "zh"
              ? "故宫按空间剧本走：中轴线推进、院落开合、礼仪距离；出宫后接胡同，体会皇城秩序与市井肌理的落差。"
              : "Walk the Palace as a spatial script: axis advance, courtyard rhythm, ritual distance—then hutongs for everyday contrast."),
          route:
            lang === "zh"
              ? ["午门进入 · 中轴序列", "太和—乾清关键院落", "出宫过渡", "胡同文化体验"]
              : ["Meridian Gate · axis", "Key courtyards", "Exit transition", "Hutong culture"],
        };
      }
    }

    if (/园林|拙政|留园|网师|苏州|garden|Suzhou|Humble|Lingering/i.test(prompt) || state.where === "苏州") {
      if (/园林|拙政|留园|网师|苏州|garden|Suzhou|Humble/i.test(prompt) || state.where === "苏州") {
        return {
          text:
            base +
            (lang === "zh"
              ? "苏州园林线：一天宁深勿杂。拙政园看开合与借景，留园看序列转折，网师园看小中见大。"
              : "Suzhou gardens: one garden deeply. Humble Administrator’s for enclosure/borrowed views; Lingering for sequence; Master of Nets for tiny completeness."),
          route:
            lang === "zh"
              ? ["一座主园深读", "关键借景点复盘", "小园对照或平江路", "茶歇整理感受"]
              : ["One main garden deep-read", "Borrowed-view pause", "Small garden or Pingjiang", "Tea notes"],
        };
      }
    }

    if (/上海|外滩|武康|海派|Bund|Shanghai|Wukang|Haipai/i.test(prompt) || state.where === "上海") {
      return {
        text:
          base +
          (lang === "zh"
            ? "上海文化体验线：外滩读历史立面与对岸天际线；衡复/武康路读海派生活街道；再加一个当代文化空间收束。"
            : "Shanghai culture day: Bund façades vs skyline; Hengfu/Wukang street scale; close with one contemporary cultural space."),
        route:
          lang === "zh"
            ? ["外滩建筑对照", "武康路 / 衡复风貌漫步", "当代文化空间", "夜景节点（可选）"]
            : ["Bund dialogue", "Wukang / Hengfu walk", "Contemporary space", "Night node (optional)"],
      };
    }

    return {
      text:
        base +
        (lang === "zh"
          ? "你可以切换顶部城市页签，或打开左侧「灵感」栏目查看五条联线的城市印象与景点。"
          : "Switch city tabs above, or open Inspiration in the sidebar for city impressions and spots on five routes."),
      route: null,
    };
  }

  function matchInspireRoute(prompt) {
    const p = String(prompt || "");
    if (/京津|北京.?天津|Beijing.?Tianjin/i.test(p)) return inspireRoutes.find((r) => r.key === "bj-tj");
    if (/西安.?成都|Xi.?an.?Chengdu/i.test(p)) return inspireRoutes.find((r) => r.key === "xa-cd");
    if (/上海.?苏州|Shanghai.?Suzhou/i.test(p)) return inspireRoutes.find((r) => r.key === "sh-sz");
    if (/广深|岭南|Guangzhou|Shenzhen|Lingnan/i.test(p)) return inspireRoutes.find((r) => r.key === "lingnan");
    if (/贵州|广西|Guizhou|Guangxi|漓江|龙脊/i.test(p)) return inspireRoutes.find((r) => r.key === "gz-gx");
    return null;
  }

  async function ask(prompt, opts = {}) {
    const text = String(prompt || "").trim();
    if (!text) return;
    addMessage("user", text);
    if (els.input) els.input.value = "";
    const pending = document.createElement("div");
    pending.className = "agent-thinking";
    pending.textContent = lang === "zh" ? "总编排 Agent 正在分析…" : "Lead agent is orchestrating…";
    els.messages.appendChild(pending);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, previousResponseId: agentPreviousResponseId || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Agent API ${response.status}`);
      agentPreviousResponseId = data.responseId || agentPreviousResponseId;
      sessionStorage.setItem("guanjing-agent-response-id", agentPreviousResponseId);
      const result = data.result;
      pending.remove();
      const route = (result.itinerary || []).map((day) => `${day.day} · ${day.theme}: ${day.places.join(" → ")}`);
      addMessage("assistant", result.message, route);
      addAgentProfile(result);
      if (route.length) {
        const destination = result.profile?.destination || cityName(state.where);
        const trip = createTripProject({
          placeZh: destination,
          placeEn: destination,
          days: result.itinerary.length,
          img: cities[state.where]?.trip?.img,
          steps: route,
          prompt: text,
          source: "live-agent",
          goToTrips: false,
        });
        trip.customerProfile = result.profile;
        trip.readiness = result.readiness;
        trip.riskNotices = result.riskNotices;
        upsertTrip(trip);
        if (result.offerVisualMap) addAgentWorkflow(trip);
      }
    } catch (error) {
      pending.remove();
      const setup = error.message === "OPENAI_API_KEY_NOT_CONFIGURED"
        ? (lang === "zh" ? "真实 Agent 服务尚未连接：请在服务端设置 OPENAI_API_KEY，然后使用 npm run dev 启动项目。当前不会返回模拟答案。" : "The live Agent is not connected. Set OPENAI_API_KEY on the server and start with npm run dev. No simulated answer was returned.")
        : `${lang === "zh" ? "Agent 请求失败：" : "Agent request failed: "}${error.message}`;
      addMessage("assistant", setup);
    }
  }

  function setCity(city) {
    if (!cities[city]) return;
    state.where = city;
    showEmptyChat();
    renderCity();
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem("guanjing-lang-global", lang);
    applyStaticUI();
    refreshBerdTypewriterLanguage(true);
    renderCity();
    if (panel === "home") {
      renderHomeTripCards();
    }
    if (panel === "trips") renderTrips();
    if (panel === "inspire") renderInspirePage();
    if (panel === "saved") renderSaved();
    // clear chat so language stays consistent
    showEmptyChat();
  }

  els.form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = String(els.input?.value || "").trim();
    if (value) ask(value);
    else showChat();
  });

  document.querySelectorAll("[data-workspace-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => ask(btn.dataset.workspacePrompt || btn.textContent));
  });

  function enterBerdWorkspace(prompt = "") {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    showPanel("home");
    if (String(prompt).trim()) ask(prompt);
    else showChat();
  }

  document.querySelectorAll("[data-berd-start]").forEach((btn) => {
    btn.addEventListener("click", () => enterBerdWorkspace());
  });

  document.querySelectorAll("[data-berd-prompt]").forEach((btn) => {
    btn.addEventListener("click", () => enterBerdWorkspace(btn.dataset.berdPrompt || ""));
  });

  document.getElementById("berdStartForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("berdStartInput");
    enterBerdWorkspace(input?.value || "Plan a meaningful trip through China");
  });

  const berdReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const berdLanding = document.getElementById("berdLanding");
  const berdTypewriter = document.getElementById("berdTypewriter");
  const berdWordsByLang = {
    en: ["travel", "wander", "understand", "remember"],
    zh: ["旅行", "漫游", "理解", "记住"],
  };
  let berdWords = berdWordsByLang[lang];
  let berdTypingStarted = false;
  let berdTypingRun = 0;

  function refreshBerdTypewriterLanguage(restart = false) {
    berdTypingRun += 1;
    berdWords = berdWordsByLang[lang] || berdWordsByLang.en;
    berdTypingStarted = false;
    if (berdTypewriter) berdTypewriter.textContent = berdWords[0];
    if (restart) window.setTimeout(runBerdTypewriter, 80);
  }

  function runBerdTypewriter() {
    if (!berdTypewriter || berdTypingStarted || berdReducedMotion) return;
    berdTypingStarted = true;
    const currentRun = ++berdTypingRun;
    let wordIndex = 0;
    let charIndex = berdWords[0].length;
    let deleting = true;
    const tick = () => {
      if (currentRun !== berdTypingRun) return;
      const word = berdWords[wordIndex];
      berdTypewriter.textContent = word.slice(0, charIndex);
      if (deleting) {
        charIndex -= 1;
        if (charIndex < 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % berdWords.length;
          charIndex = 0;
        }
      } else {
        charIndex += 1;
        if (charIndex > berdWords[wordIndex].length) {
          deleting = true;
          charIndex = berdWords[wordIndex].length;
          window.setTimeout(tick, 1100);
          return;
        }
      }
      window.setTimeout(tick, deleting ? 70 : 105);
    };
    window.setTimeout(tick, 750);
  }

  refreshBerdTypewriterLanguage(false);

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.14 });
    document.querySelectorAll(".berd-reveal").forEach((el) => revealObserver.observe(el));
    if (berdTypewriter) {
      const typingObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) runBerdTypewriter();
      }, { threshold: 0.55 });
      typingObserver.observe(berdTypewriter);
    }
  } else {
    document.querySelectorAll(".berd-reveal").forEach((el) => el.classList.add("is-visible"));
  }

  berdLanding?.addEventListener("pointermove", (e) => {
    if (berdReducedMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    berdLanding.style.setProperty("--pointer-x", x.toFixed(3));
    berdLanding.style.setProperty("--pointer-y", y.toFixed(3));
    const cursor = document.getElementById("berdCursor");
    if (cursor) cursor.style.transform = `translate(${e.clientX - 7}px, ${e.clientY - 7}px)`;
  });

  els.homeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    askFromHome(els.homeInput?.value);
    if (els.homeInput) els.homeInput.value = "";
  });

  document.querySelectorAll(".side-nav .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.panel || "chat";
      if (next === "trips") {
        openTripsList();
        return;
      }
      showPanel(next);
    });
  });
  document.getElementById("logoHome")?.addEventListener("click", (e) => {
    e.preventDefault();
    showPanel("home");
  });
  document.getElementById("inspireToChatBtn")?.addEventListener("click", () => showPanel("chat"));
  document.getElementById("tripBackBtn")?.addEventListener("click", () => openTripsList());
  document.getElementById("tripsNewTripBtn")?.addEventListener("click", () => {
    const trip = generateAiTripFromPrefs({ force: true });
    renderTripsList();
    openTripFlow(trip);
  });

  document.getElementById("homeRegenBtn")?.addEventListener("click", () => {
    generateAiTripFromPrefs({ force: true });
    renderHomeTripCards();
    showTripHint(lang === "zh" ? "已按最新偏好重新生成" : "Regenerated from latest prefs");
  });
  document.querySelectorAll(".discover-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const which = tab.dataset.discover;
      document.querySelectorAll(".discover-tab").forEach((t) => t.classList.toggle("active", t === tab));
      const explore = document.getElementById("discoverExplore");
      const trips = document.getElementById("discoverTrips");
      if (explore) explore.hidden = which !== "explore";
      if (trips) trips.hidden = which !== "trips";
      if (which === "trips") renderHomeTripCards();
    });
  });
  els.exploreCategories?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-explore-category]");
    if (!button) return;
    exploreCategory = button.dataset.exploreCategory;
    renderCity();
  });
  document.getElementById("placeDetailClose")?.addEventListener("click", () => els.placeDetailDialog?.close());
  els.placeDetailDialog?.addEventListener("click", (event) => {
    if (event.target === els.placeDetailDialog) els.placeDetailDialog.close();
  });
  document.getElementById("newChatMenuBtn")?.addEventListener("click", () => {
    document.getElementById("newChatBtn")?.click();
  });
  document.getElementById("tripSaveBtn")?.addEventListener("click", () => saveTripEdits());
  document.getElementById("tripShareBtn")?.addEventListener("click", () => shareActiveTrip());
  document.getElementById("tripDownloadBtn")?.addEventListener("click", () => downloadActiveTrip());

  document.querySelectorAll(".city-tab").forEach((tab) => {
    tab.addEventListener("click", () => setCity(tab.dataset.city));
  });

  document.getElementById("newChatBtn")?.addEventListener("click", () => {
    showPanel("chat");
    showEmptyChat();
    els.chatPane?.classList.add("is-chatting");
    const data = cityData();
    const placeZh = I18N.cityNames.zh[state.where] || state.where;
    const placeEn = I18N.cityNames.en[state.where] || state.where;
    const draft = createTripProject({
      id: `draft-${Date.now()}`,
      placeZh,
      placeEn,
      days: 2,
      img: data.trip.img,
      summary: {
        zh: "新的旅行规划 · 等待你的想法",
        en: "New travel plan · waiting for your ideas",
      },
      prompt: "",
      source: "new-trip",
      toast: true,
    });
    activeTripId = draft.id;
  });

  document.getElementById("createTripBtn")?.addEventListener("click", () => {
    const data = cityData();
    ask(
      lang === "zh"
        ? `请根据当前筛选，创建一份${pick(data.trip.title)}`
        : `Based on current filters, create ${pick(data.trip.title)}`,
      { goToTrips: true }
    );
  });

  document.getElementById("setupBtn")?.addEventListener("click", () => {
    ask(
      lang === "zh"
        ? "我更偏好空间叙事深读，少购物；北京想看故宫与胡同对照，苏州想慢逛园林，上海想要文化体验而非商场"
        : "I prefer deep spatial narrative over shopping; Beijing Palace vs hutong, slow Suzhou gardens, Shanghai culture not malls"
    );
  });

  els.mapToggle?.addEventListener("click", () => {
    mapOpen = els.mapPanel.hidden;
    els.mapPanel.hidden = !mapOpen;
    els.mapToggle.classList.toggle("on", mapOpen);
    els.mapToggle.textContent = mapOpen ? t("mapClose") : t("map");
  });

  els.langBtn?.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
  els.berdLangBtn?.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));

  const filterConfigs = () => ({
    where: {
      title: t("whereTitle"),
      html: `<label>${t("cityLabel")}<select name="where"><option value="北京">${cityName("北京")}</option><option value="苏州">${cityName("苏州")}</option><option value="上海">${cityName("上海")}</option></select></label>`,
    },
    when: {
      title: t("whenTitle"),
      html: `<label>${t("whenLabel")}<select name="when">${t("whenOpts")
        .map((o, i) => `<option value="${i}">${o}</option>`)
        .join("")}</select></label>`,
    },
    who: {
      title: t("whoTitle"),
      html: `<label>${t("whoLabel")}<select name="who">${t("whoOpts")
        .map((o, i) => `<option value="${i}">${o}</option>`)
        .join("")}</select></label>`,
    },
    budget: {
      title: t("budgetTitle"),
      html: `<label>${t("budgetLabel")}<select name="budget">${t("budgetOpts")
        .map((o, i) => `<option value="${i}">${o}</option>`)
        .join("")}</select></label>`,
    },
  });

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pendingFilter = btn.dataset.filter;
      const cfg = filterConfigs()[pendingFilter];
      els.sheetTitle.textContent = cfg.title;
      els.sheetBody.innerHTML = cfg.html;
      const select = els.sheetBody.querySelector("select");
      if (select) {
        if (pendingFilter === "where") select.value = state.where;
        if (pendingFilter === "when") select.value = String(state.whenKey);
        if (pendingFilter === "who") select.value = String(state.whoKey);
        if (pendingFilter === "budget") select.value = String(state.budgetKey);
      }
      const cancelBtn = els.filterForm.querySelector('[value="cancel"]');
      const okBtn = els.filterForm.querySelector('[value="ok"]');
      if (cancelBtn) cancelBtn.textContent = t("sheetCancel");
      if (okBtn) okBtn.textContent = t("sheetOk");
      els.sheet.showModal();
    });
  });

  els.locBtn?.addEventListener("click", () => {
    document.querySelector('[data-filter="where"]').click();
  });

  els.filterForm?.addEventListener("submit", (e) => {
    if (e.submitter?.value === "ok" && pendingFilter) {
      const select = els.sheetBody.querySelector("select");
      if (select) {
        if (pendingFilter === "where") setCity(select.value);
        if (pendingFilter === "when") state.whenKey = Number(select.value);
        if (pendingFilter === "who") state.whoKey = Number(select.value);
        if (pendingFilter === "budget") state.budgetKey = Number(select.value);
        syncFilters();
      }
    }
    pendingFilter = null;
  });

  applyStaticUI();
  renderCity();
  renderHomeTripCards();
  renderInspirePage();
  renderSaved();
  placeComposer("empty");
  showPanel("home");
})();

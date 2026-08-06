window.DEMO_DATA = (function () {
  const projects = [
    { id: '1', code: '2025-440306-702456', name: '前海湾铁石水源保护区环境综合整治工程', scale: 30000, industry: '环境保护与水利', projectUnit: '宝安区水务局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 5000, status: 'reviewing', progress: 90, aiScore: 86 },
    { id: '2', code: '2025-440306-702457', name: '新桥街道黄埔社区学校建设工程', scale: 18500, industry: '公共教育', projectUnit: '宝安区教育局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 4000, status: 'pending', progress: 0, aiScore: 78 },
    { id: '3', code: '2025-440306-702458', name: '宝安图书馆智慧升级与分馆扩建项目', scale: 9200, industry: '城市基础设施', projectUnit: '宝安图书馆', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 2800, status: 'pending', progress: 20, aiScore: 82 },
    { id: '4', code: '2025-440306-702459', name: '西乡大道综合交通枢纽配套道路提升工程', scale: 45000, industry: '交通运输与物流', projectUnit: '宝安区交通运输局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 6800, status: 'reviewing', progress: 50, aiScore: 74 },
    { id: '5', code: '2025-440306-702460', name: '石岩街道雨污分流与海绵城市示范工程', scale: 22000, industry: '环境保护与水利', projectUnit: '宝安区水务局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 3500, status: 'pending', progress: 10, aiScore: 88 },
    { id: '6', code: '2025-440306-702461', name: '福永社区综合文化服务中心建设项目', scale: 7600, industry: '城市基础设施', projectUnit: '宝安街道办', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 2100, status: 'reviewing', progress: 70, aiScore: 91 },
    { id: '7', code: '2025-440306-702462', name: '航城高新园区供电与市政管网扩容工程', scale: 16000, industry: '城市基础设施', projectUnit: '宝安区发展改革局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 4200, status: 'pending', progress: 0, aiScore: 80 },
    { id: '11', code: '2025-440306-702466', name: '新安街道老旧小区加装电梯与适老化改造', scale: 12800, industry: '城市基础设施', projectUnit: '宝安区住房建设局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 2600, status: 'pending', progress: 5, aiScore: 83 },
    { id: '12', code: '2025-440306-702467', name: '宝安中心区智慧停车系统一期工程', scale: 6400, industry: '城市基础设施', projectUnit: '宝安区政务服务数据管理局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 1900, status: 'reviewing', progress: 35, aiScore: 79 },
    { id: '13', code: '2025-440306-702468', name: '西乡河流域水环境综合治理工程', scale: 41000, industry: '环境保护与水利', projectUnit: '宝安区水务局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 8700, status: 'pending', progress: 0, aiScore: 85 },
    { id: '8', code: '2025-440306-702463', name: '沙井中心区地下综合管廊一期工程', scale: 38000, industry: '城市基础设施', projectUnit: '宝安区住建局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 9500, status: 'reviewed', progress: 100, aiScore: 84 },
    { id: '14', code: '2025-440306-702469', name: '宝安高级中学改扩建工程', scale: 24600, industry: '公共教育', projectUnit: '宝安区教育局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 7200, status: 'reviewed', progress: 100, aiScore: 88 },
    { id: '15', code: '2025-440306-702470', name: '固戍地铁接驳道路与慢行系统提升', scale: 15300, industry: '交通运输与物流', projectUnit: '宝安区交通运输局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 3100, status: 'reviewed', progress: 100, aiScore: 81 },
    { id: '16', code: '2025-440306-702471', name: '宝安区疾控中心实验室能力提升项目', scale: 8200, industry: '公共卫生', projectUnit: '宝安区卫生健康局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 4500, status: 'reviewed', progress: 100, aiScore: 90 },
    { id: '17', code: '2025-440306-702472', name: '凤凰山森林公园配套服务设施改造', scale: 11000, industry: '城市基础设施', projectUnit: '宝安区城管局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 2300, status: 'reviewed', progress: 100, aiScore: 86 },
    { id: '18', code: '2025-440306-702473', name: '宝安湾滨海休闲带二期工程', scale: 27500, industry: '城市基础设施', projectUnit: '宝安区建筑工务署', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 6800, status: 'reviewed', progress: 100, aiScore: 83 },
    { id: '19', code: '2025-440306-702474', name: '松岗创新科技园配套市政道路工程', scale: 19800, industry: '交通运输与物流', projectUnit: '宝安区交通运输局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 5400, status: 'reviewed', progress: 100, aiScore: 77 },
    { id: '20', code: '2025-440306-702475', name: '社区托育服务设施网络建设项目', scale: 4600, industry: '社会民生', projectUnit: '宝安区卫生健康局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 1600, status: 'reviewed', progress: 100, aiScore: 89 },
    { id: '9', code: '2025-440306-702464', name: '松岗街道公共卫生服务中心改扩建', scale: 5400, industry: '公共卫生', projectUnit: '宝安区卫生健康局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 1800, status: 'passed', progress: 100, aiScore: 93 },
    { id: '21', code: '2025-440306-702476', name: '宝安中学（集团）初中部改扩建项目', scale: 16800, industry: '公共教育', projectUnit: '宝安区教育局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 5600, status: 'passed', progress: 100, aiScore: 94 },
    { id: '22', code: '2025-440306-702477', name: '新桥片区供水管网更新改造工程', scale: 32000, industry: '环境保护与水利', projectUnit: '宝安区水务局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 3900, status: 'passed', progress: 100, aiScore: 91 },
    { id: '23', code: '2025-440306-702478', name: '宝安数字政务云数据中心扩容工程', scale: 5100, industry: '数字基础设施', projectUnit: '宝安区政务服务数据管理局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 4800, status: 'passed', progress: 100, aiScore: 92 },
    { id: '24', code: '2025-440306-702479', name: '福永国际会展中心周边交通整治工程', scale: 14200, industry: '交通运输与物流', projectUnit: '宝安区交通运输局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 2700, status: 'passed', progress: 100, aiScore: 90 },
    { id: '25', code: '2025-440306-702480', name: '宝安区养老综合服务中心建设项目', scale: 9800, industry: '社会民生', projectUnit: '宝安区民政局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 3500, status: 'passed', progress: 100, aiScore: 95 },
    { id: '26', code: '2025-440306-702481', name: '石岩水库水源涵养林提升工程', scale: 56000, industry: '环境保护与水利', projectUnit: '宝安区水务局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 2200, status: 'passed', progress: 100, aiScore: 93 },
    { id: '27', code: '2025-440306-702482', name: '宝安体育中心场馆智能化改造', scale: 8700, industry: '城市基础设施', projectUnit: '宝安区文化广电旅游体育局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 2100, status: 'passed', progress: 100, aiScore: 89 },
    { id: '10', code: '2025-440306-702465', name: '燕罗街道产业园区配套租赁住房项目', scale: 52000, industry: '保障性住房', projectUnit: '宝安区住房建设局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 12000, status: 'failed', progress: 100, aiScore: 61 },
    { id: '28', code: '2025-440306-702483', name: '某街道综合办公用房维修改造项目', scale: 6800, industry: '其他', projectUnit: '宝安街道办', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 1500, status: 'failed', progress: 100, aiScore: 42 },
    { id: '29', code: '2025-440306-702484', name: '高端装备产业展示中心建设项目', scale: 21000, industry: '产业园区', projectUnit: '宝安区工业和信息化局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 8600, status: 'failed', progress: 100, aiScore: 55 },
    { id: '30', code: '2025-440306-702485', name: '滨海旅游配套商业街区基础设施工程', scale: 33500, industry: '城市基础设施', projectUnit: '宝安区文化广电旅游体育局', reportUnit: '宝安街道办', bondType: '超长期国债', fundType: '国债', amount: 9800, status: 'failed', progress: 100, aiScore: 58 },
    { id: '31', code: '2025-440306-702486', name: '园区企业总部大楼及地下空间开发项目', scale: 48000, industry: '产业园区', projectUnit: '宝安区发展改革局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 15000, status: 'failed', progress: 100, aiScore: 48 },
    { id: '32', code: '2025-440306-702487', name: '城区亮化景观提升与灯光秀系统工程', scale: 9000, industry: '城市基础设施', projectUnit: '宝安区城管局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 3200, status: 'failed', progress: 100, aiScore: 52 },
    { id: '33', code: '2025-440306-702488', name: '临时性展馆与活动设施购置项目', scale: 3500, industry: '其他', projectUnit: '宝安街道办', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 1100, status: 'failed', progress: 100, aiScore: 39 },
    { id: '34', code: '2025-440306-702489', name: '产业引导基金配套办公场所装修工程', scale: 4200, industry: '其他', projectUnit: '宝安区财政局', reportUnit: '宝安街道办', bondType: '专项债', fundType: '国债', amount: 1800, status: 'failed', progress: 100, aiScore: 45 },
  ]

  const statusLabel = {
    pending: '待审查',
    reviewing: '审核中',
    reviewed: 'AI已审查',
    passed: '复核已通过',
    failed: '复核未通过',
  }

  const badgeClass = {
    pending: 'badge-warning',
    reviewing: 'badge-warning-outline',
    reviewed: 'badge-processing',
    passed: 'badge-success',
    failed: 'badge-danger',
  }

  const tabMap = {
    pending: ['pending', 'reviewing'],
    reviewed: ['reviewed'],
    passed: ['passed'],
    failed: ['failed'],
  }

  const auditSteps = [
    { id: 's01', phase: '材料预处理', title: '申报材料完整性校验', desc: '核验可研报告、资金申请报告、收益平衡方案、用地与环评等必备附件是否齐全。', engine: '规则引擎', ruleRef: 'RULE-DOC-01', evidence: '已识别附件 12 份，缺失「水土保持方案批复」扫描件。', finding: '材料基本齐全，存在 1 项待补附件。', suggestion: '请补充水保方案批复后再进入终审。', status: 'warning', score: 82 },
    { id: 's02', phase: '材料预处理', title: '文档解析与 OCR 质检', desc: '对扫描件/PDF 进行 OCR，检查清晰度、页码连续与表格识别质量。', engine: '多模态解析 Agent', ruleRef: 'OCR-QA-03', evidence: 'OCR 平均置信度 0.96；表格识别成功率 98%。', finding: '文档可解析，关键金额字段识别正常。', status: 'passed', score: 96 },
    { id: 's03', phase: '材料预处理', title: '结构化信息抽取', desc: '抽取项目编码、建设内容、投资构成、建设工期、责任单位等关键字段。', engine: 'LLM + Schema', ruleRef: 'EXTRACT-SCHEMA-V2', evidence: '成功抽取 36 个关键字段，字段完整率 100%。', finding: '结构化入库完成，可进入规则比对。', status: 'passed', score: 94 },
    { id: 's04', phase: '材料预处理', title: '知识库分段与向量化', desc: '将申报文本切分为知识片段并写入企业知识库，供后续 RAG 检索。', engine: 'RAG Index / MCP', ruleRef: 'KB-CHUNK-08', evidence: '生成 214 个文本块，向量入库成功。', finding: '知识库分段完成。', status: 'passed', score: 98 },
    { id: 's05', phase: '政策与合规', title: '债券投向领域匹配', desc: '对照超长期国债/专项债支持领域，判断项目行业与建设内容是否在支持范围内。', engine: '规则引擎 + RAG', ruleRef: 'POLICY-DOMAIN-12', evidence: '命中「生态环保 / 水安全保障」支持目录第 3 类。', finding: '投向领域匹配通过。', status: 'passed', score: 95 },
    { id: 's06', phase: '政策与合规', title: '负面清单交叉核验', desc: '与地方政府专项债券用途负面清单、楼堂馆所限制进行交叉比对。', engine: '规则引擎', ruleRef: 'NEGATIVE-LIST-07', evidence: '未命中负面清单条目；不涉及楼堂馆所建设。', finding: '负面清单核验通过。', status: 'passed', score: 97 },
    { id: 's07', phase: '政策与合规', title: '审批权限与层级校验', desc: '校验申报层级、审批主体与投资额是否匹配区级审批权限。', engine: '规则引擎', ruleRef: 'AUTH-LEVEL-04', evidence: '属于区级审批权限范围。', finding: '审批权限校验通过。', status: 'passed', score: 92 },
    { id: 's08', phase: '政策与合规', title: '政策时效与文件版本核验', desc: '确认引用政策文件是否为现行有效版本。', engine: 'RAG 政策库', ruleRef: 'POLICY-VERSION-02', evidence: '引用 3 份政策文件均为现行有效版本。', finding: '政策版本有效。', status: 'passed', score: 93 },
    { id: 's09', phase: '投资与测算', title: '投资必要性论证核验', desc: '评估需求紧迫性、服务缺口、安全隐患与历史同类项目成效。', engine: 'AI 决策引擎', ruleRef: 'NEED-SCORE-11', evidence: '水源保护区水质风险明确，历史整治项目成效可追溯。', finding: '必要性论证充分。', status: 'passed', score: 90 },
    { id: 's10', phase: '投资与测算', title: '建设规模合理性校验', desc: '对比同类项目单位指标，判断建设规模是否偏大或偏小。', engine: '统计模型 + 历史库', ruleRef: 'SCALE-BENCH-09', evidence: '单位面积投资处于同类项目 P45–P60 区间。', finding: '建设规模基本合理。', status: 'passed', score: 88 },
    { id: 's11', phase: '投资与测算', title: '投资估算定额校核', desc: '对建安费、工程建设其他费、预备费进行定额与占比校核。', engine: '测算 Agent / MCP', ruleRef: 'COST-CHECK-15', evidence: '建安费用较同类均值偏高约 4.2%。', finding: '投资测算存在轻度偏高。', suggestion: '建议复核护坡与清淤单价套用依据。', status: 'warning', score: 76 },
    { id: 's12', phase: '投资与测算', title: '资金构成与资本金校验', desc: '核验债券资金、财政配套与自有资金构成是否满足最低资本金要求。', engine: '规则引擎', ruleRef: 'CAPITAL-RATIO-06', evidence: '资本金占比 22%，满足行业最低要求。', finding: '资金构成合规。', status: 'passed', score: 91 },
    { id: 's13', phase: '投资与测算', title: '收益覆盖与偿债能力评估', desc: '评估专项收入/财政承受能力对还本付息的覆盖情况。', engine: '财务模型 Agent', ruleRef: 'DEBT-COVER-10', evidence: '覆盖倍数 1.18。', finding: '偿债能力评估通过。', status: 'passed', score: 87 },
    { id: 's14', phase: '投资与测算', title: '绩效目标完整性检查', desc: '检查产出、效益、满意度指标是否量化、可考核。', engine: '规则引擎', ruleRef: 'PERF-TARGET-05', evidence: '产出指标 4 项、效益指标 3 项均已量化。', finding: '绩效目标完整。', status: 'passed', score: 89 },
    { id: 's15', phase: '要件与风险', title: '用地规划合规核验', desc: '核验用地预审、选址意见、规划条件与红线范围一致性。', engine: '要件核验 Agent', ruleRef: 'LAND-COMPLY-13', evidence: '已取得用地预审与选址意见书。', finding: '用地合规通过。', status: 'passed', score: 94 },
    { id: 's16', phase: '要件与风险', title: '环评 / 水保 / 安评要件核验', desc: '检查环境影响评价、水土保持、安全评价等专项要件状态。', engine: '要件核验 Agent', ruleRef: 'ENV-SAFE-14', evidence: '环评已批复；水保方案批复材料待补。', finding: '专项要件存在待补项。', suggestion: '补齐水保批复后关闭该项风险。', status: 'warning', score: 72 },
    { id: 's17', phase: '要件与风险', title: '重复立项与交叉建设排查', desc: '在全区项目库检索是否存在重叠建设内容或重复申报。', engine: '项目库检索 / MCP', ruleRef: 'DUP-CHECK-16', evidence: '未发现高度重叠建设内容。', finding: '无重复立项风险。', status: 'passed', score: 96 },
    { id: 's18', phase: '要件与风险', title: '工期与实施可行性评估', desc: '根据工序抽取结果评估工期安排是否可行。', engine: '多模态分析 Agent', ruleRef: 'SCHEDULE-17', evidence: '主体施工跨越雨季，土方作业存在延误风险。', finding: '工期基本可行，存在季节性风险。', suggestion: '建议增加雨季施工组织措施说明。', status: 'warning', score: 78 },
    { id: 's19', phase: '知识增强与决策', title: '历史同类项目 RAG 比对', desc: '检索历史同类项目，比对投资强度、周期与成效。', engine: 'RAG', ruleRef: 'HIST-RAG-18', evidence: '命中 7 个相似项目，投资强度偏差中位数 3.8%。', finding: '与历史样本总体一致。', status: 'passed', score: 85 },
    { id: 's20', phase: '知识增强与决策', title: '审批规则问答对校验', desc: '将复杂审批规则转为问答对，对关键结论进行二次校验。', engine: '规则知识库 / RAG', ruleRef: 'QA-PAIR-19', evidence: '执行 18 组规则问答，17 组通过。', finding: '规则问答校验基本通过。', status: 'passed', score: 90 },
    { id: 's21', phase: '知识增强与决策', title: '风险点汇总与分级', desc: '汇总前述步骤风险，按高/中/低分级。', engine: '决策 Agent', ruleRef: 'RISK-RANK-20', evidence: '中风险 3 项，高风险 0 项。', finding: '整体风险可控。', status: 'warning', score: 80 },
    { id: 's22', phase: '知识增强与决策', title: '决策参考报告生成', desc: '由 AI Agent 通过 MCP 工具链自动汇总结论。', engine: 'AI Agent + MCP', ruleRef: 'REPORT-GEN-21', evidence: '已生成审查摘要、问题清单与复核建议。', finding: '决策参考已生成，建议进入人工复核。', status: 'passed', score: 88 },
  ]

  const phases = ['材料预处理', '政策与合规', '投资与测算', '要件与风险', '知识增强与决策']

  function getFields(stepId, project) {
    const map = {
      s01: {
        title: '材料清单核验明细',
        usage: '审核员对照下表勾选补件：缺失项需退回申报单位；齐全项可进入后续 OCR 与结构化抽取。',
        fields: [
          { name: '项目建议书 / 可研报告', value: '已上传', source: '可研报告.pdf', confidence: '99%', flag: 'ok' },
          { name: '资金申请报告', value: '已上传', source: '资金申请报告.pdf', confidence: '98%', flag: 'ok' },
          { name: '收益与融资平衡方案', value: '已上传', source: '平衡方案.pdf', confidence: '97%', flag: 'ok' },
          { name: '用地预审与选址意见书', value: '已上传', source: '用地预审.pdf', confidence: '99%', flag: 'ok' },
          { name: '环评批复', value: '已上传', source: '环评批复.pdf', confidence: '98%', flag: 'ok' },
          { name: '水土保持方案批复', value: '缺失', source: '未检索到扫描件', confidence: '91%', flag: 'missing', note: '建议退回补件' },
          { name: '绩效目标表', value: '已上传', source: '绩效目标.xlsx', confidence: '96%', flag: 'ok' },
          { name: '投资估算表', value: '已上传', source: '可研报告 第6章', confidence: '95%', flag: 'ok' },
        ],
      },
      s02: {
        title: 'OCR 质检字段',
        usage: '置信度偏低的页/表建议人工抽查；金额类字段将自动进入结构化抽取对照。',
        fields: [
          { name: '文档页数', value: '186 页', source: '可研报告.pdf', confidence: '100%', flag: 'ok' },
          { name: 'OCR 平均置信度', value: '0.96', source: '全文统计', confidence: '96%', flag: 'ok' },
          { name: '表格识别成功率', value: '98%', source: '投资估算表等', confidence: '98%', flag: 'ok' },
          { name: '模糊页数量', value: '2 页', source: '第 47、102 页', confidence: '78%', flag: 'warn', note: '建议重扫' },
          { name: '关键金额字段识别', value: '正常', source: '总投资/建安费', confidence: '97%', flag: 'ok' },
        ],
      },
      s03: {
        title: '结构化抽取字段（可直接用于规则比对）',
        usage: '这些字段是后续政策匹配、投资测算、要件核验的输入。可点「采用」写入审查表单。',
        more: 16,
        fields: [
          { name: '项目编码', value: project.code, source: '资金申请报告 P1', confidence: '99%', flag: 'ok' },
          { name: '项目名称', value: project.name, source: '可研报告封面', confidence: '99%', flag: 'ok' },
          { name: '所属行业', value: project.industry, source: '可研报告 §1.2', confidence: '97%', flag: 'ok' },
          { name: '债券类型', value: project.bondType, source: '资金申请报告 §2', confidence: '98%', flag: 'ok' },
          { name: '项目单位', value: project.projectUnit, source: '申报表', confidence: '99%', flag: 'ok' },
          { name: '申报单位', value: project.reportUnit, source: '申报表', confidence: '99%', flag: 'ok' },
          { name: '建设规模（㎡）', value: String(project.scale), source: '可研报告 §3.1', confidence: '96%', flag: 'ok' },
          { name: '总投资（万元）', value: String(project.amount), source: '投资估算表', confidence: '98%', flag: 'ok' },
          { name: '建安工程费（万元）', value: '3680', source: '投资估算表 表6-2', confidence: '95%', flag: 'ok' },
          { name: '工程建设其他费（万元）', value: '720', source: '投资估算表 表6-3', confidence: '94%', flag: 'ok' },
          { name: '预备费（万元）', value: '400', source: '投资估算表 表6-4', confidence: '93%', flag: 'ok' },
          { name: '申请债券资金（万元）', value: '4000', source: '资金申请报告 §4', confidence: '97%', flag: 'ok' },
          { name: '资本金占比', value: '22%', source: '资金筹措方案', confidence: '95%', flag: 'ok' },
          { name: '建设内容', value: '清淤整治、护坡砌筑、水质监测点、截污管网', source: '可研报告 §3', confidence: '94%', flag: 'ok' },
          { name: '建设工期', value: '18 个月（2025.03–2026.08）', source: '实施进度计划', confidence: '92%', flag: 'ok' },
          { name: '建设地点', value: '深圳市宝安区前海湾铁石水源保护区', source: '选址意见书', confidence: '98%', flag: 'ok' },
          { name: '用地面积（㎡）', value: '28500', source: '用地预审', confidence: '96%', flag: 'ok' },
          { name: '是否涉及楼堂馆所', value: '否', source: '建设内容比对', confidence: '99%', flag: 'ok' },
        ],
      },
      s11: {
        title: '投资估算校核字段',
        usage: '对比「抽取值 vs 同类均值」。偏差＞5% 的行建议展开定额明细。',
        fields: [
          { name: '总投资（万元）', value: String(project.amount), source: '抽取自估算表', confidence: '98%', flag: 'ok' },
          { name: '建安费占比', value: '73.6%', source: '测算 Agent', confidence: '94%', flag: 'warn', note: '偏高约 4.2%' },
          { name: '同类项目建安费均值占比', value: '69.4%', source: '历史库 12 样本', confidence: '90%', flag: 'info' },
          { name: '护坡单价（元/延米）', value: '2860', source: '估算明细', confidence: '91%', flag: 'warn', note: '高于均值' },
          { name: '清淤单价（元/方）', value: '48', source: '估算明细', confidence: '92%', flag: 'ok' },
          { name: '预备费占比', value: '8.0%', source: '估算表', confidence: '95%', flag: 'ok' },
        ],
      },
      s16: {
        title: '专项要件状态字段',
        usage: '缺失要件会阻断终审。可生成补件通知，补齐后重跑本步骤。',
        fields: [
          { name: '环评批复文号', value: '深环批〔2025〕118 号', source: '环评批复.pdf', confidence: '98%', flag: 'ok' },
          { name: '用地预审文号', value: '深宝土预〔2025〕36 号', source: '用地预审.pdf', confidence: '99%', flag: 'ok' },
          { name: '水保方案批复', value: '未提供', source: '—', confidence: '91%', flag: 'missing', note: '待补件' },
          { name: '安评结论', value: '不涉及重大危险源', source: '可研 §8', confidence: '90%', flag: 'ok' },
        ],
      },
    }
    return map[stepId] || null
  }

  return { projects, statusLabel, badgeClass, tabMap, auditSteps, phases, getFields }
})()

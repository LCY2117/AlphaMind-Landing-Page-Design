# AlphaMind API 申请清单

## 目标

AlphaMind 要从“外观 Demo”变成“真实数据驱动的 AI 投资分析系统”，后端需要接入若干外部数据源。这个清单用于分配给队员申请 API Key。

核心原则：

- 前端不要直接接第三方 API。
- 所有 API Key 只放后端 `.env`，不要提交到 GitHub。
- 优先申请能让演示立刻变真的 API。
- 不追求一次性接完所有平台，先保证价格、K 线、AI 结论、基本面评分这条主链路跑通。

## 一句话版本

最优先申请：

1. OpenRouter
2. Finnhub
3. Twelve Data
4. Financial Modeling Prep
5. NewsAPI

这 5 个拿到后，AlphaMind 可以优先实现：

- 真实股票价格
- 真实 K 线
- 真实涨跌幅
- 基于真实行情计算动量、波动率、趋势
- 基于真实数据生成 AI 诊断结论
- 初步基本面评分
- 初步新闻/催化因子分析

## P0：必须申请

这些 API 直接决定 AlphaMind 能不能从 Demo 变成真实系统。

| API 平台 | 官网 | 用途 | 对 AlphaMind 的价值 | 队员交付物 |
| --- | --- | --- | --- | --- |
| OpenRouter | https://openrouter.ai | 调用大模型生成 AI 分析结论 | 把固定文案变成基于真实数据的 AI 诊断、风险解释、投资逻辑说明 | `OPENROUTER_API_KEY` |
| Finnhub | https://finnhub.io | 美股实时报价、公司新闻、基础市场数据 | 支撑 TSLA、NVDA、AAPL 等美股真实价格、涨跌幅、新闻催化 | `FINNHUB_API_KEY` |
| Twelve Data | https://twelvedata.com | 股票、外汇、指数、K 线、部分基本面数据 | 补齐多市场 K 线，支撑美股/A股/港股/外汇/黄金等资产透视 | `TWELVE_DATA_API_KEY` |

### P0 完成后的效果

AlphaMind 至少可以做到：

- `资产透视` 页面显示真实价格。
- K 线/历史走势来自真实数据。
- 动量、波动率、趋势评分由真实 K 线计算。
- AI 诊断结论由大模型根据真实数据生成。
- Mock 只作为 API 不可用时的 fallback，而不是主路径。

## P1：强烈建议申请

这些 API 让 AlphaMind 从“有行情”升级到“像专业分析工具”。

| API 平台 | 官网 | 用途 | 对 AlphaMind 的价值 | 队员交付物 |
| --- | --- | --- | --- | --- |
| Financial Modeling Prep | https://site.financialmodelingprep.com/developer/docs | 财报、估值、利润表、资产负债表、现金流 | 让估值、盈利能力、成长性评分有真实基本面依据 | `FMP_API_KEY` |
| NewsAPI | https://newsapi.org | 新闻检索 | 让关键催化因子、风险事件、新闻摘要不再是编造内容 | `NEWSAPI_KEY` |
| Alpha Vantage | https://www.alphavantage.co | 股票、外汇、技术指标、宏观数据 | 作为行情和指标备用源，防止 Finnhub/Twelve Data 限流 | `ALPHA_VANTAGE_API_KEY` |

### P1 完成后的效果

AlphaMind 可以进一步做到：

- 估值评分参考 PE、PB、PS、PEG。
- 盈利评分参考毛利率、净利率、ROE、ROA。
- 成长评分参考营收增长、利润增长。
- AI 结论引用近期新闻和财报指标。
- 当主行情源限流时有备用数据源。

## P2：看项目方向申请

这些 API 不一定马上用，但如果队伍人手够，可以提前申请。

| API 平台 | 官网 | 适用场景 | 什么时候需要 | 队员交付物 |
| --- | --- | --- | --- | --- |
| Tiingo | https://www.tiingo.com | 股票、外汇、历史行情备用 | 如果 Twelve Data 外汇/黄金额度不够，可以用它补 | `TIINGO_API_KEY` |
| Polygon.io | https://polygon.io | 高质量美股行情、分钟级数据 | 如果要做更专业的美股短线/分钟级分析 | `POLYGON_API_KEY` |
| Tushare Pro | https://tushare.pro | A股行情、财务、宏观数据 | 如果 AlphaMind 要重点做 A股 | `TUSHARE_TOKEN` |
| Adanos / 市场情绪 API | 以队员实际能申请的平台为准 | 新闻、社媒、Reddit、Twitter/X 情绪 | 如果要把“多空情绪指数”做成真实舆情指标 | 对应平台 API Key |

## P3：暂时不要申请

这些和比赛演示主线关系不大，或者风险较高。

| 平台 | 原因 |
| --- | --- |
| Alpaca / Interactive Brokers / 真实券商交易 API | 涉及交易权限、合规、账户安全，当前阶段不需要 |
| Binance 等交易所私有交易 API | 涉及真实资产和密钥风险，当前阶段不要接 |
| 付费很高的专业金融终端 API | 成本高，比赛阶段性价比不高 |

## 队员分工建议

| 队员 | 负责 API |
| --- | --- |
| 队员 A | OpenRouter、NewsAPI |
| 队员 B | Finnhub、Alpha Vantage |
| 队员 C | Twelve Data、Tiingo |
| 队员 D | Financial Modeling Prep、Tushare Pro |

如果人少，优先合并为：

- 一个人申请 OpenRouter。
- 一个人申请 Finnhub + Twelve Data。
- 一个人申请 Financial Modeling Prep + NewsAPI。

## 申请时注意事项

队员申请 API 时需要记录：

- 是否需要邮箱验证。
- 是否需要手机号。
- 是否需要绑定银行卡。
- 免费额度是多少。
- 是否有请求频率限制。
- 是否允许商业/比赛演示使用。
- 是否支持我们需要的市场：美股、A股、港股、外汇、加密货币。

如果遇到付费、绑卡、实名、法律条款确认，不要自行乱点，先记录下来让负责人确认。

## 交付格式

队员申请完后，把信息私下交给负责人。不要发到公开群、公开文档或 GitHub。

```text
平台名称：
官网：
登录邮箱：
API Key 名称：
API Key：
免费额度：
请求限制：
是否绑定支付方式：
是否需要实名/手机号：
主要用途：
备注：
```

## 后端 `.env` 命名建议

后端统一使用这些变量名：

```env
OPENROUTER_API_KEY=
FINNHUB_API_KEY=
TWELVE_DATA_API_KEY=
FMP_API_KEY=
NEWSAPI_KEY=
ALPHA_VANTAGE_API_KEY=
TIINGO_API_KEY=
POLYGON_API_KEY=
TUSHARE_TOKEN=
ADANOS_API_KEY=
```

不要把这些值写进前端 `VITE_*` 变量，也不要写进源码。

## AlphaMind 功能与 API 映射

| AlphaMind 功能 | 需要的数据 | 推荐 API |
| --- | --- | --- |
| 当前价格 | 实时报价 | Finnhub / Twelve Data |
| K 线图 | OHLCV 历史数据 | Twelve Data / Finnhub / Alpha Vantage |
| 动量评分 | K 线计算 | 后端自己算 |
| 波动风险 | K 线收益率计算 | 后端自己算 |
| 估值评分 | PE、PB、PS、PEG、市值 | Financial Modeling Prep / Twelve Data |
| 成长性评分 | 营收增长、利润增长 | Financial Modeling Prep |
| 盈利能力评分 | 毛利率、净利率、ROE、ROA | Financial Modeling Prep |
| 新闻催化 | 公司相关新闻 | NewsAPI / Finnhub |
| 多空情绪 | 新闻/社媒情绪 | Adanos 或其他情绪 API |
| AI 诊断结论 | 结构化行情 + 基本面 + 新闻 | OpenRouter |
| 回测 | K 线 + 策略代码 | QuantDinger |

## 最小可交付版本

如果只申请到了 P0，AlphaMind 也可以先做一个真实版本：

- 价格：真实
- K 线：真实
- 技术评分：真实计算
- AI 结论：基于真实行情生成
- 基本面评分：先标注为“估算”
- 情绪评分：先标注为“行情与新闻估算”

如果 P0 + P1 都申请到了，AlphaMind 可以进入比较完整的比赛演示状态：

- 价格/K线真实
- 基本面评分真实
- 新闻催化真实
- AI 结论基于多源真实数据生成
- 回测由 QuantDinger 负责

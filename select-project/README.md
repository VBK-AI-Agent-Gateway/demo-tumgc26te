# 医院智慧挂号就诊检查系统 · 功能说明 + 后端接口文档 + 部署说明

## 一、概述
单文件前端（HTML+CSS+JS）+ 内置 Mock 接口层，对标健康160/微医/挂号网核心流程。
UI：公立医院官方简洁蓝色医疗风（主色 #1a6fb5），手机优先（底部Tab导航），≥800px 自动桌面适配，零外部依赖。

## 二、功能清单（8大模块全覆盖）
| 模块 | 功能点 |
|---|---|
| 1 科室/医生 | 10科室Tab筛选、12位医生列表、医生简介弹窗（擅长/职称/学历/年限/挂号费）、出诊排班（未来7天×10时段，有号/约满/停诊 + 余号数，周五下午停诊模拟） |
| 2 挂号 | 预约挂号、当日挂号（今日标识）、改期（换日期+时段）、取消（同步关闭待缴挂号费） |
| 3 患者管理 | 手机号+密码注册（正则校验）、实名认证（身份证脱敏）、就诊人增/解绑、关系选择（本人/父母/配偶/子女）、最多6人 |
| 4 在线问诊 | 简易咨询对话入口（底部Tab直达）、关键词规则AI导诊（发烧/头痛/胃/皮肤/报告5类）、4个常见问题快捷按钮 |
| 5 检查检验 | 10项项目搜索、费用/准备事项/出报告时长、开单模拟（加入→合计→生成申请单） |
| 6 缴费中心 | 挂号费/检查费分单、合计、单笔支付/一键结清、缴费记录（已支付/已关闭） |
| 7 就诊档案 | 就诊记录（日期/科室/诊断/历史处方）、检查报告档案 |
| 8 消息通知 | 挂号/改期/取消/缴费/报告/停诊类通知、未读角标、全部已读；首页就诊提醒（今日/明日/预约标签）+ 停诊排班通知 |

**业务闭环**：挂号→待缴挂号费→缴费→待就诊；开单→待缴检查费→缴费→自动出报告→报告查询；改期/取消→消息推送→首页提醒同步。

## 三、代码分层结构
```
├─ 数据层 DB       localStorage('hosp_sys_v1')，首访自动播种
│                  users / pats / regs / orders / pays / visits / reports / msgs
├─ 接口层 API      统一协议 {code:0,data} 成功 / {code:1,msg} 失败
│                  user_register / user_cur / user_logout
│                  pat_add / pat_list / pat_del
│                  doc_list / doc_get / sched_list
│                  reg_create / reg_list / reg_reschedule / reg_cancel
│                  exam_search / report_list
│                  pay_list / pay_do
│                  visit_list / msg_list / msg_readAll / msg_unread
└─ 视图层 View     switchView(v) → render(v) 按面板懒渲染
                   弹窗: openModal / closeModal
```

## 四、后端接口逻辑文档（可直接对照实现真实后端）

### 通用协议
- 请求: JSON body；会话: Cookie/Token 均可
- 响应: `{"code":0,"data":...}` 成功 / `{"code":1,"msg":"错误原因"}` 失败

### 接口清单
| 方法(建议) | 路径 | 入参 | 出参/逻辑 |
|---|---|---|---|
| POST | /api/user/register | phone,pwd,name,idno | 手机号`^1\d{10}$`、密码≥6位、身份证`^\d{17}[\dXx]$`、查重；返回用户(身份证脱敏 6+8+4)；写入实名状态 auth=true |
| GET | /api/user/current | - | 返回当前会话用户或 null |
| POST | /api/user/logout | - | 清会话 |
| POST | /api/patient/add | name,idno,rel,phone | 校验同注册；同 uid 下最多6位；rel∈{本人,父亲,母亲,配偶,子女,其他} |
| GET | /api/patient/list | - | 当前用户就诊人列表 |
| DELETE | /api/patient/:id | - | 解绑（须同 uid） |
| GET | /api/doctor/list?dept= | dept可空 | 科室筛选医生 |
| GET | /api/doctor/:id | - | 医生详情(简介用) |
| GET | /api/schedule?docId&date | docId,date(YYYY-MM-DD) | 返回10时段状态：`有号(余N)/约满/停诊`；已挂号时段置约满；支持停诊配置(如周五下午) |
| POST | /api/registration | docId,patId,date,slot | 必须登录；同人同时段不可重复；type=date==今天?'当日挂号':'预约挂号'；生成流水号 GH+8位；**同步生成待支付挂号费账单**；推送消息 |
| GET | /api/registration/list | - | 当前用户挂号按创建时间倒序 |
| POST | /api/registration/:id/reschedule | date,slot | 仅'待就诊'可改；记录原/新时间并推送消息 |
| POST | /api/registration/:id/cancel | - | 仅'待就诊'可取消；关联待支付账单置'已关闭'；推送消息 |
| GET | /api/exam/search?kw= | 关键字匹配名称/科室 | 返回项目{名称,价格,科室,准备事项,出报告时长} |
| POST | /api/exam/order | items[] | 登录后生成申请单+**检查费待支付账单**；推送消息 |
| GET | /api/report/list | - | 当前用户报告倒序{exam,dept,doctor,at,result} |
| GET | /api/payment/list | - | 当前用户全部账单(待支付/已支付/已关闭) |
| POST | /api/payment/:id/pay | - | 校验状态=待支付；置已支付+时间；**若为检查费：为申请单内每个项目生成报告**(结果模板按项目)；推送两条消息(缴费成功+报告发布) |
| GET | /api/visit/list | - | 就诊记录{date,dept,doctor,diag,rx} |
| GET | /api/message/list /unread | - | 消息列表 / 未读数 |
| POST | /api/message/read-all | - | 全部标记已读 |

### 状态机
- 挂号: `待就诊 →(改期) 待就诊 →(取消) 已取消`；支付不改变就诊状态，只改变账单
- 账单: `待支付 →(支付) 已支付`；`待支付 →(挂号取消) 已关闭`
- 报告: `申请单已缴费 → 自动生成(published)`

## 五、部署说明
1. **纯静态**：`index.html` 放任意静态服务器即可（nginx / GitHub Pages / IIS / Tomcat静态目录），无构建、无依赖。
2. **本地预览**：双击打开，或 `python3 -m http.server 8080`。
3. **数据**：localStorage 键 `hosp_sys_v1`；清浏览器缓存即重置演示数据。
4. **对接真实后端**：将 API 对象内各函数体替换为 `fetch('/api/...')`（返回协议不变），视图层零改动。
5. **二次开发**：种子数据 `DEPTS / DOCTORS / EXAMS / SLOTS / NOTICES` 改为接口拉取即可；号源/停诊由 `/api/schedule` 后端计算。
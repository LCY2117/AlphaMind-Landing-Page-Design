# Overnight Prompt

Use this prompt when starting the long task:

```text
Use $long-task-guardrail and follow docs/OVERNIGHT_IMPLEMENTATION_PLAN.md to execute the AlphaMind long task.

目标：保留当前 AlphaMind React UI，把 QuantDinger 作为候选后端能力拼图，优先完成 Asset X-Ray 的 adapter 化和真实数据接入准备。必须保留 mock fallback，不启用实盘交易，不提交密钥，不破坏现有 UI。

长任务四锚点：PLAN -> STATE/PCB -> BLOCKERS -> GIT。每次启动、恢复、切换 Priority、验证、发现阻塞、最终汇报前，都要检查这四项。

可选并行：只有用户明确授权 sub-agent/并行 agent/小智能体时才启用；启用后把每个 agent 的任务、写入范围、状态、返回结果和集成验证记录到 `docs/LONG_TASK_STATE.md`。

执行顺序：
1. 先检查 git status 和当前构建状态。
2. 按 Priority 0 -> Priority 5 推进。
3. 每开始一个新 Priority、每完成一轮较大文件编辑、以及任何上下文恢复后，运行：
   `powershell -ExecutionPolicy Bypass -File scripts/check-overnight-plan.ps1`
4. 每完成一个阶段跑 npm run build；需要同时回读验收标准时运行：
   `powershell -ExecutionPolicy Bypass -File scripts/check-overnight-plan.ps1 -Build`
5. 如果 QuantDinger 本地服务不可用，完成 provider/adapter 和 mock fallback，不要卡死。
6. 把 `docs/LONG_TASK_STATE.md` 当作 PCB：每次切换 Priority、完成重要修改、跑完验证、发现阻塞、准备暂停/交接前，都更新当前状态、下一步、改动文件、Git branch/HEAD/status 和验证结果。
7. 如果遇到微信/QQ 扫码、邮箱/短信验证码、实名、手机号、付费、法律条款确认、密钥/API Token 创建等必须用户本人完成的步骤，不要停住等用户；写入 `docs/LONG_TASK_BLOCKERS.md`，更新 `docs/LONG_TASK_STATE.md`，然后继续做所有不依赖它的工程、文档、测试、mock、adapter、fallback 和准备工作。
8. 不要自动 commit；只有用户明确授权“长任务 checkpoint commit”时，才在通过验证的里程碑提交，并把 commit hash 写入 `docs/LONG_TASK_STATE.md`。
9. 如果用户明确授权 sub-agent/并行 agent，则只分配边界清晰、互不重叠的任务，并把 sub-agent ledger 写入 `docs/LONG_TASK_STATE.md`。
10. 只有当所有剩余有意义任务都依赖未解决的阻塞项，或继续会造成安全风险时才停止。
11. 最后给出 morning report：实现内容、文件变更、验证命令、阻塞项、Git 状态/checkpoint、sub-agent ledger（如有）、下一步建议。
```

Minimum acceptance:

- `npm run build` passes.
- Asset X-Ray can run through an adapter in mock mode.
- QuantDinger provider path is configurable.
- No secrets are committed.
- No live trading path is enabled.

Context guardrail:

- Treat `docs/OVERNIGHT_IMPLEMENTATION_PLAN.md` as the source of truth.
- Treat `docs/LONG_TASK_STATE.md` as the local PCB for interruption recovery.
- Treat `docs/LONG_TASK_BLOCKERS.md` as the local queue for user-only blockers.
- Treat Git branch/HEAD/status as recovery metadata. Do not create commits unless checkpoint commits are explicitly authorized.
- Repeat the four anchors before major work: PLAN, STATE/PCB, BLOCKERS, GIT.
- Use sub-agents only when explicitly authorized; track them in `docs/LONG_TASK_STATE.md`.
- If context is compacted or the task resumes after a pause, run `scripts/check-overnight-plan.ps1` before making further edits.
- Do not continue from memory when the local plan and current code disagree; inspect the files again.

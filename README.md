# 大犇牛 · Motion Templates Skill

**让 AI 直接选动效、换内容，生成可编辑的 Remotion 视频。**

内置 **66 个动效预设**，覆盖卡片阵列、多米诺、芯片分层、激光雷达、波形、图表、搜索框与标题动画；额外整合 **124 张 Shotcraft 镜头配方、243 个演示/公共组件源文件、5 类图解规则、3 类 WebGL 规则和 6 组转场示例**。预设与扩展配方分别计数。

## 安装 Skill

先安装 Node.js 22.20 或更新版本，在你的项目目录运行：

```bash
npx skills add 2369069850ydl-code/codex --skill motion-templates
```

按提示选择 Claude Code、Codex 或其他支持 Skill 的工具。默认装到当前项目；需要全局可加 `-g`。安装后重新加载工具，让它发现 `motion-templates`。

也可以下载本仓库 ZIP，把整个 `skills/motion-templates` 文件夹（连同 assets、references、scripts）放进工具的 Skills 目录。只复制 SKILL.md 会缺少工程。 Git 连接受限时，下载并解压仓库 ZIP，也可以运行：

```bash
npx skills add ./codex-main --skill motion-templates
```

该 ZIP 安装路径已完成“安装 → 创建新工程 → 渲染”的实测。

## 对 AI 这样说

> 使用 motion-templates，做一个芯片结构解释动画。先给我选三个合适预设，再把分层内容换成“计算、存储、通信”，保留复杂运镜和错峰。输出可编辑工程和 MP4。

> 使用 motion-templates，把我的产品亮点做成卡片阵列。需要更强的视觉冲击时，从内置 Shotcraft 配方中选一种爆炸分解或卡片群转场。

## 手动跑通第一个视频

以下以下载/克隆本仓库后的根目录为例：

```bash
node skills/motion-templates/scripts/create-project.mjs my-video
cd my-video
npm ci
npm run typecheck
npm run catalog
npm run render -- T080-search-capsule out/demo.mp4 --props examples/search-a.json --concurrency=1
```

查看和修改：`npm run studio`。第二组内容：将 props 文件换成 `examples/search-b.json`。初次安装 npm 依赖和渲染浏览器需要网络；下载失败先检查网络或 npm 源。源码包含本地字体依赖，不需要上传口播原片。

## 怎么选

- [66 个预设与对应源码](skills/motion-templates/references/templates.md)
- [复杂动效与第三方配方分类](skills/motion-templates/references/extensions.md)
- [Skill 调用规则](skills/motion-templates/SKILL.md)
- [来源、Star 快照与许可](THIRD_PARTY_NOTICES.md)
- [验证范围](VALIDATION.md)

66 个预设包含同一动效族的不同参数版本，不是 66 套独立引擎。复杂展示优先卡片、多米诺、分层与雷达；雷达等场景适合视觉解释，换行业需同时调整几何和叙事。第三方配方供按需改造，不等于所有示例已接入或渲染通过。

## 许可

本项目模板代码及集成脚本 MIT；第三方文件保持原许可与署名。Remotion 运行库另适用其官方许可。原始参考视频和配音不在此包中。

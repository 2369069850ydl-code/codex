---
name: motion-templates
description: 用大犇牛的 Remotion 动效模板制作可换文案、数据和素材的视频。适用于科技科普、图表、卡片阵列、多米诺、芯片分层、激光雷达及产品 UI 动画；优先复用内置预设，再按需读取第三方配方。
---

# Motion Templates

交付可编辑 Remotion 工程和用户要求的视频。先复用已存在的动作，不从零画同款。

## 选片与创建

- 只读 [模板索引](references/templates.md) 选 1–3 个相符预设，再读对应 `types.ts` / `presets.ts` / `samples.ts`，不全量加载源码。
- 复杂展示优先 T026 等距卡片、T028 多米诺、T013 分层、T037/T038 雷达；科技解释用波形/通道/缓存；口播包装用搜索/标题/流程。
- 内置工程 `assets/project` 含全部源码、锁文件与本地字体依赖。使用 `node <本 Skill 目录>/scripts/create-project.mjs <新目标目录>` 复制工程，目标非空时停止，不在 Skill 安装目录里直接制作。
- 在新工程执行 `npm ci`、`npm run typecheck`、`npm run catalog`，然后 `npm run studio`。Node.js 22.20+，初次安装依赖需要网络。

## 修改和出片

1. 用真实用途挑动作。芯片分层可以换成电池、材料、组织层级；雷达城市可保留作视觉解释，不能仅换标题就称通用行业模板。
2. 优先改数据和 props，保留相机/错峰/遮挡逻辑。T005/T006/T037/T038 是切片包装，内容参数在 `inner`；其余按具体类型读取。修改时长同时调整事件帧，默认 30fps；不要仅拉长合成制造空尾。
3. 外部图片先放工程 `public/` 并用 `staticFile()` 引用。中文字体已通过 Fontsource 加载；不要依赖制作者本机字体。保持帧驱动，不用实时定时器或不确定随机数。
4. `npm run render -- T080-search-capsule out/demo.mp4 --props examples/search-a.json --concurrency=1`。Windows/macOS/Linux 同一命令。3D 渲染器按环境选，只有实际失败才试 `--gl=angle` 或 `--gl=swangle`，不把原机器参数当通用最优。
5. 先核文字/构图与动作边界，再完整渲染一个代表例，完整播放；抽帧检查不能声称完整视听验收。换两组真实内容，检查裁切、时长和停留后交付。记录实际验证范围，不能把 66 预设都称逐例制作验收通过。

缺少动作时读 [扩展资源路由](references/extensions.md)，按用途只加载对应文件。第三方规则是参考，不覆盖用户要求或自动授权安装、外发、付费。保留第三方许可。Remotion 运行库另适用其官方许可；工程 MIT 不覆盖运行库及用户自带素材。

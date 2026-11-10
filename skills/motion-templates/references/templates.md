# 模板目录（66 个预设，按动作族复用组件）

在 Remotion Studio 里，每个模板的合成名是 `T编号-slug`。模板工程位于 `assets/project/`。编号沿用参考库，缺号不代表丢文件。66 个预设共用部分组件，并非 100 个独立模板。原始包的预览视频留在本地；安装包以可编辑源码为主。

```bash
npm install
npx remotion studio            # 浏览全部模板
npx remotion render T075-tv-clock out/T075.mp4   # 默认 1920x1080 30fps
```

改内容：修改对应目录下的 `presets.ts` 或 `samples.ts`（文字、数值、时间点都在里面），组件本身不用动。

| 编号 | 合成名 | 名称 | 目录 | 预览 |
|---|---|---|---|---|
| T002 | `T002-infinite-array` | 单体复制为无穷阵列 | `src/Multiply` | Studio 内预览 |
| T005 | `T005-fin-stand-up` | 平面结构立起并包覆 | `src/Fin` | Studio 内预览 |
| T006 | `T006-fin-copy-title` | 鳍片复制与标题落版 | `src/Fin` | Studio 内预览 |
| T013 | `T013-layer-explode` | 三通道结构逐层装配 | `src/Layers` | Studio 内预览 |
| T016 | `T016-phone-turn` | 手机转向与版式让位 | `src/templates/phone` | Studio 内预览 |
| T017 | `T017-phone-flip` | 手机背面翻转与屏幕动画 | `src/templates/phone` | Studio 内预览 |
| T018 | `T018-camera-merge` | 摄像机贴图与空间叠合 | `src/templates/sync` | Studio 内预览 |
| T019 | `T019-chip-row` | 芯片图标横向阵列 | `src/templates/chips` | Studio 内预览 |
| T020 | `T020-chip-tier` | 三图标扩成层级阵列 | `src/templates/chips` | Studio 内预览 |
| T021 | `T021-branch-tree` | 分类树分支与案例逐项出现 | `src/templates/branch` | Studio 内预览 |
| T022 | `T022-end-card` | 片尾媒体卡与行动标签 | `src/templates/endcard` | Studio 内预览 |
| T023 | `T023-step-cards` | 六步流程卡片依次建立 | `src/templates/steps` | Studio 内预览 |
| T024 | `T024-comment-bubbles` | 单条反馈扩展为群体声量 | `src/Voices` | Studio 内预览 |
| T025 | `T025-paper-reveal` | 纸片翻转揭示 | `src/templates/papers` | Studio 内预览 |
| T026 | `T026-iso-card-grid` | 等距国家卡片阵列 | `src/CardGrid` | Studio 内预览 |
| T027 | `T027-group-swap` | 阵列换组与标签 | `src/CardGrid` | Studio 内预览 |
| T028 | `T028-card-domino` | 素材卡翻为多米诺 | `src/Domino` | Studio 内预览 |
| T029 | `T029-tag-collapse` | 四角布局重排成单列 | `src/templates/corners` | Studio 内预览 |
| T030 | `T030-end-credits` | 片尾多窗口与角色字幕 | `src/templates/credits` | Studio 内预览 |
| T037 | `T037-lidar-scan` | 扫描往返与坐标生成 | `src/Lidar` | Studio 内预览 |
| T038 | `T038-lidar-peak` | 短时输入与峰值对照 | `src/Lidar` | Studio 内预览 |
| T039 | `T039-adc-scale` | 并行通道扩容与数据输出 | `src/templates/adc` | Studio 内预览 |
| T040 | `T040-heat-color` | 输入驱动颜色与标尺变化 | `src/templates/heat` | Studio 内预览 |
| T041 | `T041-balance` | 双变量平衡与偏移 | `src/templates/heat` | Studio 内预览 |
| T042 | `T042-ball-frames` | 小球序列转帧阵列 | `src/templates/frames` | Studio 内预览 |
| T043 | `T043-frame-pulldown` | 逐帧填充与节奏标注 | `src/templates/frames` | Studio 内预览 |
| T044 | `T044-era-tags` | 黑白转彩色与年代标签 | `src/templates/era` | Studio 内预览 |
| T045 | `T045-layer-upload` | 上传进入分层处理 | `src/templates/stack` | Studio 内预览 |
| T046 | `T046-layer-process` | 分层处理与输出流程 | `src/templates/stack` | Studio 内预览 |
| T047 | `T047-flicker-hatch` | 采样面积与斜线填充 | `src/templates/flicker` | Studio 内预览 |
| T048 | `T048-flicker-sync-fill` | 采样面积同步对齐 | `src/templates/flicker` | Studio 内预览 |
| T049 | `T049-flicker-phase` | 错相采样波形 | `src/templates/flicker` | Studio 内预览 |
| T050 | `T050-flicker-roll` | 帧率滚动与面积比较 | `src/templates/flicker` | Studio 内预览 |
| T051 | `T051-flicker-level` | 遮罩齐平消除差异 | `src/templates/flicker` | Studio 内预览 |
| T052 | `T052-light-vs-screen` | 整体闪烁与扫描线对比 | `src/templates/sync` | Studio 内预览 |
| T056 | `T056-spectrum-bar` | 光谱区间揭示与面板重排 | `src/templates/bento` | Studio 内预览 |
| T057 | `T057-spectrum-chart` | 曲线与有效区间叠加 | `src/templates/bento` | Studio 内预览 |
| T058 | `T058-mem-to-disk` | 缓存阵列转存与占用增长 | `src/templates/buffer` | Studio 内预览 |
| T059 | `T059-sine-panel` | 波形绘制与双栏切换 | `src/templates/sine` | Studio 内预览 |
| T060 | `T060-frame-tuner` | 滑杆联动波形 | `src/templates/tuner` | Studio 内预览 |
| T061 | `T061-scroll-list` | 算式列表逐行高亮 | `src/templates/list` | Studio 内预览 |
| T062 | `T062-signal-clash` | 窗口分栏与曲线冲突 | `src/templates/signal` | Studio 内预览 |
| T063 | `T063-signal-fix` | 曲线错位与解决提示 | `src/templates/signal` | Studio 内预览 |
| T064 | `T064-rel-tree` | 关系图连线生长 | `src/templates/tree` | Studio 内预览 |
| T065 | `T065-bar-meta` | 柱图与虚线叠加 | `src/templates/bars` | Studio 内预览 |
| T066 | `T066-flicker-axes` | 波形面板与坐标强调 | `src/templates/flicker` | Studio 内预览 |
| T067 | `T067-flicker-shutter` | 采样线与快门滑杆 | `src/templates/flicker` | Studio 内预览 |
| T068 | `T068-flicker-sync` | 帧率切换与采样加密 | `src/templates/flicker` | Studio 内预览 |
| T069 | `T069-data-table` | 参数表展开与说明补入 | `src/templates/table` | Studio 内预览 |
| T070 | `T070-value-words` | 三行价值大字与弧形刻度 | `src/templates/values` | Studio 内预览 |
| T071 | `T071-arrow-focus` | 箭头聚焦与标题替换 | `src/templates/focus` | Studio 内预览 |
| T072 | `T072-unit-counter` | 单位揭示与数值颜色联动 | `src/templates/unit` | Studio 内预览 |
| T073 | `T073-number-split` | 数字圆形分裂 | `src/templates/numsplit` | Studio 内预览 |
| T074 | `T074-neon-title` | 渐变大字与释义 | `src/templates/neon` | Studio 内预览 |
| T075 | `T075-tv-clock` | 实际时间与播放时间对照 | `src/templates/tvclock` | Studio 内预览 |
| T076 | `T076-buffer-freeze` | 持续缓存到触发定格 | `src/templates/buffer` | Studio 内预览 |
| T077 | `T077-lamp-white-balance` | 切换比较基准与结果展示 | `src/templates/lamps` | Studio 内预览 |
| T078 | `T078-search-type` | 搜索框展开面板 | `src/templates/search` | Studio 内预览 |
| T079 | `T079-scroll-list-chat` | 问题气泡与结果补充 | `src/templates/list` | Studio 内预览 |
| T080 | `T080-search-capsule` | 黑色搜索胶囊 | `src/templates/search` | Studio 内预览 |
| T081 | `T081-player-morph` | 播放器横竖版变形 | `src/templates/player` | Studio 内预览 |
| T082 | `T082-capsule-light` | 霓虹胶囊描边点亮 | `src/templates/neon` | Studio 内预览 |
| T083 | `T083-tag-activate` | 四角标签逐个激活 | `src/templates/corners` | Studio 内预览 |
| T084 | `T084-flicker-split` | 波形让位与结果联动 | `src/templates/flicker` | Studio 内预览 |
| T085 | `T085-pwm-dimmer` | 开关占空比与亮度联动 | `src/templates/pwm` | Studio 内预览 |
| T094 | `T094-lamp-reveal` | 三个对象逐项揭示参数 | `src/templates/lamps` | Studio 内预览 |

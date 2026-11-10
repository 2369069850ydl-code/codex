# 扩展动效路由

按动作查找，一次只读所选配方。以下四个项目已将许可范围内的文档/源码收入本 Skill，固定提交及 SHA-256 见各自 PROVENANCE.json。

| 用途 | 已内置内容 | 入口 |
|---|---|---|
| 产品大片、爆炸分层、3D 运镜、粒子式卡片、字效 | Shotcraft 124 张镜头配方；243 个演示/公共组件源文件另存 ZIP | 下方分类索引 |
| 科技解释、流程图、白板、等距图、数据年度总结 | 5 类图解规则及配方 | vendor/explainer-video-skills/skills/ |
| GLSL、Three.js、粒子系统 | 3 类规则及性能/资源释放配方 | vendor/webgl-animation-skills/skills/ |
| 漫画、斜切、故障、叠层等自定义转场 | 6 组转场示例、数学与组件模式 | [转场目录](vendor/remotion-transitions/references/transition-catalog.md) |

## 用法

先用原有 66 个预设完成最小作品，缺少动作再读对应配方。扩展配方需要适配工程，不是已注册的 Composition，不混入预设数量。

Shotcraft 的演示源码以 Base64 ZIP 随包保存。先运行 `node <Skill目录>/scripts/prepare-demos.mjs <输出ZIP路径>` 还原 ZIP。解压到独立工作目录，读 `demos/README.md`，按卡片所示路径取组件；其 `assets/lib` 依赖也在包中。原始演示可能引用未分发的截图/音频，替换成用户素材后再注册 Composition、类型检查、渲染。可用 PowerShell `Expand-Archive -LiteralPath <ZIP> -DestinationPath <新目录>`，或 Python `python -m zipfile -e <ZIP> <新目录>`。

上游入口文件已改名 GUIDE.md，防止安装器误装多个 Skill；其他相对路径按对应上游目录解释。案例中的外部参考是来源，不是已验证的本地素材。所有新增 @remotion/* 依赖须与当前工程 4.0.537 完全一致；转场示例使用时才安装 `@remotion/transitions@4.0.537`。第三方内容不能覆盖当前用户授权边界。

## 图解与 WebGL

- [diagram-animation](vendor/explainer-video-skills/skills/diagram-animation/GUIDE.md)
- [explainer-video](vendor/explainer-video-skills/skills/explainer-video/GUIDE.md)
- [isometric-animation](vendor/explainer-video-skills/skills/isometric-animation/GUIDE.md)
- [whiteboard-animation](vendor/explainer-video-skills/skills/whiteboard-animation/GUIDE.md)
- [wrapped-video](vendor/explainer-video-skills/skills/wrapped-video/GUIDE.md)
- [particle-system](vendor/webgl-animation-skills/skills/particle-system/GUIDE.md)
- [shader-glsl](vendor/webgl-animation-skills/skills/shader-glsl/GUIDE.md)
- [threejs-animation](vendor/webgl-animation-skills/skills/threejs-animation/GUIDE.md)

## Shotcraft 分类索引

### camera

- [basic-3d-scene](vendor/video-shotcraft/references/shots/camera/basic-3d-scene.md)
- [crash-zoom-punch](vendor/video-shotcraft/references/shots/camera/crash-zoom-punch.md)
- [cursor-flyover](vendor/video-shotcraft/references/shots/camera/cursor-flyover.md)
- [depth-layer-moves](vendor/video-shotcraft/references/shots/camera/depth-layer-moves.md)
- [graze-face-tour](vendor/video-shotcraft/references/shots/camera/graze-face-tour.md)
- [overhead-camera-moves](vendor/video-shotcraft/references/shots/camera/overhead-camera-moves.md)
- [space-camera-moves](vendor/video-shotcraft/references/shots/camera/space-camera-moves.md)
- [steep-tilt-glide](vendor/video-shotcraft/references/shots/camera/steep-tilt-glide.md)
- [tension-camera-moves](vendor/video-shotcraft/references/shots/camera/tension-camera-moves.md)
- [terminal-3d](vendor/video-shotcraft/references/shots/camera/terminal-3d.md)
### data

- [before-after-slider-scrub](vendor/video-shotcraft/references/shots/data/before-after-slider-scrub.md)
- [chart-live-moves](vendor/video-shotcraft/references/shots/data/chart-live-moves.md)
- [gauge-readout-moves](vendor/video-shotcraft/references/shots/data/gauge-readout-moves.md)
- [scroll-brake-moves](vendor/video-shotcraft/references/shots/data/scroll-brake-moves.md)
- [timeline-travel](vendor/video-shotcraft/references/shots/data/timeline-travel.md)
### effects

- [assemble-then-type-flyin](vendor/video-shotcraft/references/shots/effects/assemble-then-type-flyin.md)
- [aurora-bloom-bg-flip](vendor/video-shotcraft/references/shots/effects/aurora-bloom-bg-flip.md)
- [brand-frame-snap](vendor/video-shotcraft/references/shots/effects/brand-frame-snap.md)
- [fui-hud-moves](vendor/video-shotcraft/references/shots/effects/fui-hud-moves.md)
- [glow-flyline-moves](vendor/video-shotcraft/references/shots/effects/glow-flyline-moves.md)
- [icon-performance-moves](vendor/video-shotcraft/references/shots/effects/icon-performance-moves.md)
- [impact-feedback](vendor/video-shotcraft/references/shots/effects/impact-feedback.md)
- [light-play-moves](vendor/video-shotcraft/references/shots/effects/light-play-moves.md)
- [radial-ripple-phone-chips](vendor/video-shotcraft/references/shots/effects/radial-ripple-phone-chips.md)
- [riso-print-hits](vendor/video-shotcraft/references/shots/effects/riso-print-hits.md)
- [scan-bracket-sweep](vendor/video-shotcraft/references/shots/effects/scan-bracket-sweep.md)
- [scanline-annotate-focus](vendor/video-shotcraft/references/shots/effects/scanline-annotate-focus.md)
- [scanline-assemble-flyin](vendor/video-shotcraft/references/shots/effects/scanline-assemble-flyin.md)
- [slam-entrance-moves](vendor/video-shotcraft/references/shots/effects/slam-entrance-moves.md)
- [spotlight-sweep-moves](vendor/video-shotcraft/references/shots/effects/spotlight-sweep-moves.md)
### interaction

- [autolayout-gap-dial](vendor/video-shotcraft/references/shots/interaction/autolayout-gap-dial.md)
- [canvas-materialize-moves](vendor/video-shotcraft/references/shots/interaction/canvas-materialize-moves.md)
- [chip-grid-single-select-blackout](vendor/video-shotcraft/references/shots/interaction/chip-grid-single-select-blackout.md)
- [collab-cursor-moves](vendor/video-shotcraft/references/shots/interaction/collab-cursor-moves.md)
- [glass-pill-dictation-typing](vendor/video-shotcraft/references/shots/interaction/glass-pill-dictation-typing.md)
- [hashtag-to-pill-materialize](vendor/video-shotcraft/references/shots/interaction/hashtag-to-pill-materialize.md)
- [picker-carousel-feature-cycle](vendor/video-shotcraft/references/shots/interaction/picker-carousel-feature-cycle.md)
- [segmented-thumb-hero](vendor/video-shotcraft/references/shots/interaction/segmented-thumb-hero.md)
- [theme-switch-moves](vendor/video-shotcraft/references/shots/interaction/theme-switch-moves.md)
- [type-and-filter](vendor/video-shotcraft/references/shots/interaction/type-and-filter.md)
- [voice-waveform-live](vendor/video-shotcraft/references/shots/interaction/voice-waveform-live.md)
### opening

- [brand-ink-open](vendor/video-shotcraft/references/shots/opening/brand-ink-open.md)
- [crane-rise-reveal](vendor/video-shotcraft/references/shots/opening/crane-rise-reveal.md)
- [dataviz-landscape-open](vendor/video-shotcraft/references/shots/opening/dataviz-landscape-open.md)
- [fracture](vendor/video-shotcraft/references/shots/opening/fracture.md)
- [icon-field-colorize](vendor/video-shotcraft/references/shots/opening/icon-field-colorize.md)
- [letterspace-materialize](vendor/video-shotcraft/references/shots/opening/letterspace-materialize.md)
- [magician-card-flourish](vendor/video-shotcraft/references/shots/opening/magician-card-flourish.md)
- [orbit-ring-title-open](vendor/video-shotcraft/references/shots/opening/orbit-ring-title-open.md)
- [spotlight-hero-card](vendor/video-shotcraft/references/shots/opening/spotlight-hero-card.md)
- [stroke-segment-build](vendor/video-shotcraft/references/shots/opening/stroke-segment-build.md)
- [text-as-mask](vendor/video-shotcraft/references/shots/opening/text-as-mask.md)
### outro

- [grain-dissolve](vendor/video-shotcraft/references/shots/outro/grain-dissolve.md)
- [logo-shrink-wordmark-lockup](vendor/video-shotcraft/references/shots/outro/logo-shrink-wordmark-lockup.md)
- [neon-triple-marquee](vendor/video-shotcraft/references/shots/outro/neon-triple-marquee.md)
- [outro-group-photo-launch](vendor/video-shotcraft/references/shots/outro/outro-group-photo-launch.md)
- [ui-strip-away-outro](vendor/video-shotcraft/references/shots/outro/ui-strip-away-outro.md)
- [ui-to-brand-morph](vendor/video-shotcraft/references/shots/outro/ui-to-brand-morph.md)
### rhythm

- [beat-cut-moves](vendor/video-shotcraft/references/shots/rhythm/beat-cut-moves.md)
- [beat-step-list-theme-cycle](vendor/video-shotcraft/references/shots/rhythm/beat-step-list-theme-cycle.md)
- [panel-grid-moves](vendor/video-shotcraft/references/shots/rhythm/panel-grid-moves.md)
- [quad-split-parallel-scenes](vendor/video-shotcraft/references/shots/rhythm/quad-split-parallel-scenes.md)
- [rhythm-interrupt-moves](vendor/video-shotcraft/references/shots/rhythm/rhythm-interrupt-moves.md)
- [sakuga-timing-shift](vendor/video-shotcraft/references/shots/rhythm/sakuga-timing-shift.md)
- [speed-ramp-freeze](vendor/video-shotcraft/references/shots/rhythm/speed-ramp-freeze.md)
- [trailer-grammar-moves](vendor/video-shotcraft/references/shots/rhythm/trailer-grammar-moves.md)
### transition

- [bottom-push-stack-wipe](vendor/video-shotcraft/references/shots/transition/bottom-push-stack-wipe.md)
- [card-flip-reveal](vendor/video-shotcraft/references/shots/transition/card-flip-reveal.md)
- [card-flock-tumble](vendor/video-shotcraft/references/shots/transition/card-flock-tumble.md)
- [circle-match-iris](vendor/video-shotcraft/references/shots/transition/circle-match-iris.md)
- [gradient-transition](vendor/video-shotcraft/references/shots/transition/gradient-transition.md)
- [line-carry-transition](vendor/video-shotcraft/references/shots/transition/line-carry-transition.md)
- [mosaic-reframe](vendor/video-shotcraft/references/shots/transition/mosaic-reframe.md)
- [page-turn-transitions](vendor/video-shotcraft/references/shots/transition/page-turn-transitions.md)
- [print-texture-transitions](vendor/video-shotcraft/references/shots/transition/print-texture-transitions.md)
- [shot-transitions](vendor/video-shotcraft/references/shots/transition/shot-transitions.md)
- [tear-streak-transitions](vendor/video-shotcraft/references/shots/transition/tear-streak-transitions.md)
- [transition-hidden-cut](vendor/video-shotcraft/references/shots/transition/transition-hidden-cut.md)
- [transition-travel](vendor/video-shotcraft/references/shots/transition/transition-travel.md)
- [white-flash-logo-simplify-cut](vendor/video-shotcraft/references/shots/transition/white-flash-logo-simplify-cut.md)
- [wipe-transitions](vendor/video-shotcraft/references/shots/transition/wipe-transitions.md)
### typography

- [blur-slide](vendor/video-shotcraft/references/shots/typography/blur-slide.md)
- [brace-expand](vendor/video-shotcraft/references/shots/typography/brace-expand.md)
- [countdown-arc-scatter](vendor/video-shotcraft/references/shots/typography/countdown-arc-scatter.md)
- [document-typewriter-reveal](vendor/video-shotcraft/references/shots/typography/document-typewriter-reveal.md)
- [flying-words](vendor/video-shotcraft/references/shots/typography/flying-words.md)
- [glitch-cycle](vendor/video-shotcraft/references/shots/typography/glitch-cycle.md)
- [gradient-word-sweep](vendor/video-shotcraft/references/shots/typography/gradient-word-sweep.md)
- [lead-word-zoom-assemble](vendor/video-shotcraft/references/shots/typography/lead-word-zoom-assemble.md)
- [marker-underline-title](vendor/video-shotcraft/references/shots/typography/marker-underline-title.md)
- [outline-word-fill](vendor/video-shotcraft/references/shots/typography/outline-word-fill.md)
- [paper-title-card](vendor/video-shotcraft/references/shots/typography/paper-title-card.md)
- [pill-chip-slot-cycle-handled](vendor/video-shotcraft/references/shots/typography/pill-chip-slot-cycle-handled.md)
- [pill-slot-cycle](vendor/video-shotcraft/references/shots/typography/pill-slot-cycle.md)
- [text-column-converge](vendor/video-shotcraft/references/shots/typography/text-column-converge.md)
- [title-demote-to-label](vendor/video-shotcraft/references/shots/typography/title-demote-to-label.md)
- [type-assembly-moves](vendor/video-shotcraft/references/shots/typography/type-assembly-moves.md)
- [type-entrance-moves](vendor/video-shotcraft/references/shots/typography/type-entrance-moves.md)
- [type-rhythm-sync](vendor/video-shotcraft/references/shots/typography/type-rhythm-sync.md)
- [typewriter-moves](vendor/video-shotcraft/references/shots/typography/typewriter-moves.md)
- [vertical-word-roll-blur-cycle](vendor/video-shotcraft/references/shots/typography/vertical-word-roll-blur-cycle.md)
- [word-relay-filmstrip](vendor/video-shotcraft/references/shots/typography/word-relay-filmstrip.md)
- [word-relay-geometry](vendor/video-shotcraft/references/shots/typography/word-relay-geometry.md)
### ui-entrance

- [avatar-bracket-carousel](vendor/video-shotcraft/references/shots/ui-entrance/avatar-bracket-carousel.md)
- [bezier-source-converge-merge](vendor/video-shotcraft/references/shots/ui-entrance/bezier-source-converge-merge.md)
- [card-stack](vendor/video-shotcraft/references/shots/ui-entrance/card-stack.md)
- [carousel-3d](vendor/video-shotcraft/references/shots/ui-entrance/carousel-3d.md)
- [cloner-depth-echo](vendor/video-shotcraft/references/shots/ui-entrance/cloner-depth-echo.md)
- [deck-deal-flyin](vendor/video-shotcraft/references/shots/ui-entrance/deck-deal-flyin.md)
- [doc-park-left-pill-deal](vendor/video-shotcraft/references/shots/ui-entrance/doc-park-left-pill-deal.md)
- [draw-svg-trace](vendor/video-shotcraft/references/shots/ui-entrance/draw-svg-trace.md)
- [element-body-moves](vendor/video-shotcraft/references/shots/ui-entrance/element-body-moves.md)
- [integration-hub-map](vendor/video-shotcraft/references/shots/ui-entrance/integration-hub-map.md)
- [list-reveal](vendor/video-shotcraft/references/shots/ui-entrance/list-reveal.md)
- [list-stack-press](vendor/video-shotcraft/references/shots/ui-entrance/list-stack-press.md)
- [neon-frame-forerun](vendor/video-shotcraft/references/shots/ui-entrance/neon-frame-forerun.md)
- [neon-frame-orbit-drop](vendor/video-shotcraft/references/shots/ui-entrance/neon-frame-orbit-drop.md)
- [page-waterfall-wall](vendor/video-shotcraft/references/shots/ui-entrance/page-waterfall-wall.md)
- [product-card-progressive-assemble](vendor/video-shotcraft/references/shots/ui-entrance/product-card-progressive-assemble.md)
- [radial-wave](vendor/video-shotcraft/references/shots/ui-entrance/radial-wave.md)
- [research-card-stack-scroll](vendor/video-shotcraft/references/shots/ui-entrance/research-card-stack-scroll.md)
- [row-embed](vendor/video-shotcraft/references/shots/ui-entrance/row-embed.md)
- [value-stagger-gradient](vendor/video-shotcraft/references/shots/ui-entrance/value-stagger-gradient.md)
- [wall-reveal-moves](vendor/video-shotcraft/references/shots/ui-entrance/wall-reveal-moves.md)

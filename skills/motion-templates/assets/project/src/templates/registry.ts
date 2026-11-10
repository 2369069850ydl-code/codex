import type React from 'react';
import {Flicker} from './flicker/Flicker';
import * as fl from './flicker/presets';
import {LightScreen} from './sync/LightScreen';
import * as sy from './sync/presets';
import {DataTable} from './table/DataTable';
import * as tb from './table/presets';
import {Credits} from './credits/Credits';
import * as cr from './credits/presets';
import {Pwm} from './pwm/Pwm';
import * as pw from './pwm/presets';
import {ScrollList} from './list/ScrollList';
import * as ls from './list/presets';
import {SinePanel} from './sine/SinePanel';
import * as sn from './sine/presets';
import {Signal} from './signal/Signal';
import * as sg from './signal/presets';
import {SearchType} from './search/SearchType';
import * as se from './search/presets';
import {NumSplit} from './numsplit/NumSplit';
import * as nm from './numsplit/presets';
import {Player} from './player/Player';
import * as pl from './player/presets';
import {FrameSprite} from './frames/FrameSprite';
import * as fr from './frames/presets';
import {FramePulldown} from './frames/FramePulldown';
import {EraTags} from './era/EraTags';
import * as er from './era/presets';
import {Tuner} from './tuner/Tuner';
import * as tu from './tuner/presets';
import {scaled, slice} from './_lib/legacy';
import {PhoneDemo} from './phone/PhoneDemo';
import * as ph from './phone/presets';
import {PaperScatter} from './papers/PaperScatter';
import * as pp from './papers/presets';
import {NeonTitle} from './neon/NeonTitle';
import {CapsuleLight} from './neon/CapsuleLight';
import * as ne from './neon/presets';
import {TagActivate, TagCollapse} from './corners/CornerTags';
import * as co from './corners/presets';
import {LayerFlow} from './stack/LayerFlow';
import * as st from './stack/presets';
import {BarMeta} from './bars/BarMeta';
import * as ba from './bars/presets';
import {RelTree} from './tree/RelTree';
import * as tr from './tree/presets';
import {ChipChain} from './chips/ChipChain';
import * as ch from './chips/presets';
import {BranchTree} from './branch/BranchTree';
import * as bt from './branch/presets';
import {StepCards} from './steps/StepCards';
import * as sc from './steps/presets';
import {EndCard} from './endcard/EndCard';
import * as ec from './endcard/presets';
import {ValueWords} from './values/ValueWords';
import * as vw from './values/presets';
import {ArrowFocus} from './focus/ArrowFocus';
import * as af from './focus/presets';
import {UnitCounter} from './unit/UnitCounter';
import * as uc from './unit/presets';
import * as ig from './isogrid/presets';
import {TransferGrid} from './buffer/TransferGrid';
import * as bf2 from './buffer/presets2';
import {SpectrumBar} from './bento/SpectrumBar';
import {SpectrumChart} from './bento/SpectrumChart';
import * as bn from './bento/presets';
import {HeatCube} from './heat/HeatCube';
import {Balance} from './heat/Balance';
import * as ht from './heat/presets';
import {TvClock} from './tvclock/TvClock';
import * as tv from './tvclock/presets';
import {BufferGrid} from './buffer/BufferGrid';
import * as bf from './buffer/presets';
import {LampTrio} from './lamps/LampTrio';
import * as lp from './lamps/presets';
import {ChannelScale} from './adc/ChannelScale';
import * as ad from './adc/presets';
import {CardGrid} from '../CardGrid/CardGrid';
import {sampleA as cardA} from '../CardGrid/samples';
import {Domino} from '../Domino/Domino';
import {dominoA} from '../Domino/samples';
import {Voices} from '../Voices/Voices';
import {voicesA} from '../Voices/samples';
import {Multiply} from '../Multiply/Multiply';
import {multiplyA} from '../Multiply/samples';
import {Fin} from '../Fin/Fin';
import {finA} from '../Fin/samples';
import {Layers} from '../Layers/Layers';
import {layersA} from '../Layers/samples';
import {Lidar} from '../Lidar/Lidar';
import {lidarA} from '../Lidar/samples';

// Template catalog. `no` follows the reference-library index (复刻工作区/screen/list.txt + 1);
// T096-T100 are the video-pack templates. `ref` is the reference clip (analysis only, never shipped).
export type TemplateDef = {
  no: number;
  slug: string;
  name: string;
  family: string;
  ref: string;
  component: React.FC<any>;
  props: {durationInFrames: number} & Record<string, unknown>;
  size?: [number, number]; // default 1920x1080; the first 3D replicas still render at 852x480
};

const fx = (no: number, slug: string, name: string, ref: string, props: TemplateDef['props']): TemplateDef => ({no, slug, name, family: 'flicker', ref, component: Flicker, props});

const def = (no: number, slug: string, name: string, family: string, ref: string, component: React.FC<any>, props: TemplateDef['props']): TemplateDef => ({no, slug, name, family, ref, component, props});

export const TEMPLATES: TemplateDef[] = [
  fx(66, 'flicker-axes', '波形面板与坐标强调', 'BV1ua4y127pk_01', fl.flickerAxes),
  fx(67, 'flicker-shutter', '采样线与快门滑杆', 'BV1ua4y127pk_02', fl.flickerShutter),
  fx(47, 'flicker-hatch', '采样面积与斜线填充', 'BV1ua4y127pk_03', fl.flickerHatch),
  fx(68, 'flicker-sync', '帧率切换与采样加密', 'BV1ua4y127pk_05', fl.flickerSync),
  fx(48, 'flicker-sync-fill', '采样面积同步对齐', 'BV1ua4y127pk_06', fl.flickerSyncFill),
  fx(49, 'flicker-phase', '错相采样波形', 'BV1ua4y127pk_07', fl.flickerPhase),
  fx(50, 'flicker-roll', '帧率滚动与面积比较', 'BV1ua4y127pk_08', fl.flickerRoll),
  fx(84, 'flicker-split', '波形让位与结果联动', 'BV1ua4y127pk_04', fl.flickerSplit),
  fx(51, 'flicker-level', '遮罩齐平消除差异', 'BV1ua4y127pk_09', fl.flickerLevel),
  def(52, 'light-vs-screen', '整体闪烁与扫描线对比', 'sync', 'BV1ua4y127pk_11', LightScreen, sy.lightVsScreen),
  def(18, 'camera-merge', '摄像机贴图与空间叠合', 'sync', 'BV1ua4y127pk_12', LightScreen, sy.cameraMerge),
  def(69, 'data-table', '参数表展开与说明补入', 'table', 'BV1ua4y127pk_13', DataTable, tb.shutterTable),
  def(30, 'end-credits', '片尾多窗口与角色字幕', 'credits', 'BV1ua4y127pk_14', Credits, cr.creditsA),
  def(85, 'pwm-dimmer', '开关占空比与亮度联动', 'pwm', 'BV1ua4y127pk_10', Pwm, pw.pwmA),
  def(61, 'scroll-list', '算式列表逐行高亮', 'list', 'BV1hp4y1f7B5_08', ScrollList, ls.factorList),
  def(59, 'sine-panel', '波形绘制与双栏切换', 'sine', 'BV1hp4y1f7B5_02', SinePanel, sn.acPanel),
  def(62, 'signal-clash', '窗口分栏与曲线冲突', 'signal', 'BV1hp4y1f7B5_16', Signal, sg.signalClash),
  def(63, 'signal-fix', '曲线错位与解决提示', 'signal', 'BV1hp4y1f7B5_17', Signal, sg.signalFix),
  def(78, 'search-type', '搜索框展开面板', 'search', 'BV1hp4y1f7B5_07', SearchType, se.searchLight),
  def(80, 'search-capsule', '黑色搜索胶囊', 'search', 'BV1hp4y1f7B5_14', SearchType, se.searchCapsule),
  def(79, 'scroll-list-chat', '问题气泡与结果补充', 'list', 'BV1hp4y1f7B5_09', ScrollList, ls.factorChat),
  def(73, 'number-split', '数字圆形分裂', 'numsplit', 'BV1hp4y1f7B5_05', NumSplit, nm.split50),
  def(81, 'player-morph', '播放器横竖版变形', 'player', 'BV1hp4y1f7B5_19', Player, pl.playerMorph),
  def(42, 'ball-frames', '小球序列转帧阵列', 'frames', 'BV1hp4y1f7B5_10', FrameSprite, fr.ballFrames),
  def(43, 'frame-pulldown', '逐帧填充与节奏标注', 'frames', 'BV1hp4y1f7B5_12', FramePulldown, fr.pulldown),
  def(44, 'era-tags', '黑白转彩色与年代标签', 'era', 'BV1hp4y1f7B5_15', EraTags, er.eraTags),
  def(60, 'frame-tuner', '滑杆联动波形', 'tuner', 'BV1hp4y1f7B5_06', Tuner, tu.frameTuner),
  def(16, 'phone-turn', '手机转向与版式让位', 'phone', 'BV1hp4y1f7B5_11', PhoneDemo, ph.phoneTurn),
  def(17, 'phone-flip', '手机背面翻转与屏幕动画', 'phone', 'BV1hp4y1f7B5_13', PhoneDemo, ph.phoneFlip),
  def(25, 'paper-reveal', '纸片翻转揭示', 'papers', 'BV1hp4y1f7B5_01', PaperScatter, pp.paperReveal),
  def(74, 'neon-title', '渐变大字与释义', 'neon', 'BV1hZ421g7xC_01', NeonTitle, ne.hdrTitle),
  def(82, 'capsule-light', '霓虹胶囊描边点亮', 'neon', 'BV1hZ421g7xC_02', CapsuleLight, ne.capsuleLight),
  def(83, 'tag-activate', '四角标签逐个激活', 'corners', 'BV1hZ421g7xC_03', TagActivate, co.tagActivate),
  def(29, 'tag-collapse', '四角布局重排成单列', 'corners', 'BV1hZ421g7xC_04', TagCollapse, co.tagCollapse),
  def(45, 'layer-upload', '上传进入分层处理', 'stack', 'BV1hZ421g7xC_07', LayerFlow, st.layerUpload),
  def(46, 'layer-process', '分层处理与输出流程', 'stack', 'BV1hZ421g7xC_08', LayerFlow, st.layerProcess),
  def(65, 'bar-meta', '柱图与虚线叠加', 'bars', 'BV1hZ421g7xC_06', BarMeta, ba.barMeta),
  def(64, 'rel-tree', '关系图连线生长', 'tree', 'BV1hZ421g7xC_05', RelTree, tr.relTree),
  def(19, 'chip-row', '芯片图标横向阵列', 'chips', 'BV17F4m1T7M2_06', ChipChain, ch.chipRow),
  def(20, 'chip-tier', '三图标扩成层级阵列', 'chips', 'BV17F4m1T7M2_08', ChipChain, ch.chipTier),
  def(21, 'branch-tree', '分类树分支与案例逐项出现', 'branch', 'BV1aa411o76R_01', BranchTree, bt.visualIllusions),
  def(23, 'step-cards', '六步流程卡片依次建立', 'steps', 'BV1Ec411z7j2_02', StepCards, sc.sixSteps),
  def(22, 'end-card', '片尾媒体卡与行动标签', 'endcard', 'BV1aa411o76R_11', EndCard, ec.endCard),
  def(27, 'group-swap', '阵列换组与标签', 'legacy', 'BV1hp4y1f7B5_04', CardGrid, ig.groupSwap as unknown as TemplateDef['props']),
  def(70, 'value-words', '三行价值大字与弧形刻度', 'values', 'BV17F4m1T7M2_07', ValueWords, vw.valueWords),
  def(71, 'arrow-focus', '箭头聚焦与标题替换', 'focus', 'BV1Ec411z7j2_01', ArrowFocus, af.arrowFocus),
  def(72, 'unit-counter', '单位揭示与数值颜色联动', 'unit', 'BV1Fv411H7P5_03', UnitCounter, uc.colorTemp),
  def(75, 'tv-clock', '实际时间与播放时间对照', 'tvclock', 'BV1fKMBz3E8j_02', TvClock, tv.tvClock),
  def(76, 'buffer-freeze', '持续缓存到触发定格', 'buffer', 'BV1fKMBz3E8j_04', BufferGrid, bf.bufferFreeze),
  def(94, 'lamp-reveal', '三个对象逐项揭示参数', 'lamps', 'BV1Fv411H7P5_04', LampTrio, lp.lampReveal),
  def(77, 'lamp-white-balance', '切换比较基准与结果展示', 'lamps', 'BV1Fv411H7P5_05', LampTrio, lp.lampWhiteBalance),
  def(39, 'adc-scale', '并行通道扩容与数据输出', 'adc', 'BV1fKMBz3E8j_01', ChannelScale, ad.adcScale),
  def(58, 'mem-to-disk', '缓存阵列转存与占用增长', 'buffer', 'BV1fKMBz3E8j_03', TransferGrid, bf2.memToDisk),
  def(56, 'spectrum-bar', '光谱区间揭示与面板重排', 'bento', 'BV1DM6GY4Edo_01', SpectrumBar, bn.spectrumBar),
  def(57, 'spectrum-chart', '曲线与有效区间叠加', 'bento', 'BV1DM6GY4Edo_06', SpectrumChart, bn.spectrumChart),
  def(40, 'heat-color', '输入驱动颜色与标尺变化', 'heat', 'BV1Fv411H7P5_02', HeatCube, ht.heatColor),
  def(41, 'balance', '双变量平衡与偏移', 'heat', 'BV1Fv411H7P5_06', Balance, ht.balanceWB),
  // first replicas, adapted
  def(26, 'iso-card-grid', '等距国家卡片阵列', 'legacy', 'BV1hp4y1f7B5_03', CardGrid, cardA as unknown as TemplateDef['props']),
  def(28, 'card-domino', '素材卡翻为多米诺', 'legacy', 'BV1hp4y1f7B5_18', Domino, dominoA as unknown as TemplateDef['props']),
  def(24, 'comment-bubbles', '单条反馈扩展为群体声量', 'legacy', 'BV1Ec411z7j2_04', scaled(Voices), voicesA as unknown as TemplateDef['props']),
  {...def(2, 'infinite-array', '单体复制为无穷阵列', 'legacy', 'BV17F4m1T7M2_11', Multiply, multiplyA as unknown as TemplateDef['props']), size: [852, 480]},
  {...def(5, 'fin-stand-up', '平面结构立起并包覆', 'legacy', 'BV17F4m1T7M2_15', slice(Fin, 0), {durationInFrames: 360, inner: finA}), size: [852, 480]},
  {...def(6, 'fin-copy-title', '鳍片复制与标题落版', 'legacy', 'BV17F4m1T7M2_16', slice(Fin, 360), {durationInFrames: 239, inner: finA}), size: [852, 480]},
  {...def(13, 'layer-explode', '三通道结构逐层装配', 'legacy', 'BV1DM6GY4Edo_07', Layers, layersA as unknown as TemplateDef['props']), size: [852, 480]},
  {...def(37, 'lidar-scan', '扫描往返与坐标生成', 'legacy', 'BV1DM6GY4Edo_03', slice(Lidar, 15), {durationInFrames: 252, inner: lidarA}), size: [852, 480]},
  {...def(38, 'lidar-peak', '短时输入与峰值对照', 'legacy', 'BV1DM6GY4Edo_04', slice(Lidar, 270), {durationInFrames: 234, inner: lidarA}), size: [852, 480]},
];

export const compId = (t: TemplateDef) => `T${String(t.no).padStart(3, '0')}-${t.slug}`;

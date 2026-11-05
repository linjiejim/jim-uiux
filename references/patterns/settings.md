# 设置页

gallery 的「模式 · 设置页」页是完整实现：`gallery/src/gallery/pages/settings-pattern.tsx`。

## 结构

```
Page width="narrow"（720）
├─ PageHeader「设置」
├─ SettingsSection：小标题 + 一组 SettingRow，行之间用细线分开，外面不包卡片
│   └─ SettingRow：左边是名称 + 一行说明，右边是控件（手机上控件换到下一行）
├─ ……
├─ SettingsSection「危险操作」放在最后
└─ SaveBar：有未保存的文本修改时，吸附在底部
```

- 分组多（> 5 组）时，左边加二级导航，或者在顶部用 Tabs 分页。不要把所有设置都塞进一页。

## 设置弹框（桌面 App 的偏好设置）

设置放在弹框里时（`DialogContent size="lg"`），用 `SettingsSection variant="grouped"`：

```
DialogHeader「设置」
├─ SettingsSection grouped：小标题（可带一个 lucide 图标）在卡片外
│   └─ 卡片：bg-sunken + 1px 边框，SettingRow 之间细线
└─ ……
```

- 为什么不用设置页的「无卡片」：紧凑弹框里小标题只比行名大一点，几组连在一起分不清边界。
- 每组 2–5 行；超过 5 组时改成左侧导航的设置窗口。
- 保存方式同上：开关和选择立即生效；需要恢复默认之类的操作，用次要按钮放在行右侧。

## 保存方式

| 控件 | 保存方式 |
| --- | --- |
| Switch、Select、Segmented | 立即保存。效果看得见就不提示；看不见时（比如「刷新后生效」）用 `notify.success` |
| 文本输入框 | 改动先收集起来，`SaveBar` 出现（「有未保存的修改」+「放弃」+「保存」） |
| 危险操作（删除工作区、转移所有权） | 次要按钮，文字用红色 → ConfirmDialog（danger） |

- 同一行里不要混用两种保存方式。
- 离开页面时，如果还有没保存的文本修改，要先确认。
- 说明文字只写一行；需要更多解释时，加一个「了解更多」链接。

## 外观设置

固定是三个选项：跟随系统 / 浅色 / 深色，用 Segmented，立即生效（`useAppearance`）。不提供多套皮肤。

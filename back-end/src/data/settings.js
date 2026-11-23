"use strict";

const defaultSettings = { soundVolume: 70, ambientVolume: 50, language: "en" };
const labels = {
  en: { title: "Settings", sound: "Sound effects", ambient: "Ambient sound", language: "Language", apply: "Apply settings", saving: "Applying…", saved: "Settings applied.", timeout: "This is taking too long. Please try again." },
  zh: { title: "设置", sound: "音效音量", ambient: "环境音音量", language: "语言", apply: "应用设置", saving: "正在应用…", saved: "设置已应用。", timeout: "请求超时，请重试。" },
};
const languages = [{ value: "en", label: "English" }, { value: "zh", label: "Chinese" }];

module.exports = { defaultSettings, labels, languages };

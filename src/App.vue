<template>
  <div class="app-shell">
    <FourierCanvas ref="canvasComp" />

    <div class="toolbar">
      <button class="toolbar-btn" title="画笔设置" @click="openSettings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z"/>
        </svg>
      </button>
      <button class="toolbar-btn" :title="isPaused ? '继续' : '暂停'" @click="togglePause">
        <svg v-if="isPaused" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      </button>
      <button class="toolbar-btn" title="重新播放" @click="initFourier">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>
    </div>

    <div class="watermark">傅里叶级数画笔</div>

    <ControlPanel
      :visible="showSettings"
      :selectedPreset="selectedPreset"
      :customPath="customPath"
      :sampleCount="sampleCount"
      :isCustom="isCustom"
      @close="closeSettings"
      @update:selectedPreset="onPresetChange"
      @update:customPath="onCustomPathChange"
      @update:sampleCount="onSampleCountChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FourierCanvas from './components/FourierCanvas.vue'
import ControlPanel from './components/ControlPanel.vue'
import { useFourier } from './composables/useFourier.js'

const showSettings = ref(false)
const canvasComp = ref(null)

const canvasRef = computed({
  get: () => canvasComp.value?.canvasRef ?? null
})

const {
  sampleCount,
  selectedPreset,
  customPath,
  isPaused,
  isCustom,
  initFourier,
  handlePresetChange,
  togglePause
} = useFourier(canvasRef)

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function onPresetChange(val) {
  selectedPreset.value = val
  handlePresetChange()
}

function onCustomPathChange(val) {
  customPath.value = val
  initFourier()
}

function onSampleCountChange(val) {
  sampleCount.value = val
  initFourier()
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #1a1a2e;
  overflow: hidden;
}
</style>

<style scoped>
.app-shell {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.toolbar {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #555;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toolbar-btn:hover {
  background: #e9ecef;
  color: #222;
}
.toolbar-btn:active {
  background: #dee2e6;
}
.watermark {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  user-select: none;
  letter-spacing: 0.5px;
}
</style>

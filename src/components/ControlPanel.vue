<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      <h2>画笔设置</h2>

      <div class="setting-group">
        <label>选择预设图案</label>
        <select :value="selectedPreset" @change="$emit('update:selectedPreset', $event.target.value)">
          <option value="infinity">无限符号 (∞)</option>
          <option value="note">音乐符号 (♪)</option>
          <option value="custom">自定义 SVG Path</option>
        </select>
      </div>

      <div v-if="isCustom" class="setting-group">
        <label>输入 SVG Path 数据 (d 属性)</label>
        <input
          type="text"
          :value="customPath"
          placeholder="例如: M 10 10 L 90 10 ..."
          @change="$emit('update:customPath', $event.target.value)"
        />
      </div>

      <div class="setting-group">
        <label>周转圆数量（采样点 N）: {{ sampleCount }}</label>
        <div class="slider-container">
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            :value="sampleCount"
            @input="$emit('update:sampleCount', Number($event.target.value))"
          />
        </div>
      </div>

      <p class="footer-hint">
        圆按照振幅由大到小嵌套排列。改变采样数可观察逼近拟合的精度变化。
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  selectedPreset: { type: String, required: true },
  customPath: { type: String, default: '' },
  sampleCount: { type: Number, required: true },
  isCustom: { type: Boolean, default: false }
})

defineEmits([
  'close',
  'update:selectedPreset',
  'update:customPath',
  'update:sampleCount'
])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  border: none;
  background: none;
  font-size: 28px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  padding: 4px;
}
.close-btn:hover {
  color: #333;
}
h2 {
  color: #2c3e50;
  margin: 0 0 20px;
  font-size: 20px;
}
.setting-group {
  margin-bottom: 18px;
}
label {
  display: block;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 6px;
  font-size: 14px;
}
select,
input[type='text'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccd1d9;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
  color: #434a54;
  outline: none;
  transition: border-color 0.2s;
}
select:focus,
input[type='text']:focus {
  border-color: #3498db;
}
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}
input[type='range'] {
  flex: 1;
}
.footer-hint {
  margin-top: 16px;
  font-size: 12px;
  color: #aab2bd;
  border-top: 1px solid #e6e9ed;
  padding-top: 12px;
}
</style>

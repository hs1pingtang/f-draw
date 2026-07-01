<template>
  <div ref="containerRef" class="canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
const containerRef = ref(null)
let resizeObserver = null

function resizeCanvas() {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const rect = container.getBoundingClientRect()
  const size = Math.min(rect.width, rect.height)
  // canvas.width = Math.max(Math.floor(size), 100)
  canvas.width = 1400
  canvas.height = Math.max(Math.floor(size), 100)
}

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

defineExpose({ canvasRef })
</script>

<style scoped>
.canvas-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
canvas {
  display: block;
}
</style>

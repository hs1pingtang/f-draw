import { ref, onMounted, onBeforeUnmount, computed, watchEffect } from 'vue'
import { presets } from '../constants/presets.js'

/**
 * 离散傅里叶变换 (DFT) - 将离散的时间序列信号变换为频域的旋转圆参数
 */
function computeDFT(x) {
  const X = []
  const N = x.length
  for (let k = 0; k < N; k++) {
    let re = 0
    let im = 0
    for (let n = 0; n < N; n++) {
      const phi = (Math.PI * 2 * k * n) / N
      re += x[n].re * Math.cos(phi) + x[n].im * Math.sin(phi)
      im += -x[n].re * Math.sin(phi) + x[n].im * Math.cos(phi)
    }
    re = re / N
    im = im / N
    X.push({
      freq: k,
      amp: Math.sqrt(re * re + im * im),
      phase: Math.atan2(im, re)
    })
  }
  return X
}

/**
 * 均匀采样 SVG 路径
 */
function samplePath(svgPathStr, count, centerX = 275, centerY = 275) {
  const svgNS = 'http://www.w3.org/2000/svg'
  const pathEl = document.createElementNS(svgNS, 'path')
  pathEl.setAttributeNS(null, 'd', svgPathStr)

  const totalLength = pathEl.getTotalLength()
  const points = []
  let sumX = 0
  let sumY = 0

  for (let i = 0; i < count; i++) {
    const length = (totalLength * i) / count
    const pt = pathEl.getPointAtLength(length)
    points.push({ re: pt.x, im: pt.y })
    sumX += pt.x
    sumY += pt.y
  }

  const offsetX = centerX - sumX / count
  const offsetY = centerY - sumY / count
  return points.map((p) => ({ re: p.re + offsetX, im: p.im + offsetY }))
}

/**
 * 核心钩子：管理傅里叶级数绘制的状态与动画循环
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef - canvas元素引用
 */
export function useFourier(canvasRef) {
  const sampleCount = ref(180)
  const selectedPreset = ref('infinity')
  const customPath = ref('')
  const isPaused = ref(false)

  const isCustom = computed(() => selectedPreset.value === 'custom')

  let animationFrameId = null
  let epicycles = []
  let drawingPath = []
  let time = 0
  let started = false

  function getEffectivePath() {
    return isCustom.value
      ? customPath.value || presets.infinity
      : presets[selectedPreset.value]
  }

  function draw() {
    if (isPaused.value) {
      animationFrameId = requestAnimationFrame(draw)
      return
    }

    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 1. 依次相加叠加态向量，绘制旋转圆
    let x = 0
    let y = 0

    for (let i = 0; i < epicycles.length; i++) {
      const prevX = x
      const prevY = y
      const { freq, amp, phase } = epicycles[i]
      const theta = freq * time + phase

      x += amp * Math.cos(theta)
      y += amp * Math.sin(theta)

      if (amp > 0.5) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(52, 152, 219, ${Math.max(0.05, 0.4 - i * 0.005)})`
        ctx.lineWidth = 1
        ctx.arc(prevX, prevY, amp, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = i === 0 ? '#e74c3c' : '#2ecc71'
        ctx.lineWidth = i === 0 ? 2 : 1
        ctx.stroke()
      }
    }

    // 2. 存入并绘制路径轨迹
    drawingPath.unshift({ x, y })

    ctx.beginPath()
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 0; i < drawingPath.length; i++) {
      if (i === 0) ctx.moveTo(drawingPath[i].x, drawingPath[i].y)
      else ctx.lineTo(drawingPath[i].x, drawingPath[i].y)
    }
    ctx.stroke()

    // 3. 时间步进
    const dt = (Math.PI * 2) / epicycles.length
    time += dt

    if (time >= Math.PI * 2) {
      time = 0
      drawingPath = []
    }

    animationFrameId = requestAnimationFrame(draw)
  }

  function initFourier() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)

    try {
      const canvas = canvasRef.value
      if (!canvas) {
        started = true
        return
      }
      const signal = samplePath(getEffectivePath(), sampleCount.value, canvas.width / 2, canvas.height / 2)
      const dftResult = computeDFT(signal)
      epicycles = dftResult.sort((a, b) => b.amp - a.amp)
      time = 0
      drawingPath = []
      isPaused.value = false
      started = true
      if (canvasRef.value) {
        draw()
      }
    } catch (e) {
      alert('SVG 路径解析失败，请检查数据格式是否正确！')
      selectedPreset.value = 'infinity'
      initFourier()
    }
  }

  function handlePresetChange() {
    if (!isCustom.value) {
      initFourier()
    }
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  onMounted(() => {
    const unwatch = watchEffect(() => {
      if (canvasRef.value && !started) {
        initFourier()
        unwatch()
      }
    })
  })

  onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })

  return {
    sampleCount,
    selectedPreset,
    customPath,
    isPaused,
    isCustom,
    initFourier,
    handlePresetChange,
    togglePause
  }
}

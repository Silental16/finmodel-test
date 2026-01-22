import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  // Конфигурация
  const CURRENT_YEAR = 2026
  const DEFAULT_MIN_PERCENT = -20
  const DEFAULT_MAX_PERCENT = 200
  const BUFFER_PERCENT = 20
  const PADDING = { top: 40, right: 40, bottom: 80, left: 80 }

  // Состояния
  const [basePrice, setBasePrice] = useState(100000)
  const [years, setYears] = useState(30)
  const [completionYear, setCompletionYear] = useState(2028)
  const [growthPercent, setGrowthPercent] = useState(5)
  const [growthData, setGrowthData] = useState<number[]>(new Array(30).fill(0))
  const [minPercent, setMinPercent] = useState(DEFAULT_MIN_PERCENT)
  const [maxPercent, setMaxPercent] = useState(DEFAULT_MAX_PERCENT)
  const [selectedPointIndex, setSelectedPointIndex] = useState(0)

  // Refs для canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Состояние для drag-and-drop
  const isDraggingRef = useRef(false)
  const draggedPointIndexRef = useRef(-1)
  const dragStartYRef = useRef(0)
  const dragStartPercentRef = useRef(0)
  const originalValuesRef = useRef<number[]>([])

  // Размеры
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, chartWidth: 0, chartHeight: 0 })

  // Обновление размеров canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        canvasRef.current.width = width
        canvasRef.current.height = height
        setDimensions({
          width,
          height,
          chartWidth: width - PADDING.left - PADDING.right,
          chartHeight: height - PADDING.top - PADDING.bottom
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Обновление данных при изменении количества лет
  useEffect(() => {
    const newData = new Array(years).fill(0)
    if (growthData.length > 0) {
      for (let i = 0; i < Math.min(years, growthData.length); i++) {
        newData[i] = growthData[i]
      }
    }
    setGrowthData(newData)
    if (selectedPointIndex >= years) {
      setSelectedPointIndex(years - 1)
    }
  }, [years])

  // Функции для работы с графиком
  const percentToY = (percent: number) => {
    const range = maxPercent - minPercent
    const normalized = (percent - minPercent) / range
    return PADDING.top + dimensions.chartHeight * (1 - normalized)
  }

  const yToPercent = (y: number) => {
    const normalized = (y - PADDING.top) / dimensions.chartHeight
    const percent = minPercent + (1 - normalized) * (maxPercent - minPercent)
    return Math.max(minPercent, Math.min(maxPercent, percent))
  }

  const yearToX = (year: number) => {
    const normalized = year / (years - 1)
    return PADDING.left + normalized * dimensions.chartWidth
  }

  const getYearIndex = (year: number) => year - CURRENT_YEAR

  // Обновление динамического диапазона
  const updateDynamicRange = () => {
    const minValue = Math.min(...growthData)
    const maxValue = Math.max(...growthData)
    
    let newMin = Math.min(DEFAULT_MIN_PERCENT, minValue - BUFFER_PERCENT)
    let newMax = Math.max(DEFAULT_MAX_PERCENT, maxValue + BUFFER_PERCENT)
    
    newMin = Math.floor(newMin)
    newMax = Math.ceil(newMax)
    
    if (newMax - newMin < 50) {
      const center = (newMin + newMax) / 2
      newMin = Math.floor(center - 25)
      newMax = Math.ceil(center + 25)
    }
    
    setMinPercent(newMin)
    setMaxPercent(newMax)
  }

  // Отрисовка графика
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    updateDynamicRange()
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions

    // Очистка
    ctx.clearRect(0, 0, width, height)

    // Фон
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Сетка и оси
    drawAxes(ctx, width, height)
    
    // Линия графика
    drawLine(ctx)
    
    // Точки
    drawPoints(ctx)

    // Обновляем tooltip
    updateSelectedTooltip()
  }, [growthData, dimensions, minPercent, maxPercent, selectedPointIndex, completionYear, years])

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    // Горизонтальные линии (проценты)
    const range = maxPercent - minPercent
    let step = 50
    if (range > 500) step = 100
    else if (range > 200) step = 50
    else if (range > 100) step = 25
    else if (range > 50) step = 10
    else step = 5
    
    const startPercent = Math.ceil(minPercent / step) * step
    const endPercent = Math.floor(maxPercent / step) * step
    
    for (let percent = startPercent; percent <= endPercent; percent += step) {
      const y = percentToY(percent)
      ctx.beginPath()
      ctx.moveTo(PADDING.left, y)
      ctx.lineTo(width - PADDING.right, y)
      ctx.stroke()

      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(percent + '%', PADDING.left - 10, y + 4)
    }

    // Линия 0%
    if (0 >= minPercent && 0 <= maxPercent) {
      const y = percentToY(0)
      ctx.strokeStyle = '#999'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(PADDING.left, y)
      ctx.lineTo(width - PADDING.right, y)
      ctx.stroke()
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
    }

    // Вертикальные линии (годы)
    for (let i = 0; i < years; i += 5) {
      const x = yearToX(i)
      ctx.beginPath()
      ctx.moveTo(x, PADDING.top)
      ctx.lineTo(x, height - PADDING.bottom)
      ctx.stroke()
    }

    // Первая строка: номера лет
    for (let i = 0; i < years; i++) {
      const x = yearToX(i)
      ctx.fillStyle = '#666'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText((i + 1).toString(), x, height - PADDING.bottom + 15)
    }

    // Вторая строка: реальные годы
    const completionYearIndex = getYearIndex(completionYear)
    
    for (let i = 0; i < years; i += 5) {
      const x = yearToX(i)
      const year = CURRENT_YEAR + i
      ctx.fillStyle = '#666'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(year.toString(), x, height - PADDING.bottom + 30)
    }

    // Красная линия для года сдачи
    if (completionYearIndex >= 0 && completionYearIndex < years) {
      const completionX = yearToX(completionYearIndex)
      
      ctx.strokeStyle = '#dc3545'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(completionX, PADDING.top)
      ctx.lineTo(completionX, height - PADDING.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      const isAlreadyShown = (completionYearIndex % 5 === 0)
      if (!isAlreadyShown) {
        ctx.fillStyle = '#dc3545'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(completionYear.toString(), completionX, height - PADDING.bottom + 30)
      } else {
        ctx.fillStyle = '#dc3545'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(completionYear.toString(), completionX, height - PADDING.bottom + 30)
      }
    }

    // Оси
    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Рост стоимости (%)', 0, 0)
    ctx.restore()

    ctx.fillStyle = '#333'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Годы', width / 2, height - 10)
  }

  const drawLine = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#007bff'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < years; i++) {
      const x = yearToX(i)
      const y = percentToY(growthData[i])
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    const completionYearIndex = getYearIndex(completionYear)
    
    for (let i = 0; i < years; i++) {
      const x = yearToX(i)
      const y = percentToY(growthData[i])
      const isSelected = i === selectedPointIndex
      const isCompletionYear = i === completionYearIndex
      
      // Внешний круг для выделенной точки
      if (isSelected) {
        ctx.fillStyle = '#ffc107'
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Круг для точки
      if (isCompletionYear) {
        ctx.fillStyle = '#dc3545'
      } else {
        ctx.fillStyle = isSelected ? '#ff9800' : '#007bff'
      }
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
      
      // Обводка
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Текст с процентом изменения
      let changePercent: number
      if (i === 0) {
        changePercent = growthData[0]
      } else {
        changePercent = growthData[i] - growthData[i - 1]
      }
      
      if (Math.abs(changePercent) > 0.1) {
        const textY = y - 15
        const text = (changePercent > 0 ? '+' : '') + Math.round(changePercent) + '%'
        
        const textWidth = ctx.measureText(text).width
        const padding = 3
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(x - textWidth / 2 - padding, textY - 10, textWidth + padding * 2, 12)
        
        ctx.fillStyle = changePercent >= 0 ? '#28a745' : '#dc3545'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(text, x, textY)
      }
    }
  }

  const getPointAt = (x: number, y: number): number => {
    const threshold = 15
    for (let i = 0; i < years; i++) {
      const px = yearToX(i)
      const py = percentToY(growthData[i])
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
      if (distance < threshold) {
        return i
      }
    }
    return -1
  }

  const updateSelectedTooltip = () => {
    if (!tooltipRef.current || selectedPointIndex < 0 || selectedPointIndex >= years) return
    
    const percent = growthData[selectedPointIndex]
    const currentPrice = basePrice * (1 + percent / 100)
    const year = CURRENT_YEAR + selectedPointIndex
    const isCompletionYear = year === completionYear

    if (tooltipRef.current) {
      tooltipRef.current.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 6px; color: #007bff; font-size: 14px;">${year} ${isCompletionYear ? '(сдача юнита)' : '(выбрано)'}</div>
        <div style="margin: 4px 0; color: #555;">Рост: ${percent > 0 ? '+' : ''}${Math.round(percent)}%</div>
        <div style="margin: 4px 0; color: #555;">Стоимость: $${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
        <div style="margin-top: 8px; font-size: 11px; color: #888; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 6px;">↑↓ переместить | ←→ выбрать | Shift+↑↓ ±5%</div>
      `
      tooltipRef.current.style.left = '10px'
      tooltipRef.current.style.top = '10px'
      tooltipRef.current.style.opacity = '1'
    }
  }

  const handlePointDrag = (yearIndex: number, deltaY: number) => {
    const newPercent = yToPercent(dragStartYRef.current + deltaY)
    const deltaPercent = Math.round(newPercent - dragStartPercentRef.current)
    
    const newData = [...growthData]
    for (let i = yearIndex; i < years; i++) {
      const originalValue = originalValuesRef.current[i]
      newData[i] = Math.max(minPercent, Math.min(maxPercent, Math.round(originalValue + deltaPercent)))
    }
    
    setGrowthData(newData)
  }

  // Обработчики событий мыши
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const pointIndex = getPointAt(x, y)
    if (pointIndex !== -1) {
      setSelectedPointIndex(pointIndex)
      isDraggingRef.current = true
      draggedPointIndexRef.current = pointIndex
      dragStartYRef.current = y
      dragStartPercentRef.current = growthData[pointIndex]
      originalValuesRef.current = [...growthData]
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    
    if (isDraggingRef.current) {
      const deltaY = y - dragStartYRef.current
      handlePointDrag(draggedPointIndexRef.current, deltaY)
      updateSelectedTooltip()
    }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    draggedPointIndexRef.current = -1
  }

  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPointIndex < 0 || selectedPointIndex >= years) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedPointIndex(Math.max(0, selectedPointIndex - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedPointIndex(Math.min(years - 1, selectedPointIndex + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const delta = e.key === 'ArrowUp' ? 1 : -1
        const step = e.shiftKey ? 5 : 1
        const deltaPercent = delta * step
        
        const newData = [...growthData]
        for (let i = selectedPointIndex; i < years; i++) {
          newData[i] = Math.max(minPercent, Math.min(maxPercent, Math.round(newData[i] + deltaPercent)))
        }
        setGrowthData(newData)
      }
    }

    if (canvasRef.current) {
      canvasRef.current.addEventListener('keydown', handleKeyDown)
      return () => {
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [selectedPointIndex, years, growthData, minPercent, maxPercent])

  // Функции для управления
  const resetChart = () => {
    setGrowthData(new Array(years).fill(0))
    setSelectedPointIndex(0)
  }

  const applyAutoGrowth = () => {
    const newData: number[] = []
    let cumulativeGrowth = 0
    for (let i = 0; i < years; i++) {
      cumulativeGrowth += growthPercent
      newData.push(Math.round(cumulativeGrowth))
    }
    setGrowthData(newData)
    setSelectedPointIndex(0)
  }

  const exportData = () => {
    const data = {
      basePrice,
      currentYear: CURRENT_YEAR,
      completionYear,
      years,
      growthData: growthData.map((percent, index) => ({
        year: CURRENT_YEAR + index,
        yearIndex: index + 1,
        growthPercent: percent,
        price: basePrice * (1 + percent / 100)
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unit_price_growth_data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Unit Price Growth Control</CardTitle>
            <CardDescription>
              <div className="space-y-1 text-sm">
                <div><strong>Базовая цена юнита:</strong> ${basePrice.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                <div><strong>Диапазон:</strong> от {minPercent}% до +{maxPercent}% (автоматически расширяется)</div>
                <div><strong>Период:</strong> {years} лет</div>
                <div>Перетащите точки на графике вверх или вниз, чтобы изменить рост стоимости. Все точки справа от перемещенной точки поднимутся на ту же величину. Шаг изменения: 1%.</div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="basePrice">Базовая стоимость:</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={1000}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">$</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="years">Количество лет:</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value) || 30)}
                  min={5}
                  max={50}
                  step={1}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">лет</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="completionYear">Дата сдачи юнита:</Label>
                <Input
                  id="completionYear"
                  type="number"
                  value={completionYear}
                  onChange={(e) => setCompletionYear(parseInt(e.target.value) || 2028)}
                  min={CURRENT_YEAR}
                  max={CURRENT_YEAR + years - 1}
                  step={1}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">год</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="growthPercent">Рост каждый год:</Label>
                <Input
                  id="growthPercent"
                  type="number"
                  value={growthPercent}
                  onChange={(e) => setGrowthPercent(parseFloat(e.target.value) || 0)}
                  min={-100}
                  max={500}
                  step={1}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <Button onClick={applyAutoGrowth}>Применить</Button>
            </div>

            <div className="relative" ref={containerRef}>
              <canvas
                ref={canvasRef}
                tabIndex={0}
                className="w-full rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div
                ref={tooltipRef}
                className="pointer-events-none absolute left-2.5 top-2.5 rounded-lg border border-gray-200 bg-white/85 px-4 py-3 text-sm shadow-lg backdrop-blur-sm"
                style={{ opacity: 0, transition: 'opacity 0.2s' }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={resetChart}>Сбросить график к нулю</Button>
          <Button variant="outline" onClick={exportData}>Экспорт данных</Button>
        </div>
      </div>
    </div>
  )
}

export default App

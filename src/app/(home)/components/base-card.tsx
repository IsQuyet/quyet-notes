'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { ANIMATION_DELAY } from '@/consts'
import { useSize } from '@/hooks/use-size'
import { useLayoutEditStore } from '../stores/layout-edit-store'
import { useCenterStore } from '@/hooks/use-center'
import { useHomeLayout, type CardKey } from '../hooks/use-home-layout'
import DraggerSVG from '@/svgs/dragger.svg'

interface BaseCardProps {
	cardKey: CardKey
	children: React.ReactNode
	className?: string
	width?: number
	height?: number
	order?: number
}

export function BaseCard({ cardKey, children, className, width: propWidth, height: propHeight, order: propOrder }: BaseCardProps) {
	const { maxSM, init } = useSize()
	const center = useCenterStore()
	const layout = useHomeLayout()
	const editing = useLayoutEditStore(state => state.editing)
	const setOffset = useLayoutEditStore(state => state.setOffset)
	const setSize = useLayoutEditStore(state => state.setSize)
	
	const cardLayout = layout[cardKey]
	const { x, y, width: layoutWidth, height: layoutHeight, order: layoutOrder, enabled } = cardLayout
	
	const width = propWidth ?? layoutWidth
	const height = propHeight ?? layoutHeight
	const order = propOrder ?? layoutOrder
	
	const [show, setShow] = useState(false)
	const isDragging = useRef(false)

	// 追踪先前的编辑状态以检测进入/退出编辑模式的过渡
	const prevEditingRef = useRef(editing)
	const enteringEditing = editing && !prevEditingRef.current

	useEffect(() => {
		// 在渲染后更新 prevEditingRef 的值
		prevEditingRef.current = editing
	}, [editing])

	// 构建 transition 对象并显式断言为 any，避免 TypeScript 类型不兼容
	const transitionObj: any = (() => {
		const base = { type: 'spring' as const, stiffness: 260, damping: 26, mass: 1.3 }
		if (enteringEditing && !maxSM) {
			return { ...base, x: { duration: 0 }, y: { duration: 0 } }
		}
		return base
	})()

	useEffect(() => {
		if (show) return
		if (!maxSM && x === 0 && y === 0) return
		
		const delay = (maxSM && init ? 0 : order) * ANIMATION_DELAY * 1000
		const timer = setTimeout(() => setShow(true), delay)
		return () => clearTimeout(timer)
	}, [x, y, show, order, maxSM, init])

	if (!enabled) return null
	if (!show) return null

	const handlePointerDown = (e: React.PointerEvent) => {
		if (!editing) return
		if ((e.target as HTMLElement).closest('.resize-handle')) return

		isDragging.current = true
		const startX = e.clientX
		const startY = e.clientY
		const initialOffsetX = x - center.x
		const initialOffsetY = y - center.y

		const onPointerMove = (moveEvent: PointerEvent) => {
			if (!isDragging.current) return
			const dx = moveEvent.clientX - startX
			const dy = moveEvent.clientY - startY
			setOffset(cardKey, Math.round(initialOffsetX + dx), Math.round(initialOffsetY + dy))
		}

		const onPointerUp = () => {
			isDragging.current = false
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerUp)
		}

		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)
	}

	const handleResizeStart = (event: React.MouseEvent | React.TouchEvent) => {
		event.preventDefault()
		event.stopPropagation()
		
		const startX = 'clientX' in event ? event.clientX : event.touches[0].clientX
		const startY = 'clientY' in event ? event.clientY : event.touches[0].clientY
		const initialWidth = width
		const initialHeight = height

		const onMove = (moveEvent: MouseEvent | TouchEvent) => {
			const currentX = 'clientX' in moveEvent ? moveEvent.clientX : moveEvent.touches[0].clientX
			const currentY = 'clientY' in moveEvent ? moveEvent.clientY : moveEvent.touches[0].clientY
			const dx = currentX - startX
			const dy = currentY - startY
			setSize(cardKey, Math.max(50, initialWidth + dx), Math.max(50, initialHeight + dy))
		}

		const onEnd = () => {
			window.removeEventListener('mousemove', onMove)
			window.removeEventListener('mouseup', onEnd)
			window.removeEventListener('touchmove', onMove)
			window.removeEventListener('touchend', onEnd)
		}

		window.addEventListener('mousemove', onMove)
		window.addEventListener('mouseup', onEnd)
		window.addEventListener('touchmove', onMove)
		window.addEventListener('touchend', onEnd)
	}

	return (
		<>
			{/* 1. 操控层（Ghost Layer）：在编辑模式下显示，瞬时响应，拦截交互 */}
			{editing && !maxSM && (
				<div
					className='border-brand/70 bg-brand/5 absolute z-50 cursor-move rounded-[40px] border border-dashed select-none'
					style={{ left: x, top: y, width, height }}
					onPointerDown={handlePointerDown}
				>
					{/* Resize Handle */}
					{height !== undefined && (
						<div
							className='resize-handle absolute right-0 bottom-0 z-50 translate-x-1 translate-y-1 cursor-nwse-resize hover:scale-110 active:scale-125 transition-transform'
							onMouseDown={handleResizeStart}
							onTouchStart={handleResizeStart}
						>
							<DraggerSVG className='text-brand size-5' />
						</div>
					)}
				</div>
			)}

			{/* 2. 表现层（Content Layer）：带 Spring 动画追赶 Ghost Layer */}
			<motion.div
				key={String(maxSM)}
				className={cn(
					'card squircle absolute',
					!editing && 'z-10',
					editing && 'z-60 pointer-events-none', // 编辑模式下内容不可交互
					className,
					'max-sm:static'
				)}
				// 编辑模式（且非小屏）需要动画 width/height/left/top 以支持拉伸与精确定位
				// 非编辑模式优先使用 transform(x/y/scale) 做位移动画以减少回流
				// 对于非编辑模式（desktop）我们使用 transform(x/y) 做位移动画，
				// 因此需要把元素定位到 (0,0) 作为 transform 的基点；
				// 编辑模式下直接通过 left/top/width/height 控制以支持拉伸动画。
				style={
					editing && !maxSM ? { left: x, top: y, width, height } : { width, height, left: 0, top: 0 }
				}
				initial={
					editing && !maxSM
						? { opacity: 0, scale: 0.6, left: x, top: y, width, height, x: 0, y: 0 }
						: maxSM
						? { opacity: 0, y: 20 }
						: { opacity: 0, scale: 0.6, x, y }
				}
				animate={
					editing && !maxSM
						? { opacity: 1, scale: 1, left: x, top: y, width, height, x: 0, y: 0 }
						: maxSM
						? { opacity: 1, y: 0 }
						: { opacity: 1, scale: 1, x, y }
				}
				// 动画过渡：默认使用 spring；当刚进入编辑模式时立刻把 transform(x/y) 清零（duration:0），避免 left/top 与 transform 同时生效导致双倍偏移
				transition={transitionObj}
				whileHover={!editing ? { scale: 1.02 } : undefined}
				whileTap={!editing ? { scale: 0.98 } : undefined}
			>
				{children}
			</motion.div>
		</>
	)
}

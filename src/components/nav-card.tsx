'use client'

import Card from '@/components/card'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ScrollFilledSVG from '@/svgs/scroll-filled.svg'
import ProjectsFilledSVG from '@/svgs/projects-filled.svg'
import ProjectsOutlineSVG from '@/svgs/projects-outline.svg'
import AboutFilledSVG from '@/svgs/about-filled.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import ShareFilledSVG from '@/svgs/share-filled.svg'
import ShareOutlineSVG from '@/svgs/share-outline.svg'
import WebsiteFilledSVG from '@/svgs/website-filled.svg'
import WebsiteOutlineSVG from '@/svgs/website-outline.svg'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'

const AvatarIcon = ({ className }: { className?: string }) => (
	<Image
		src='/images/avatar.png'
		alt='avatar'
		width={40}
		height={40}
		style={{ boxShadow: ' 0 12px 20px -5px #E2D9CE' }}
		className={cn('rounded-full object-cover', className)}
	/>
)

const list = [
	{
		icon: AvatarIcon,
		iconActive: AvatarIcon,
		label: '首页',
		href: '/',
		isHome: true
	},
	{
		icon: ScrollOutlineSVG,
		iconActive: ScrollFilledSVG,
		label: '近期文章',
		href: '/blog',
		isHome: false
	},
	{
		icon: ProjectsOutlineSVG,
		iconActive: ProjectsFilledSVG,
		label: '我的项目',
		href: '/projects',
		isHome: false
	},
	{
		icon: ShareOutlineSVG,
		iconActive: ShareFilledSVG,
		label: '推荐分享',
		href: '/share',
		isHome: false
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '优秀博客',
		href: '/bloggers',
		isHome: false
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于网站',
		href: '/about',
		isHome: false
	}
]

const extraSize = 8

const NavItemContent = ({ item, isHovered, children }: { item: (typeof list)[0]; isHovered: boolean; children?: React.ReactNode }) => {
	const Icon = isHovered ? item.iconActive : item.icon
	return (
		<div
			className={cn(
				'flex items-center gap-3 transition-transform duration-300 ease-out origin-left',
				isHovered ? 'scale-110' : 'scale-100'
			)}>
			<div className='flex h-7 w-7 items-center justify-center'>
				<Icon
					className={cn(
						'transition-colors duration-300',
						!item.isHome && 'h-7 w-7',
						!item.isHome && isHovered && 'text-brand'
					)}
				/>
			</div>
			{children}
		</div>
	)
}

export default function NavCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxSM } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number>(0)
	const [miniHovered, setMiniHovered] = useState(false)
	const [isHoveringNav, setIsHoveringNav] = useState(false)
	const { siteContent, cardStyles } = useConfigStore()
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
	}, [pathname])

	useEffect(() => {
		if (activeIndex !== undefined) {
			setHoveredIndex(activeIndex)
		}
	}, [activeIndex])

	useEffect(() => {
		setShow(true)
	}, [])

	let form = useMemo(() => {
		if (pathname === '/') return 'full'
		else if (pathname === '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxSM) form = 'icons'

	const itemHeight = form === 'full' ? 52 : 28

	let position = useMemo(() => {
		if (form === 'full') {
			const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING
			const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 - styles.height
			return { x, y }
		}

		return {
			x: 24,
			y: 16
		}
	}, [form, center, styles, hiCardStyles])

	const size = useMemo(() => {
		if (form === 'mini') return { width: 64, height: 64 }
		else if (form === 'icons') return { width: 340, height: 64 }
		else return { width: styles.width, height: styles.height }
	}, [form, styles])

	useEffect(() => {
		if (form !== 'mini' && !isHoveringNav && activeIndex !== undefined && hoveredIndex !== activeIndex) {
			const timer = setTimeout(() => {
				setHoveredIndex(activeIndex)
			}, 500)
			return () => clearTimeout(timer)
		}
	}, [hoveredIndex, activeIndex, form, isHoveringNav])

	if (maxSM) position = { x: center.x - size.width / 2, y: 16 }

	if (show)
		return (
			<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={styles.width} height={styles.height}>
				<Card
					order={styles.order}
					width={size.width}
					height={size.height}
					x={position.x}
					y={position.y}
					className={cn(form !== 'full' && 'overflow-hidden', form === 'mini' && 'p-3', form === 'icons' && 'flex items-center gap-6 p-3')}>
					{form === 'full' && siteContent.enableChristmas && (
						<>
							<img
								src='/images/christmas/snow-4.webp'
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 160, left: -18, top: -20, opacity: 0.9 }}
							/>
						</>
					)}

					{form === 'mini' && (
						<Link
							className='flex items-center gap-3'
							href='/'
							onMouseEnter={() => setMiniHovered(true)}
							onMouseLeave={() => setMiniHovered(false)}>
							<NavItemContent item={list[0]} isHovered={miniHovered} />
						</Link>
					)}

					{(form === 'full' || form === 'icons') && (
						<>
							{form !== 'icons' && <div className='text-secondary mt-6 text-sm '>导航栏</div>}

							<div
								className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0 flex items-center gap-6 space-y-0')}
								onMouseEnter={() => setIsHoveringNav(true)}
								onMouseLeave={() => setIsHoveringNav(false)}>
								<motion.div
									className='absolute max-w-[230px] rounded-full border'
									layoutId='nav-hover'
									initial={false}
									animate={
										form === 'icons'
											? {
													left: hoveredIndex * (itemHeight + 24) - extraSize,
													top: -extraSize,
													width: itemHeight + extraSize * 2,
													height: itemHeight + extraSize * 2
												}
											: { top: hoveredIndex * (itemHeight + 8), left: 0, width: '100%', height: itemHeight }
									}
									transition={{
										type: 'spring',
										stiffness: 400,
										damping: 30
									}}
									style={{ backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' }}
								/>

								{list.map((item, index) => {
									const isHovered = hoveredIndex === index
									return (
										<Link
											key={item.href}
											href={item.href}
											className={cn('text-secondary text-md relative z-10 flex items-center gap-3 rounded-full px-5 py-3', form === 'icons' && 'p-0')}
											onMouseEnter={() => setHoveredIndex(index)}>
											<NavItemContent item={item} isHovered={isHovered}>
												{form !== 'icons' && (
													<span className={cn(isHovered && 'text-primary font-medium')}>
														{item.isHome ? siteContent.meta.title : item.label}
													</span>
												)}
											</NavItemContent>
										</Link>
									)
								})}
							</div>
						</>
					)}
				</Card>
			</HomeDraggableLayer>
		)
}

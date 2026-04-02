'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
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
import { BaseCard } from '@/app/(home)/components/base-card'
import { useLayoutEditStore } from '@/app/(home)/stores/layout-edit-store'

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
		label: '文章',
		href: '/blog',
		isHome: false
	},
	{
		icon: ProjectsOutlineSVG,
		iconActive: ProjectsFilledSVG,
		label: '项目',
		href: '/projects',
		isHome: false
	},
	{
		icon: ShareOutlineSVG,
		iconActive: ShareFilledSVG,
		label: '分享',
		href: '/share',
		isHome: false
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '友链',
		href: '/bloggers',
		isHome: false
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于',
		href: '/about',
		isHome: false
	}
]

const NavItemContent = ({
	item,
	isHovered,
	form,
	children
}: {
	item: (typeof list)[0]
	isHovered: boolean
	form: string
	children?: React.ReactNode
}) => {
	const Icon = isHovered ? item.iconActive : item.icon
	return (
		<div
			className={cn(
				'flex items-center gap-3 transition-transform duration-300 ease-out',
				form === 'icons' ? 'origin-center' : 'origin-left',
				isHovered ? 'scale-120' : 'scale-100'
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
	const { maxSM } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number>(0)
	const [miniHovered, setMiniHovered] = useState(false)
	const [isHoveringNav, setIsHoveringNav] = useState(false)
	const { siteContent, cardStyles } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const styles = cardStyles.navCard

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
	}, [pathname])

	useEffect(() => {
		if (activeIndex !== undefined) {
			setHoveredIndex(activeIndex)
		}
	}, [activeIndex])

	let form = useMemo(() => {
		if (pathname === '/') return 'full'
		else if (pathname === '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxSM) form = 'icons'

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

	return (
		<BaseCard
			cardKey='navCard'
			width={size.width}
			height={size.height}
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
					<NavItemContent item={list[0]} isHovered={miniHovered} form={form} />
				</Link>
			)}

			{(form === 'full' || form === 'icons') && (
				<>
					{form !== 'icons' && <div className='text-secondary text-sm '>导航栏</div>}

					<div
						className={cn('relative mt-2', form === 'icons' ? 'mt-0 flex w-full items-center justify-around' : 'flex flex-col space-y-2')}
						onMouseEnter={() => setIsHoveringNav(true)}
						onMouseLeave={() => setIsHoveringNav(false)}>
						{list.map((item, index) => {
							const isHovered = hoveredIndex === index
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'text-secondary text-md relative flex items-center rounded-full transition-colors',
										form === 'icons' ? 'p-2' : 'w-full gap-3 px-5 py-3'
									)}
									onMouseEnter={() => setHoveredIndex(index)}>
									{isHovered && (
										<motion.div
											{...(editing ? { layout: false } : { layoutId: 'nav-hover' })}
											className='absolute inset-0 rounded-full border'
											initial={false}
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 30
											}}
											style={{
												backgroundImage:
													'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)',
												zIndex: -1
											}}
										/>
									)}
									<NavItemContent item={item} isHovered={isHovered} form={form}>
										{form !== 'icons' && (
											<span className={cn(isHovered && 'text-primary font-medium')}>
												{item.label}
											</span>
										)}
									</NavItemContent>
								</Link>
							)
						})}
					</div>
				</>
			)}
		</BaseCard>
	)
}

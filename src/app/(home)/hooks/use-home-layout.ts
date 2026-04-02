'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useCenterStore } from '@/hooks/use-center'
import { useSize } from '@/hooks/use-size'
import { useConfigStore, type CardStyles } from '../stores/config-store'
import { CARD_SPACING } from '@/consts'

export type CardKey = keyof CardStyles

export interface CardLayout {
	x: number
	y: number
	width: number
	height: number
	enabled: boolean
	order: number
}

export function useHomeLayout() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { maxSM, init } = useSize()
	const { cardStyles } = useConfigStore()

	const isHomePage = pathname === '/'
	const isWritePage = pathname === '/write'

	const layout = useMemo(() => {
		const styles = cardStyles
		const res: Partial<Record<CardKey, CardLayout>> = {}

		// 辅助函数：获取基础布局信息
		const getBase = (key: CardKey): CardLayout => {
			const s = styles[key]
			return {
				x: 0,
				y: 0,
				width: s.width,
				height: s.height,
				enabled: s.enabled !== false,
				order: maxSM && init ? 0 : s.order
			}
		}

		// 1. HiCard（以 center 为参考）
		const hi = getBase('hiCard')
		hi.x = styles.hiCard.offsetX !== null ? center.x + styles.hiCard.offsetX : center.x - hi.width / 2
		hi.y = styles.hiCard.offsetY !== null ? center.y + styles.hiCard.offsetY : center.y - hi.height / 2
		res.hiCard = hi

		// 2. ArtCard
		const art = getBase('artCard')
		art.x = styles.artCard.offsetX !== null ? center.x + styles.artCard.offsetX : center.x - art.width / 2
		art.y = styles.artCard.offsetY !== null ? center.y + styles.artCard.offsetY : hi.y - art.height - CARD_SPACING
		res.artCard = art

		// 3. ClockCard
		const clock = getBase('clockCard')
		clock.x = styles.clockCard.offsetX !== null ? center.x + styles.clockCard.offsetX : hi.x + hi.width + CARD_SPACING
		clock.y = styles.clockCard.offsetY !== null ? center.y + styles.clockCard.offsetY : center.y - (styles.clockCard as any).offset - clock.height
		res.clockCard = clock

		// 4. CalendarCard
		const calendar = getBase('calendarCard')
		calendar.x = styles.calendarCard.offsetX !== null ? center.x + styles.calendarCard.offsetX : hi.x + hi.width + CARD_SPACING
		calendar.y = styles.calendarCard.offsetY !== null ? center.y + styles.calendarCard.offsetY : center.y - (styles.clockCard as any).offset + CARD_SPACING
		res.calendarCard = calendar

		// 5. SocialButtons
		const social = getBase('socialButtons')
		social.x = styles.socialButtons.offsetX !== null ? center.x + styles.socialButtons.offsetX : hi.x + hi.width - social.width
		social.y = styles.socialButtons.offsetY !== null ? center.y + styles.socialButtons.offsetY : hi.y + hi.height + CARD_SPACING
		res.socialButtons = social

		// 6. ArticleCard
		const article = getBase('articleCard')
		article.x =
			styles.articleCard.offsetX !== null
				? center.x + styles.articleCard.offsetX
				: hi.x + hi.width - social.width - CARD_SPACING - article.width
		article.y = styles.articleCard.offsetY !== null ? center.y + styles.articleCard.offsetY : hi.y + hi.height + CARD_SPACING
		res.articleCard = article

		// 7. ShareCard
		const share = getBase('shareCard')
		share.x = styles.shareCard.offsetX !== null ? center.x + styles.shareCard.offsetX : hi.x
		share.y = styles.shareCard.offsetY !== null ? center.y + styles.shareCard.offsetY : social.y + social.height + CARD_SPACING
		res.shareCard = share

		// 8. MusicCard
		const music = getBase('musicCard')
		if (!isHomePage) {
			music.x = center.width - music.width - 16
			music.y = center.height - music.height - 16
		} else {
			music.x =
				styles.musicCard.offsetX !== null
					? center.x + styles.musicCard.offsetX
					: hi.x + hi.width - (styles.musicCard as any).offset
			music.y =
				styles.musicCard.offsetY !== null
					? center.y + styles.musicCard.offsetY
					: calendar.y + calendar.height + CARD_SPACING
		}
		res.musicCard = music

		// 9. NavCard
		const nav = getBase('navCard')
		if (isHomePage) {
			nav.x = styles.navCard.offsetX !== null ? center.x + styles.navCard.offsetX : hi.x - nav.width - CARD_SPACING
			nav.y = styles.navCard.offsetY !== null ? center.y + styles.navCard.offsetY : hi.y + hi.height - nav.height
		} else {
			// 在 icons 或 mini 模式下，由于尺寸会变化，NavCard 的逻辑更复杂
			// 暂时保留 NavCard.tsx 中定义的基础 x/y 计算
			if (maxSM) {
				const navWidth = isHomePage ? styles.navCard.width : 340 // 对 icons 模式进行简化处理
				nav.x = center.x - navWidth / 2
				nav.y = 16
			} else {
				nav.x = 24
				nav.y = 16
			}
		}
		res.navCard = nav

		// 10. WriteButtons
		const write = getBase('writeButtons')
		write.x = styles.writeButtons.offsetX !== null ? center.x + styles.writeButtons.offsetX : hi.x + hi.width + CARD_SPACING
		write.y =
			styles.writeButtons.offsetY !== null
				? center.y + styles.writeButtons.offsetY
				: center.y - (styles.clockCard as any).offset - write.height - CARD_SPACING / 2 - clock.height
		res.writeButtons = write

		// 11. LikePosition
		const like = getBase('likePosition')
		like.x = styles.likePosition.offsetX !== null ? center.x + styles.likePosition.offsetX : share.x + share.width + CARD_SPACING
		like.y =
			styles.likePosition.offsetY !== null
				? center.y + styles.likePosition.offsetY
				: social.y + social.height + CARD_SPACING + music.height + CARD_SPACING
		res.likePosition = like

		// 12. HatCard
		const hat = getBase('hatCard')
		hat.x = styles.hatCard.offsetX !== null ? center.x + styles.hatCard.offsetX : center.x - hat.width / 2
		hat.y = styles.hatCard.offsetY !== null ? center.y + styles.hatCard.offsetY : center.y - hat.height
		res.hatCard = hat

		// 13. BeianCard
		const beian = getBase('beianCard')
		beian.x = styles.beianCard.offsetX !== null ? center.x + styles.beianCard.offsetX : hi.x + hi.width - beian.width + 200
		beian.y = styles.beianCard.offsetY !== null ? center.y + styles.beianCard.offsetY : hi.y + hi.height + CARD_SPACING + 180
		res.beianCard = beian

		return res as Record<CardKey, CardLayout>
	}, [center, cardStyles, maxSM, init, isHomePage])

	return layout
}

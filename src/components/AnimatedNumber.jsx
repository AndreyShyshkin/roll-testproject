import { motion as Motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, duration = 0.6 }) {
	const prev = useRef(value)
	const [display, setDisplay] = useState(value)

	useEffect(() => {
		const start = prev.current
		const diff = value - start
		if (diff === 0) return
		const startTime = performance.now()
		let frame
		const step = t => {
			const progress = Math.min(1, (t - startTime) / (duration * 1000))
			const eased = 1 - Math.pow(1 - progress, 3)
			setDisplay(Math.round(start + diff * eased))
			if (progress < 1) frame = requestAnimationFrame(step)
		}
		frame = requestAnimationFrame(step)
		prev.current = value
		return () => cancelAnimationFrame(frame)
	}, [value, duration])

	return (
		<Motion.span
			key={display}
			initial={{ y: 8, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.25 }}
		>
			{display.toLocaleString('en-US')}
		</Motion.span>
	)
}

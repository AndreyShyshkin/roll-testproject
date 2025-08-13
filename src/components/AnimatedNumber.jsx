import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, duration = 1.5 }) {
	const prev = useRef(value)
	const [display, setDisplay] = useState(value)

	useEffect(() => {
		const start = prev.current
		const diff = value - start
		if (diff === 0) return

		const animDuration = Math.abs(diff) > start ? duration * 1.2 : duration

		const startTime = performance.now()
		let frame
		const step = t => {
			const progress = Math.min(1, (t - startTime) / (animDuration * 1000))
			const eased = 1 - Math.pow(1 - progress, 1.8)
			setDisplay(Math.round(start + diff * eased))
			if (progress < 1) frame = requestAnimationFrame(step)
		}
		frame = requestAnimationFrame(step)
		prev.current = value
		return () => cancelAnimationFrame(frame)
	}, [value, duration])

	return <span>{display}</span>
}

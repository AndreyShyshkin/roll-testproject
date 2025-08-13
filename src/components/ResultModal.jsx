import { motion as Motion } from 'framer-motion'
import { useEffect } from 'react'
import diamond from '../assets/diamond.png'

const backdrop = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
}

const modal = {
	hidden: { y: 60, opacity: 0, scale: 0.9 },
	visible: {
		y: 0,
		opacity: 1,
		scale: 1,
		transition: { type: 'spring', stiffness: 220, damping: 22 },
	},
	exit: { y: 40, opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
}

const formatNumber = n => n.toLocaleString('en-US')

export default function ResultModal({
	isOpen,
	onClose,
	onRestart,
	type,
	baseValues = [],
	multiplier = 1,
	crystalCost = 20,
	canSave = false,
	onSave,
}) {
	useEffect(() => {
		const handler = e => {
			if (e.key === 'Escape') onClose?.()
		}
		if (isOpen) {
			window.addEventListener('keydown', handler)
			return () => window.removeEventListener('keydown', handler)
		}
	}, [onClose, isOpen])

	if (!isOpen) return null

	const title = type === 'bomb' ? 'Game Over' : 'Claim'
	const subtitle =
		type === 'bomb' ? 'Bomb triggered!' : 'You claimed your winnings.'

	const totalBase = baseValues.reduce((a, b) => a + b, 0)
	const balance = totalBase * multiplier

	return (
		<Motion.div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			variants={backdrop}
			initial='hidden'
			animate='visible'
			exit='hidden'
		>
			<div
				className='absolute inset-0 backdrop-blur-xl bg-slate-950/70'
				onClick={onClose}
			/>
			<Motion.div
				variants={modal}
				initial='hidden'
				animate='visible'
				exit='exit'
				className='relative w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 shadow-2xl p-6 overflow-hidden'
			>
				<div className='absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 pointer-events-none' />
				<div className='relative z-10'>
					<h2 className='text-xl font-bold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300'>
						{title}
					</h2>
					<p className='text-xs text-slate-400/80 mb-4'>{subtitle}</p>
					<div className='space-y-3'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-slate-400'>Base Total:</span>
							<span className='font-semibold text-emerald-300'>
								{formatNumber(totalBase)}
							</span>
						</div>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-slate-400'>Multiplier:</span>
							<span className='font-semibold text-indigo-300'>
								x{multiplier}
							</span>
						</div>
						<div className='flex items-center justify-between text-sm border-t border-slate-600/40 pt-3'>
							<span className='text-slate-400'>Final Balance:</span>
							<span className='font-bold text-emerald-400 text-lg'>
								{formatNumber(balance)}
							</span>
						</div>
					</div>
					<div className='mt-6 flex gap-3'>
						{type === 'bomb' && canSave && (
							<button
								onClick={() => onSave?.(onClose)}
								className='flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 font-semibold text-sm shadow-md hover:shadow-lg transition-shadow'
							>
								<span className='inline-flex items-center gap-1'>
									Save for {crystalCost}
									<img
										src={diamond}
										alt='crystals'
										className='w-4 h-4 select-none'
									/>
								</span>
							</button>
						)}
						<button
							onClick={onRestart}
							className='flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 font-semibold text-sm shadow-md hover:shadow-lg transition-shadow'
						>
							Restart
						</button>
						<button
							onClick={onClose}
							className='px-4 py-2 rounded-lg bg-slate-700/70 font-medium text-sm hover:bg-slate-600/70 border border-slate-600/50'
						>
							Close
						</button>
					</div>
				</div>
				{type === 'bomb' && (
					<div className='absolute inset-0 -z-10 opacity-40'>
						<div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,60,60,0.3),transparent_70%)] animate-ping' />
					</div>
				)}
			</Motion.div>
		</Motion.div>
	)
}

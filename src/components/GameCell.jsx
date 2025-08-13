import { motion as Motion } from 'framer-motion'
import bomb from '../assets/bomb.png'
import money from '../assets/money.png'
import mult from '../assets/mult.png'
import zero from '../assets/zero.png'
import AnimatedNumber from './AnimatedNumber.jsx'

const faceVariants = {
	hidden: { rotateY: 180 },
	visible: { rotateY: 0 },
}

const backVariants = {
	hidden: { rotateY: 0 },
	visible: { rotateY: -180 },
}

const typeStyles = {
	cash: 'text-emerald-300',
	mult: 'text-indigo-300',
	bomb: 'text-rose-400',
	zero: 'text-slate-400',
}

const typeIcons = {
	cash: money,
	mult: mult,
	bomb: bomb,
	zero: zero,
}

export default function GameCell({
	data,
	opened,
	onOpen,
	triggerBomb,
	index,
	displayValue,
}) {
	const { type } = data
	return (
		<button
			data-cell-index={index}
			className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl bg-slate-700/60 border border-slate-600/60 backdrop-blur-lg perspective [transform-style:preserve-3d] overflow-hidden group shadow-inner transition-transform active:scale-95 ${
				opened ? 'opened' : 'hover:border-slate-500/80'
			} ${triggerBomb ? 'animate-pulse ring-2 ring-rose-500/60' : ''}`}
			onClick={onOpen}
			disabled={opened}
		>
			<Motion.div
				className='absolute inset-0 flex items-center justify-center font-bold text-base sm:text-lg [backface-visibility:hidden]'
				variants={backVariants}
				initial='hidden'
				animate={opened ? 'visible' : 'hidden'}
				transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
			>
				<div className='w-full h-full flex items-center justify-center text-slate-300/80 text-xs sm:text-sm tracking-wide font-semibold uppercase'>
					Open
				</div>
			</Motion.div>
			<Motion.div
				className={`absolute inset-0 flex items-center justify-center font-bold text-xl sm:text-2xl [backface-visibility:hidden] ${typeStyles[type]}`}
				variants={faceVariants}
				initial='hidden'
				animate={opened ? 'visible' : 'hidden'}
				transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
			>
				{type === 'cash' && (
					<span className='flex items-center'>
						<img
							src={typeIcons.cash}
							alt='cash'
							className='w-4 h-4 sm:w-5 sm:h-5 mr-1 select-none'
						/>
						<span className='text-xs sm:text-base font-semibold'>
							{opened && displayValue !== undefined ? (
								<AnimatedNumber value={displayValue} duration={1.8} />
							) : (
								data.amount
							)}
						</span>
					</span>
				)}
				{type === 'mult' && (
					<span className='flex flex-col items-center gap-1'>
						<img
							src={typeIcons.mult}
							alt='x2'
							className='w-5 h-5 sm:w-7 sm:h-7 select-none'
						/>
						<span className='text-[9px] sm:text-[10px] tracking-wide uppercase'>
							Boost
						</span>
					</span>
				)}
				{type === 'bomb' && (
					<span className='flex flex-col items-center gap-1'>
						<img
							src={typeIcons.bomb}
							alt='bomb'
							className='w-5 h-5 sm:w-7 sm:h-7 select-none'
						/>
						<span className='text-[9px] sm:text-[10px] tracking-wide uppercase'>
							Bomb
						</span>
					</span>
				)}
				{type === 'zero' && (
					<span className='flex flex-col items-center gap-1'>
						<img
							src={typeIcons.zero}
							alt='empty'
							className='w-5 h-5 sm:w-6 sm:h-6 select-none'
						/>
						<span className='text-[9px] sm:text-[10px] tracking-wide uppercase'>
							Empty
						</span>
					</span>
				)}
			</Motion.div>
			<div className='absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent)] transition-opacity' />
		</button>
	)
}

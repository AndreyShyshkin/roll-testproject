import { motion as Motion } from 'framer-motion'

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
	cash: '💰',
	mult: '✖️2',
	bomb: '💣',
	zero: '0',
}

export default function GameCell({ data, opened, onOpen, triggerBomb, index }) {
	const { type } = data
	return (
		<button
			data-cell-index={index}
			className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-700/60 border border-slate-600/60 backdrop-blur-lg perspective [transform-style:preserve-3d] overflow-hidden group shadow-inner transition-transform active:scale-95 ${
				opened ? 'opened' : 'hover:border-slate-500/80'
			} ${triggerBomb ? 'animate-pulse ring-2 ring-rose-500/60' : ''}`}
			onClick={onOpen}
			disabled={opened}
		>
			<Motion.div
				className='absolute inset-0 flex items-center justify-center font-bold text-lg sm:text-xl [backface-visibility:hidden]'
				variants={backVariants}
				initial={false}
				animate={opened ? 'visible' : 'hidden'}
				transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
			>
				<div className='w-full h-full flex items-center justify-center text-slate-300/80 text-sm tracking-wide font-semibold uppercase'>
					Open
				</div>
			</Motion.div>
			<Motion.div
				className={`absolute inset-0 flex items-center justify-center font-bold text-2xl [backface-visibility:hidden] ${typeStyles[type]}`}
				variants={faceVariants}
				initial={false}
				animate={opened ? 'visible' : 'hidden'}
				transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
			>
				{type === 'cash' && (
					<span>
						{typeIcons.cash}
						<span className='ml-1 text-base font-semibold'>{data.amount}</span>
					</span>
				)}
				{type === 'mult' && (
					<span className='flex flex-col items-center gap-1'>
						<span className='text-2xl'>×2</span>
						<span className='text-[10px] tracking-wide uppercase'>Boost</span>
					</span>
				)}
				{type === 'bomb' && (
					<span className='flex flex-col items-center gap-1'>
						<span className='text-2xl'>💣</span>
						<span className='text-[10px] tracking-wide uppercase'>Bomb</span>
					</span>
				)}
				{type === 'zero' && (
					<span className='flex flex-col items-center gap-1'>
						<span className='text-xl'>0</span>
						<span className='text-[10px] tracking-wide uppercase'>Empty</span>
					</span>
				)}
			</Motion.div>
			<div className='absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent)] transition-opacity' />
		</button>
	)
}

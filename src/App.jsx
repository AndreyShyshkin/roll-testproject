import { useState } from 'react'
import diamond from './assets/diamond.png'
import money from './assets/money.png'
import AnimatedNumber from './components/AnimatedNumber.jsx'
import GameBoard from './components/GameBoard.jsx'
import ResultModal from './components/ResultModal.jsx'

export default function App() {
	const [modalProps, setModalProps] = useState(null)
	const [currency, setCurrency] = useState({ money: 0, crystals: 0 })
	const handleShowModal = props => setModalProps(props)
	const handleCloseModal = () => setModalProps(null)

	return (
		<div className='min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100 flex flex-col items-center px-4 py-6 select-none'>
			<header className='w-full max-w-xl flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-400 drop-shadow'>
					Roll Craft
				</h1>
				<div className='flex gap-2'>
					<div className='bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2 shadow border border-slate-600/50'>
						<img
							src={money}
							alt='money'
							className='w-4 h-4 sm:w-5 sm:h-5 select-none'
						/>
						<span className='text-yellow-400 font-semibold text-sm'>
							<AnimatedNumber value={currency.money} />
						</span>
					</div>
					<div className='bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2 shadow border border-slate-600/50'>
						<img
							src={diamond}
							alt='crystals'
							className='w-4 h-4 sm:w-5 sm:h-5 select-none'
						/>
						<span className='text-cyan-400 font-semibold text-sm'>
							<AnimatedNumber value={currency.crystals} />
						</span>
					</div>
				</div>
			</header>
			<GameBoard onShowModal={handleShowModal} onCurrency={setCurrency} />
			{modalProps && (
				<ResultModal
					{...modalProps}
					isOpen={true}
					onClose={handleCloseModal}
					onRestart={() => {
						handleCloseModal()
						modalProps.onRestart?.()
					}}
				/>
			)}
		</div>
	)
}

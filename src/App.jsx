import { useState } from 'react'
import GameBoard from './components/GameBoard.jsx'
import ResultModal from './components/ResultModal.jsx'

export default function App() {
	const [modalProps, setModalProps] = useState(null)
	const handleShowModal = props => setModalProps(props)
	const handleCloseModal = () => setModalProps(null)

	return (
		<div className='min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100 flex flex-col items-center px-4 py-6 select-none'>
			<header className='w-full max-w-xl flex items-center justify-between mb-6'>
				<h1 className='text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-400 drop-shadow'>
					Roll Craft
				</h1>
				<div className='text-xs opacity-60'>Prototype</div>
			</header>
			<GameBoard onShowModal={handleShowModal} />
			<footer className='mt-10 text-xs text-slate-400/70'>
				Demo build – animations & logic prototype
			</footer>
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

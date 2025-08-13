import { AnimatePresence, motion as Motion } from 'framer-motion'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import AnimatedNumber from './AnimatedNumber.jsx'
import GameCell from './GameCell.jsx'
const generateLayout = () => {
	const cells = []
	cells.push({ type: 'bomb' })
	cells.push({ type: 'mult', mult: 2 })
	for (let i = 0; i < 5; i++)
		cells.push({
			type: 'cash',
			amount: (Math.floor(Math.random() * 5) + 1) * 10,
		})
	for (let i = 0; i < 2; i++) cells.push({ type: 'zero' })
	for (let i = cells.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[cells[i], cells[j]] = [cells[j], cells[i]]
	}
	return cells
}

export default function GameBoard({ onShowModal }) {
	const [cells, setCells] = useState(() => generateLayout())
	const [opened, setOpened] = useState([])
	const [balance, setBalance] = useState(0)
	const [baseReveals, setBaseReveals] = useState([])
	const [multiplier, setMultiplier] = useState(1)
	const [gameOver, setGameOver] = useState(false)
	const [claiming, setClaiming] = useState(false)
	const [triggerBombFlash, setTriggerBombFlash] = useState(false)
	const [showMultPulse, setShowMultPulse] = useState(false)
	const [explosionWave, setExplosionWave] = useState(false)
	const [cellDisplayValues, setCellDisplayValues] = useState({})

	// Валютна система
	const [money, setMoney] = useState(100)
	const [crystals, setCrystals] = useState(100)
	const [gameStarted, setGameStarted] = useState(false)

	const boardRef = useRef(null)
	const boardRootRef = useRef(null)
	const glowTlRef = useRef(null)

	const startGame = () => {
		if (money < 10) return
		setMoney(prev => prev - 10)
		setGameStarted(true)
	}

	const saveGame = closeModal => {
		if (crystals < 20) return
		setMoney(prev => prev + balance)
		if (closeModal) closeModal()
		setTimeout(() => {
			reset()
		}, 300)
	}

	const reset = () => {
		setOpened([])
		setBalance(0)
		setBaseReveals([])
		setMultiplier(1)
		setGameOver(false)
		setClaiming(false)
		setTriggerBombFlash(false)
		setExplosionWave(false)
		setShowMultPulse(false)
		setCellDisplayValues({})
		setGameStarted(false)
		if (boardRef.current) {
			gsap.killTweensOf(boardRef.current)
			boardRef.current.style.transform = ''
		}
		setTimeout(() => {
			setCells(generateLayout())
		}, 100)
	}

	const handleOpen = idx => {
		if (!gameStarted || gameOver || opened.includes(idx)) return
		const cell = cells[idx]
		setOpened(o => [...o, idx])
		if (cell.type === 'cash') {
			const value = cell.amount * multiplier
			const el = document.querySelector(`[data-cell-index="${idx}"]`)
			animateAddToBalance(cell.amount, el)
			spawnParticles(el, '#34d399')
			setBaseReveals(r => [...r, cell.amount])
			setCellDisplayValues(prev => ({
				...prev,
				[idx]: cell.amount * multiplier,
			}))
			setTimeout(() => {
				setBalance(b => b + value)
			}, 450)
		} else if (cell.type === 'mult') {
			const newMultiplier = multiplier * cell.mult
			setMultiplier(newMultiplier)
			setShowMultPulse(true)
			setTimeout(() => setShowMultPulse(false), 1200)

			const currentBalance = balance
			const newBalance = currentBalance * cell.mult

			setTimeout(() => {
				setCellDisplayValues(prev => {
					const updated = {}
					Object.keys(prev).forEach(cellIdx => {
						updated[cellIdx] = prev[cellIdx] * cell.mult
					})
					return { ...prev, ...updated }
				})
			}, 200)

			setTimeout(() => {
				setBalance(newBalance)
			}, 800)
		} else if (cell.type === 'bomb') {
			setGameOver(true)
			setTriggerBombFlash(true)
			setExplosionWave(true)
			shakeBoard()

			setTimeout(() => {
				cells.forEach((_, i) => {
					if (i !== idx) {
						setTimeout(() => {
							setOpened(prev => [...prev, i])
						}, i * 150)
					}
				})
			}, 500)

			setTimeout(() => {
				if (onShowModal) {
					onShowModal({
						isOpen: true,
						type: 'bomb',
						baseValues: baseReveals,
						multiplier,
						onRestart: reset,
						onSave: closeModal => saveGame(closeModal),
						crystalCost: 20,
						canSave: crystals >= 20 && balance > 0,
					})
				}
			}, 3000)
		}
	}

	const animateAddToBalance = (baseValue, sourceEl) => {
		if (!sourceEl) return
		const target = document.querySelector('[data-balance-target]')
		if (!target) return
		const startRect = sourceEl.getBoundingClientRect()
		const targetRect = target.getBoundingClientRect()
		const startX = startRect.left + startRect.width / 2
		const startY = startRect.top + startRect.height / 2
		const endX = targetRect.left + targetRect.width / 2
		const endY = targetRect.top + targetRect.height / 2
		const bills = Math.min(
			6,
			Math.max(4, Math.round(Math.log10(baseValue + 10)))
		)
		for (let i = 0; i < bills; i++) {
			const bill = document.createElement('div')
			bill.className = 'flying-bill'
			bill.style.position = 'fixed'
			bill.style.left = startX + 'px'
			bill.style.top = startY + 'px'
			bill.style.zIndex = '1000'
			bill.innerHTML = '<div class="bill-inner" />'
			document.body.appendChild(bill)
			const midX = (endX - startX) * 0.45 + (Math.random() * 80 - 40)
			const midY = (endY - startY) * 0.45 - 60 - Math.random() * 40
			const dx = endX - startX
			const dy = endY - startY
			const flutterRot = gsap.utils.random(-25, 25)
			const tl = gsap.timeline({
				delay: i * 0.08,
				onComplete: () => bill.remove(),
			})
			tl.fromTo(
				bill,
				{ scale: 0.4, opacity: 0, rotate: flutterRot },
				{ scale: 1, opacity: 1, rotate: 0, duration: 0.25, ease: 'back.out(2)' }
			)
			tl.to(bill, {
				x: midX,
				y: midY,
				rotate: gsap.utils.random(-10, 10),
				duration: 0.32,
				ease: 'power2.out',
			})
			tl.to(bill, {
				x: dx,
				y: dy,
				rotate: gsap.utils.random(-5, 5),
				duration: 0.3,
				ease: 'power1.in',
			})
			tl.to(
				bill,
				{ scale: 0.45, opacity: 0, duration: 0.22, ease: 'power1.in' },
				'-=0.18'
			)
		}
		gsap.to(target, {
			scale: 1.15,
			duration: 0.25,
			ease: 'back.out(3)',
			yoyo: true,
			repeat: 1,
		})
		const ring = document.createElement('span')
		ring.className = 'balance-flash'
		ring.style.position = 'fixed'
		ring.style.left = endX + 'px'
		ring.style.top = endY + 'px'
		ring.style.zIndex = '999'
		document.body.appendChild(ring)
		gsap.fromTo(
			ring,
			{ scale: 0.2, opacity: 0.6 },
			{
				scale: 2,
				opacity: 0,
				duration: 0.6,
				ease: 'power2.out',
				onComplete: () => ring.remove(),
			}
		)
	}

	const spawnParticles = (sourceEl, color = '#34d399') => {
		if (!sourceEl) return
		const layer = document.getElementById('flying-layer')
		if (!layer) return
		const rect = sourceEl.getBoundingClientRect()
		for (let i = 0; i < 10; i++) {
			const p = document.createElement('div')
			p.className = 'absolute w-1.5 h-1.5 rounded-full'
			p.style.background = color
			p.style.left = rect.left + rect.width / 2 + 'px'
			p.style.top = rect.top + rect.height / 2 + 'px'
			layer.appendChild(p)
			const angle = Math.random() * Math.PI * 2
			const dist = 40 + Math.random() * 50
			gsap.to(p, {
				x: Math.cos(angle) * dist,
				y: Math.sin(angle) * dist,
				scale: 0,
				opacity: 0,
				duration: 0.8 + Math.random() * 0.4,
				ease: 'power2.out',
				onComplete: () => p.remove(),
			})
		}
	}

	const shakeBoard = () => {
		if (!boardRef.current) return
		gsap.fromTo(
			boardRef.current,
			{ rotateZ: 0 },
			{
				rotateZ: 2,
				duration: 0.07,
				yoyo: true,
				repeat: 6,
				ease: 'power1.inOut',
			}
		)
		gsap.fromTo(
			boardRef.current,
			{ x: 0 },
			{ x: 6, duration: 0.05, yoyo: true, repeat: 10, ease: 'power1.inOut' }
		)
	}

	const handleClaim = () => {
		if (gameOver) return
		setClaiming(true)
		setMoney(prev => prev + balance)
		setTimeout(() => {
			if (onShowModal) {
				onShowModal({
					isOpen: true,
					type: 'claim',
					baseValues: baseReveals,
					multiplier,
					onRestart: reset,
				})
			}
		}, 400)
	}

	const cellsData = useMemo(() => cells, [cells])

	useEffect(() => {
		if (gameOver) return
	}, [gameOver])

	useEffect(() => {
		const el = boardRootRef.current
		if (!el) return
		if (glowTlRef.current) {
			glowTlRef.current.kill()
			glowTlRef.current = null
		}
		if (triggerBombFlash) {
			gsap.set(el, {
				boxShadow: '0 0 20px 5px rgba(255,0,0,0.8)',
				filter: 'brightness(1.1) saturate(1.2)',
			})
			glowTlRef.current = gsap.to(el, {
				boxShadow: '0 0 35px 12px rgba(255,0,0,0.9)',
				filter: 'brightness(1.3) saturate(1.5)',
				duration: 1.2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
			})
		} else {
			gsap.to(el, {
				boxShadow: '0 0 0px 0 rgba(255,0,0,0)',
				filter: 'none',
				duration: 0.3,
				clearProps: 'boxShadow,filter',
			})
		}
		return () => {
			if (glowTlRef.current) {
				glowTlRef.current.kill()
				glowTlRef.current = null
			}
		}
	}, [triggerBombFlash])

	return (
		<div className='w-full max-w-xl flex flex-col items-center relative'>
			<div className='absolute top-0 right-0 flex flex-col gap-2'>
				<div className='bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2 shadow border border-slate-600/50'>
					<span className='text-yellow-400 text-sm'>💰</span>
					<span className='text-yellow-400 font-semibold text-sm'>
						<AnimatedNumber value={money} />
					</span>
				</div>
				<div className='bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2 shadow border border-slate-600/50'>
					<span className='text-cyan-400 text-sm'>💎</span>
					<span className='text-cyan-400 font-semibold text-sm'>
						<AnimatedNumber value={crystals} />
					</span>
				</div>
			</div>

			<div ref={boardRef} className='w-full flex flex-col items-center'>
				<div className='flex items-center gap-4 mb-4'>
					<div className='bg-slate-800/70 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner border border-slate-600/50 relative overflow-hidden'>
						{showMultPulse && (
							<Motion.span
								className='absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-400/20'
								initial={{ opacity: 0, scale: 0.6 }}
								animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 1.8] }}
								transition={{ duration: 0.9, ease: 'easeOut' }}
							/>
						)}
						<div className='text-xs uppercase tracking-wide text-slate-400'>
							Balance
						</div>
						<div
							className='text-2xl font-bold text-emerald-400 drop-shadow-sm'
							data-balance-target
						>
							<Motion.span
								key={showMultPulse ? 'pulse' : 'idle'}
								initial={
									showMultPulse
										? { scale: 1, textShadow: '0px 0px 0px rgba(52,211,153,0)' }
										: false
								}
								animate={
									showMultPulse
										? {
												scale: [1, 1.05, 1],
												textShadow: [
													'0px 0px 0px rgba(52,211,153,0)',
													'0px 0px 20px rgba(52,211,153,0.8)',
													'0px 0px 0px rgba(52,211,153,0)',
												],
										  }
										: {}
								}
								transition={{ duration: 0.9, ease: 'easeOut' }}
							>
								<AnimatedNumber value={balance} />
							</Motion.span>
						</div>
						{multiplier !== 1 && (
							<div
								className={`text-sm font-bold text-indigo-300 px-2 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 shadow-sm ${
									showMultPulse ? 'animate-bounce' : ''
								}`}
							>
								x{multiplier}
							</div>
						)}
					</div>
					<button
						onClick={reset}
						className='px-3 py-2 text-xs font-semibold rounded-md bg-slate-700/70 hover:bg-slate-600 transition-colors border border-slate-600/60 shadow active:scale-95'
					>
						Reset
					</button>
				</div>

				<div
					id='board-root'
					ref={boardRootRef}
					className={`relative grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/60 shadow-2xl overflow-hidden ${
						!gameStarted ? 'opacity-50 pointer-events-none' : ''
					}`}
				>
					{cellsData.map((c, i) => (
						<GameCell
							key={`${i}-${c.type}-${c.amount || c.mult || 'empty'}`}
							data={c}
							opened={opened.includes(i)}
							onOpen={() => handleOpen(i)}
							triggerBomb={c.type === 'bomb' && gameOver}
							index={i}
							displayValue={cellDisplayValues[i]}
						/>
					))}
					<div
						id='flying-layer'
						className='pointer-events-none absolute inset-0 overflow-visible'
					/>
					{explosionWave && (
						<Motion.span
							className='pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(255,80,80,0.45),transparent_70%)]'
							initial={{ scale: 0.2, opacity: 0.9 }}
							animate={{ scale: 2.4, opacity: 0 }}
							transition={{ duration: 1, ease: 'easeOut' }}
						/>
					)}
					<div className='pointer-events-none absolute -inset-1 rounded-[26px] bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-xl' />
				</div>

				<div className='mt-6 w-full flex justify-center'>
					<AnimatePresence mode='wait' initial={false}>
						{!gameStarted ? (
							<Motion.button
								key='start'
								onClick={startGame}
								disabled={money < 10}
								initial={{ opacity: 0, scale: 0.98, y: 5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98, y: -5 }}
								transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
								className='px-8 py-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-colors'
							>
								Start Game (10 💰)
							</Motion.button>
						) : (
							<Motion.button
								key='claim'
								onClick={handleClaim}
								disabled={gameOver || claiming}
								initial={{ opacity: 0, scale: 0.98, y: 5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98, y: -5 }}
								transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
								className='relative overflow-hidden group px-8 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-950/30 border border-white/10 disabled:opacity-40'
							>
								<span className='relative z-10'>Claim</span>
								<span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent)]' />
								<span className='absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-40 rotate-12 transition-opacity' />
							</Motion.button>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}

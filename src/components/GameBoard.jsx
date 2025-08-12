import { motion as Motion } from 'framer-motion'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSound from '../hooks/useSound.js'
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
	const boardRef = useRef(null)
	const playOpen = useSound()
	const playBomb = useSound()
	const playCash = useSound()
	const playMult = useSound()

	const reset = () => {
		setCells(generateLayout())
		setOpened([])
		setBalance(0)
		setBaseReveals([])
		setMultiplier(1)
		setGameOver(false)
		setClaiming(false)
		setTriggerBombFlash(false)
		setExplosionWave(false)
		setShowMultPulse(false)
		if (boardRef.current) {
			gsap.killTweensOf(boardRef.current)
			boardRef.current.style.transform = ''
		}
	}

	const handleOpen = idx => {
		if (gameOver || opened.includes(idx)) return
		const cell = cells[idx]
		setOpened(o => [...o, idx])
		playOpen()
		if (cell.type === 'cash') {
			const value = cell.amount * multiplier
			playCash()
			const el = document.querySelector(`[data-cell-index="${idx}"]`)
			animateAddToBalance(cell.amount, el)
			spawnParticles(el, '#34d399')
			setBaseReveals(r => [...r, cell.amount])
			setTimeout(() => {
				setBalance(b => b + value)
			}, 450)
		} else if (cell.type === 'mult') {
			playMult()
			setMultiplier(m => m * cell.mult)
			setShowMultPulse(true)
			setTimeout(() => setShowMultPulse(false), 900)
			setTimeout(() => {
				setBalance(b => b * cell.mult)
			}, 400)
		} else if (cell.type === 'bomb') {
			playBomb()
			setGameOver(true)
			setTriggerBombFlash(true)
			setExplosionWave(true)
			shakeBoard()
			setTimeout(() => setTriggerBombFlash(false), 900)
			setOpened(cells.map((_, i) => i))
			setTimeout(() => {
				if (onShowModal) {
					onShowModal({
						type: 'bomb',
						balance,
						multiplier,
						baseValues: baseReveals,
						onRestart: reset,
					})
				}
			}, 900)
			setTimeout(() => setExplosionWave(false), 1200)
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
		setTimeout(() => {
			if (onShowModal) {
				onShowModal({
					type: 'claim',
					balance,
					multiplier,
					baseValues: baseReveals,
					onRestart: reset,
				})
			}
		}, 400)
	}

	const cellsData = useMemo(() => cells, [cells])

	useEffect(() => {
		if (gameOver) return
	}, [gameOver])

	return (
		<div ref={boardRef} className='w-full max-w-xl flex flex-col items-center'>
			<div className='flex items-center gap-4 mb-4'>
				<div className='bg-slate-800/70 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner border border-slate-600/50 relative overflow-hidden'>
					{showMultPulse && (
						<span className='absolute inset-0 animate-[pulseRing_0.9s_ease-out] rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-400/20' />
					)}
					<div className='text-xs uppercase tracking-wide text-slate-400'>
						Balance
					</div>
					<Motion.div
						key={balance}
						initial={{ scale: 0.7, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className='text-2xl font-bold text-emerald-400 drop-shadow-sm'
						data-balance-target
					>
						<AnimatedNumber value={balance} />
					</Motion.div>
					{multiplier !== 1 && (
						<Motion.div
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className='text-sm font-semibold text-indigo-300'
						>
							x{multiplier}
						</Motion.div>
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
				className={`relative grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/60 shadow-2xl overflow-hidden ${
					triggerBombFlash ? 'animate-[flash_0.9s_ease]' : ''
				}`}
			>
				{cellsData.map((c, i) => (
					<GameCell
						key={i}
						data={c}
						opened={opened.includes(i)}
						onOpen={() => handleOpen(i)}
						triggerBomb={c.type === 'bomb' && gameOver}
						index={i}
					/>
				))}
				<div
					id='flying-layer'
					className='pointer-events-none absolute inset-0 overflow-visible'
				/>
				{explosionWave && (
					<span className='pointer-events-none absolute inset-0 animate-[explosion_1s_ease-out] rounded-2xl bg-[radial-gradient(circle_at_center,rgba(255,80,80,0.45),transparent_70%)]' />
				)}
				<div className='pointer-events-none absolute -inset-1 rounded-[26px] bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-xl' />
			</div>
			<div className='mt-6 flex gap-4'>
				<button
					disabled={gameOver || claiming}
					onClick={handleClaim}
					className='relative overflow-hidden group px-8 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-950/30 border border-white/10 disabled:opacity-40'
				>
					<span className='relative z-10'>Claim</span>
					<span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent)]' />
					<span className='absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-40 rotate-12 transition-opacity' />
				</button>
			</div>
			<style>{`
		@keyframes flash { 0% { box-shadow: 0 0 0px 0 rgba(255,0,0,.9); filter: none; } 40% { box-shadow: 0 0 40px 10px rgba(255,0,0,.6); filter: brightness(1.3) saturate(1.6); } 100% { box-shadow: 0 0 0 0 rgba(255,0,0,0); filter: none; } }
		@keyframes pulseRing { 0% { opacity:0; transform:scale(.6); } 40% { opacity:1; } 100% { opacity:0; transform:scale(1.8);} }
		@keyframes explosion { 0% { transform:scale(0.2); opacity:.9; } 60% { opacity:.4; } 100% { transform:scale(2.4); opacity:0; } }
		.flying-bill { width:38px; height:24px; pointer-events:none; transform-origin:center; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4)); }
		.flying-bill .bill-inner { width:100%; height:100%; background:linear-gradient(135deg,#1d3f2f,#2e7d4b); border:2px solid rgba(255,255,255,0.15); border-radius:4px; position:relative; }
		.flying-bill .bill-inner:before, .flying-bill .bill-inner:after { content:''; position:absolute; inset:4px; border:1px solid rgba(255,255,255,0.18); border-radius:2px; }
		.flying-bill .bill-inner:after { inset:10px; border-color:rgba(255,255,255,0.12); }
		.balance-flash { width:12px; height:12px; border:2px solid rgba(52,211,153,0.8); border-radius:50%; pointer-events:none; }
		`}</style>
		</div>
	)
}

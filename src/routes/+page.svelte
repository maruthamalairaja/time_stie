<script>
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import CopyButton from '$lib/components/CopyButton.svelte';

	let nowNano = BigInt(Date.now()) * 1000000n;
	let frame;

	function tick() {
		nowNano = BigInt(Date.now()) * 1000000n;
		frame = requestAnimationFrame(tick);
	}

	onMount(() => {
		frame = requestAnimationFrame(tick);
	});
	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
	});

	$: nanoDigits = nowNano.toString();
	$: isoNow = new Date(Number(nowNano / 1000000n)).toISOString();

	const groups = [
		{
			href: `${base}/nano-utc`,
			title: 'Nano UTC Conversion',
			desc: 'Move seamlessly between nanosecond epoch timestamps, calendar dates, clock time, and readable ISO datetimes.',
			items: ['Nano UTC ⇄ Datetime', 'Nano UTC ⇄ Date', 'Time ⇄ Seconds']
		},
		{
			href: `${base}/fundamentals`,
			title: 'Fundamentals',
			desc: 'Everyday date calculations: add or subtract precise durations, measure gaps between moments, shift calendar dates.',
			items: ['Add duration', 'Subtract duration', 'Get difference', 'Add days']
		},
		{
			href: `${base}/timezones`,
			title: 'Timezone Operations',
			desc: 'Convert datetimes across global timezones, coordinate multi-city meetings, and calculate time differences & DST shifts.',
			items: ['Timezone Converter', 'Multi-Zone Planner', 'Timezone Difference']
		}
	];
</script>

<svelte:head>
	<title>SAM Time Formatter — Nanosecond Time Conversion &amp; Date Math</title>
</svelte:head>

<div class="home-container">
	<section class="hero">
		<div class="hero-top-row">
			<div class="pill-badge">
				<span class="pulse-dot"></span>
				<span>High-Precision Realtime Clock</span>
			</div>
			<h1 class="hero-title">SAM Time Formatter</h1>
			<p class="hero-copy">
				Fast, precise nanosecond epoch conversion and duration arithmetic — right inside your browser.
			</p>
		</div>

		<!-- Compact LIVE UTC Widget (Reduced Height & No Scroll) -->
		<div class="clock-card" aria-live="off">
			<div class="clock-top">
				<div class="clock-title">
					<span class="live-indicator"></span>
					<span>LIVE NANOSECOND UTC</span>
				</div>
				<div class="clock-iso-row">
					<span class="clock-iso">{isoNow}</span>
					<CopyButton text={isoNow} title="Copy ISO UTC string" />
				</div>
			</div>
			
			<div class="clock-main">
				<span class="clock-value">{nanoDigits}</span>
				<CopyButton text={nanoDigits} title="Copy Nanosecond timestamp" />
			</div>
		</div>
	</section>

	<section class="groups">
		{#each groups as g}
			<a class="group-card" href={g.href}>
				<div class="group-top">
					<h2>{g.title}</h2>
					<span class="group-go" aria-hidden="true">→</span>
				</div>
				<p class="group-desc">{g.desc}</p>
				<ul class="group-items">
					{#each g.items as item}
						<li>{item}</li>
					{/each}
				</ul>
			</a>
		{/each}
	</section>
</div>

<style>
	.home-container {
		max-width: 1360px;
		width: 100%;
		margin: 0 auto;
		padding: 24px 32px 32px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
		justify-content: center;
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.hero-top-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.pill-badge {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 5px 14px;
		background: #fff7ed;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 11.5px;
		color: var(--accent-strong);
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.08);
	}

	.pulse-dot {
		width: 7px;
		height: 7px;
		background-color: var(--accent);
		border-radius: 50%;
		box-shadow: 0 0 8px var(--accent);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
		}
		70% {
			transform: scale(1);
			box-shadow: 0 0 0 6px rgba(249, 115, 22, 0);
		}
		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
		}
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(26px, 3.2vw, 36px);
		line-height: 1.15;
		letter-spacing: -0.025em;
		margin: 0;
		color: var(--text);
		font-weight: 800;
	}

	.hero-copy {
		font: 400 14px/1.5 var(--font-body);
		color: var(--text-muted);
		max-width: 68ch;
		margin: 0;
	}

	/* Compact LIVE UTC Widget */
	.clock-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 14px 22px;
		box-shadow: 0 10px 25px -8px rgba(234, 88, 12, 0.12), 0 3px 10px rgba(0, 0, 0, 0.03);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.clock-card:hover {
		border-color: var(--border-strong);
		box-shadow: 0 12px 30px -8px rgba(234, 88, 12, 0.18);
	}

	.clock-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.clock-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 700 11px/1 var(--font-display);
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.live-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--success);
		box-shadow: 0 0 8px var(--success);
	}

	.clock-iso-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.clock-iso {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		background: #faf7f5;
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--border-subtle);
	}

	.clock-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.clock-value {
		font-family: var(--font-mono);
		font-size: clamp(20px, 3.2vw, 32px);
		font-weight: 700;
		color: var(--accent-strong);
		letter-spacing: 0.02em;
		word-break: break-all;
	}

	/* Groups Grid */
	.groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 20px;
	}

	.group-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		text-decoration: none;
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 22px 26px;
		box-shadow: var(--shadow-card);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.group-card:hover {
		border-color: var(--accent);
		transform: translateY(-3px);
		box-shadow: 0 14px 32px -10px rgba(234, 88, 12, 0.2);
	}
	.group-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.group-top h2 {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		margin: 0;
		color: var(--text);
		letter-spacing: -0.01em;
	}
	.group-go {
		color: var(--text-faint);
		font-size: 18px;
		transition: transform 0.2s, color 0.2s;
	}
	.group-card:hover .group-go {
		color: var(--accent-strong);
		transform: translateX(4px);
	}
	.group-desc {
		font: 400 13px/1.5 var(--font-body);
		color: var(--text-muted);
		margin: 0;
	}
	.group-items {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.group-items li {
		font: 600 12px/1.3 var(--font-body);
		color: var(--accent-strong);
		background: #fff7ed;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		padding: 5px 12px;
	}

	@media (max-width: 768px) {
		.home-container {
			padding: 16px 16px 24px;
			box-sizing: border-box;
		}
		.groups {
			grid-template-columns: 1fr;
		}
		.clock-main {
			flex-direction: column;
			align-items: flex-start;
		}
		.clock-top {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.clock-iso {
			font-size: 11.5px;
			word-break: break-all;
		}
		.clock-value {
			font-size: clamp(16px, 5vw, 26px);
		}
		.group-card {
			padding: 18px 20px;
		}
	}
</style>
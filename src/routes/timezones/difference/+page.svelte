<script>
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import {
		getUserTimezone,
		formatInTimezone,
		calculateTimeDifference,
		getTimezoneOffsetMinutes,
		getWorkingStatus
	} from '$lib/tz.js';

	let zoneA = 'America/New_York';
	let zoneB = 'Europe/London';
	let selectedHourA = 9; // 9 AM default
	let confirmOpen = false;

	onMount(() => {
		const local = getUserTimezone();
		if (local) {
			zoneA = local;
			zoneB = local === 'Europe/London' ? 'America/New_York' : 'Europe/London';
		}
	});

	function swapZones() {
		const temp = zoneA;
		zoneA = zoneB;
		zoneB = temp;
	}

	const now = new Date();
	$: nowA = formatInTimezone(now, zoneA);
	$: nowB = formatInTimezone(now, zoneB);
	$: diff = calculateTimeDifference(now, zoneA, zoneB);

	// Generate 24 hours comparison array
	$: hoursGrid = Array.from({ length: 24 }, (_, h) => {
		// Base reference time in zone A today
		const dateA = new Date(now);
		// calculate difference in minutes between zone B and zone A
		const offsetA = getTimezoneOffsetMinutes(now, zoneA);
		const offsetB = getTimezoneOffsetMinutes(now, zoneB);
		const diffMin = offsetB - offsetA;

		const totalMinB = h * 60 + diffMin;
		let normHourB = Math.floor(totalMinB / 60) % 24;
		if (normHourB < 0) normHourB += 24;
		const normMinB = Math.abs(totalMinB % 60);

		const statusA = getWorkingStatus(h);
		const statusB = getWorkingStatus(normHourB);

		const isOverlap = statusA.status === 'work' && statusB.status === 'work';

		return {
			hourA: h,
			hourB: normHourB,
			minB: normMinB,
			labelA: formatHourLabel(h),
			labelB: formatHourLabel(normHourB, normMinB),
			statusA,
			statusB,
			isOverlap
		};
	});

	function formatHourLabel(h, m = 0) {
		const period = h >= 12 ? 'PM' : 'AM';
		const displayH = h % 12 === 0 ? 12 : h % 12;
		const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
		return `${displayH}${minStr} ${period}`;
	}

	$: overlappingHours = hoursGrid.filter((g) => g.isOverlap);

	function resetAll() {
		zoneA = getUserTimezone() || 'UTC';
		zoneB = 'America/New_York';
		selectedHourA = 9;
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Timezone Difference &amp; Overlap — SAM Time Formatter</title>
</svelte:head>

<div class="diff-layout">
	<!-- Top Selection Card -->
	<div class="card control-card">
		<div class="card-head">
			<h2>Timezone Difference &amp; Working Hours Overlap</h2>
			<button type="button" class="link-btn" on:click={swapZones}>⇄ Swap Zones</button>
		</div>

		<div class="tz-grid">
			<div class="tz-col">
				<TimezoneSelect label="Zone A (Reference)" bind:value={zoneA} />
			</div>
			<div class="tz-col">
				<TimezoneSelect label="Zone B (Comparison)" bind:value={zoneB} />
			</div>
		</div>

		{#if nowA && nowB}
			<!-- Summary Hero -->
			<div class="summary-hero">
				<div class="summary-text-row">
					<span class="diff-highlight">
						{zoneB.split('/').pop().replace(/_/g, ' ')} is {diff.diffText}
					</span>
					<span class="diff-hours-pill">
						{diff.diffHours >= 0 ? `+${diff.diffHours}` : diff.diffHours} Hours
					</span>
				</div>

				<div class="clocks-row">
					<div class="clock-box">
						<span class="clock-label">CURRENT IN {zoneA.split('/').pop().replace(/_/g, ' ')}</span>
						<span class="clock-time">{nowA.time12}</span>
						<span class="clock-date">{nowA.dateOnly} · {nowA.offsetStr} ({nowA.abbr})</span>
						<span class="dst-tag" class:active={nowA.isDST}>{nowA.dstLabel}</span>
					</div>

					<div class="clock-divider">⇄</div>

					<div class="clock-box">
						<span class="clock-label">CURRENT IN {zoneB.split('/').pop().replace(/_/g, ' ')}</span>
						<span class="clock-time">{nowB.time12}</span>
						<span class="clock-date">{nowB.dateOnly} · {nowB.offsetStr} ({nowB.abbr})</span>
						<span class="dst-tag" class:active={nowB.isDST}>{nowB.dstLabel}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- 24-Hour Overlap Timeline -->
	<div class="card overlap-card">
		<div class="overlap-head">
			<div class="overlap-title-wrap">
				<h3>24-Hour Overlap Timeline</h3>
				<p>Compare business hours side-by-side to find the optimal window for calls and handoffs.</p>
			</div>

			<div class="overlap-badge" class:has-overlap={overlappingHours.length > 0}>
				{#if overlappingHours.length > 0}
					🟢 {overlappingHours.length} Overlapping Work Hour{overlappingHours.length > 1 ? 's' : ''}
				{:else}
					⚠️ No direct 9am–5pm overlap
				{/if}
			</div>
		</div>

		<!-- Legend -->
		<div class="legend-bar">
			<span class="legend-item"><span class="dot green"></span> Work Hours (9am–5pm)</span>
			<span class="legend-item"><span class="dot amber"></span> Awake / Evening</span>
			<span class="legend-item"><span class="dot purple"></span> Sleeping / Night</span>
			<span class="legend-item"><span class="dot overlap-dot"></span> Simultaneous Work</span>
		</div>

		<!-- Timeline Scroll Grid -->
		<div class="timeline-container">
			<div class="timeline-table">
				<!-- Row Zone A -->
				<div class="timeline-row">
					<div class="row-header">
						<span class="header-city">{zoneA.split('/').pop().replace(/_/g, ' ')}</span>
						<span class="header-sub">Zone A</span>
					</div>
					<div class="row-cells">
						{#each hoursGrid as cell}
							<button
								type="button"
								class="time-cell status-{cell.statusA.color}"
								class:selected={selectedHourA === cell.hourA}
								class:is-overlap={cell.isOverlap}
								on:click={() => (selectedHourA = cell.hourA)}
							>
								<span class="cell-time">{cell.labelA}</span>
								<span class="cell-dot"></span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Row Zone B -->
				<div class="timeline-row">
					<div class="row-header">
						<span class="header-city">{zoneB.split('/').pop().replace(/_/g, ' ')}</span>
						<span class="header-sub">Zone B</span>
					</div>
					<div class="row-cells">
						{#each hoursGrid as cell}
							<button
								type="button"
								class="time-cell status-{cell.statusB.color}"
								class:selected={selectedHourA === cell.hourA}
								class:is-overlap={cell.isOverlap}
								on:click={() => (selectedHourA = cell.hourA)}
							>
								<span class="cell-time">{cell.labelB}</span>
								<span class="cell-dot"></span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Selected Hour Inspector -->
		{#if hoursGrid[selectedHourA]}
			{@const sel = hoursGrid[selectedHourA]}
			<div class="inspector-box">
				<span class="inspector-title">Inspecting Hour:</span>
				<div class="inspector-times">
					<div class="ins-item">
						<strong>{zoneA.split('/').pop().replace(/_/g, ' ')}:</strong>
						<span>{sel.labelA} ({sel.statusA.badge})</span>
					</div>
					<span class="ins-arrow">→</span>
					<div class="ins-item">
						<strong>{zoneB.split('/').pop().replace(/_/g, ' ')}:</strong>
						<span>{sel.labelB} ({sel.statusB.badge})</span>
					</div>
				</div>
				<div class="ins-badge" class:work-badge={sel.isOverlap}>
					{sel.isOverlap ? '🌟 Mutual Work Hours' : 'One or both parties are outside standard office hours'}
				</div>
			</div>
		{/if}
	</div>

	<button class="reset-btn" on:click={() => (confirmOpen = true)}>Clear this page</button>

	<ConfirmDialog
		open={confirmOpen}
		message="Reset timezone comparison settings?"
		onConfirm={resetAll}
		onCancel={() => (confirmOpen = false)}
	/>
</div>

<style>
	.diff-layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 960px;
		width: 100%;
	}

	.control-card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 26px 30px;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.14);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 12px;
	}

	.card-head h2 {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		margin: 0;
		color: var(--text);
	}

	.link-btn {
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		color: #ea580c;
		font: 700 12px/1 var(--font-display);
		padding: 8px 16px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.link-btn:hover {
		background: #f97316;
		border-color: #f97316;
		color: #ffffff;
		transform: translateY(-1px);
	}

	.tz-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	.tz-col {
		min-width: 0;
	}

	/* Summary Hero */
	.summary-hero {
		background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
		border: 1.5px solid #fed7aa;
		border-radius: 16px;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.summary-text-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.diff-highlight {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		color: #ea580c;
	}

	.diff-hours-pill {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
		color: #ffffff;
		background: #ea580c;
		padding: 4px 12px;
		border-radius: 9999px;
	}

	.clocks-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.clock-box {
		flex: 1;
		min-width: 200px;
		background: #ffffff;
		border: 1px solid #fed7aa;
		border-radius: 12px;
		padding: 14px 18px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.clock-label {
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.clock-time {
		font-family: var(--font-mono);
		font-size: 24px;
		font-weight: 800;
		color: var(--text);
	}

	.clock-date {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.clock-divider {
		font-size: 22px;
		color: #ea580c;
		font-weight: 800;
	}

	.dst-tag {
		align-self: flex-start;
		font-size: 10.5px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 6px;
		background: #f1f5f9;
		color: #64748b;
		margin-top: 4px;
	}

	.dst-tag.active {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	/* Overlap Timeline Card */
	.overlap-card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 24px 28px;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.12);
	}

	.overlap-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.overlap-title-wrap h3 {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 4px;
		color: var(--text);
	}

	.overlap-title-wrap p {
		font-size: 13px;
		color: var(--text-muted);
		margin: 0;
	}

	.overlap-badge {
		font-size: 12.5px;
		font-weight: 700;
		padding: 5px 14px;
		border-radius: 9999px;
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.overlap-badge.has-overlap {
		background: #ecfdf5;
		color: #065f46;
		border-color: #a7f3d0;
	}

	.legend-bar {
		display: flex;
		gap: 16px;
		font-size: 11.5px;
		color: var(--text-muted);
		font-weight: 600;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.dot.green { background: #16a34a; }
	.dot.amber { background: #d97706; }
	.dot.purple { background: #9333ea; }
	.dot.overlap-dot {
		background: #16a34a;
		box-shadow: 0 0 0 2px #f97316;
	}

	/* Timeline Table */
	.timeline-container {
		overflow-x: auto;
		border: 1px solid #fed7aa;
		border-radius: 14px;
		background: #faf7f5;
		scrollbar-width: thin;
	}

	.timeline-table {
		display: flex;
		flex-direction: column;
		min-width: 1100px;
	}

	.timeline-row {
		display: flex;
		align-items: stretch;
		border-bottom: 1px solid #ffedd5;
	}

	.timeline-row:last-child {
		border-bottom: none;
	}

	.row-header {
		width: 140px;
		padding: 12px 14px;
		background: #ffffff;
		border-right: 1.5px solid #fed7aa;
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex-shrink: 0;
	}

	.header-city {
		font-size: 13px;
		font-weight: 700;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-sub {
		font-size: 10.5px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.row-cells {
		display: flex;
		flex: 1;
	}

	.time-cell {
		flex: 1;
		min-width: 40px;
		padding: 10px 4px;
		border: none;
		border-right: 1px solid #ffedd5;
		background: transparent;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		transition: all 0.15s ease;
	}

	.time-cell:hover {
		filter: brightness(0.95);
	}

	.time-cell.selected {
		box-shadow: inset 0 0 0 2px #ea580c;
		font-weight: 800;
	}

	.cell-time {
		font-family: var(--font-mono);
		font-size: 9.5px;
		font-weight: 600;
		white-space: nowrap;
	}

	.cell-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	.status-green {
		background: #dcfce7;
		color: #15803d;
	}
	.status-green .cell-dot { background: #16a34a; }

	.status-amber {
		background: #fef3c7;
		color: #b45309;
	}
	.status-amber .cell-dot { background: #d97706; }

	.status-purple {
		background: #f3e8ff;
		color: #7e22ce;
	}
	.status-purple .cell-dot { background: #9333ea; }

	.time-cell.is-overlap {
		box-shadow: inset 0 0 0 2px #16a34a;
	}

	/* Inspector Box */
	.inspector-box {
		margin-top: 16px;
		padding: 14px 18px;
		background: #fff7ed;
		border: 1px solid #fed7aa;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.inspector-title {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #ea580c;
	}

	.inspector-times {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 13.5px;
		color: var(--text);
		flex-wrap: wrap;
	}

	.ins-arrow {
		color: #ea580c;
		font-weight: 800;
	}

	.ins-badge {
		font-size: 11.5px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.ins-badge.work-badge {
		color: #15803d;
		font-weight: 700;
	}

	.reset-btn {
		background: transparent;
		border: 1px dashed var(--border, #fed7aa);
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 600;
		padding: 8px 18px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
		align-self: flex-start;
	}

	.reset-btn:hover {
		color: #ea580c;
		border-color: #f97316;
		background: #fff7ed;
	}

	@media (max-width: 640px) {
		.tz-grid {
			grid-template-columns: 1fr;
		}
		.clocks-row {
			flex-direction: column;
		}
		.clock-divider {
			transform: rotate(90deg);
		}
	}
</style>


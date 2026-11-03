<script>
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import {
		getUserTimezone,
		parseInTimezone,
		formatInTimezone,
		calculateTimeDifference,
		getWorkingStatus,
		getAllTimezones
	} from '$lib/tz.js';

	let datetimeInput = '';
	let referenceTz = 'UTC';
	let confirmOpen = false;

	// Default planned timezones
	let plannedZones = [
		'America/New_York',
		'Europe/London',
		'Asia/Dubai',
		'Asia/Kolkata',
		'Asia/Singapore',
		'Asia/Tokyo',
		'Australia/Sydney'
	];

	let addZoneModalOpen = false;
	let zoneToAdd = 'Europe/Paris';
	let copyInviteSuccess = false;

	function pad(n) {
		return String(n).padStart(2, '0');
	}

	function toLocalInputValue(d) {
		return (
			`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
			`T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
		);
	}

	function useNow() {
		datetimeInput = toLocalInputValue(new Date());
	}

	onMount(() => {
		const local = getUserTimezone();
		if (local) {
			referenceTz = local;
			if (!plannedZones.includes(local)) {
				// Don't duplicate if already in
			}
		}
		useNow();
	});

	function adjustHours(hoursDelta) {
		const utcDate = parseInTimezone(datetimeInput, referenceTz);
		if (!utcDate) return;
		const next = new Date(utcDate.getTime() + hoursDelta * 3600000);
		// Format back to input in referenceTz
		const info = formatInTimezone(next, referenceTz);
		if (info) {
			datetimeInput = info.datetimeLocal;
		}
	}

	function addTimezone() {
		if (zoneToAdd && !plannedZones.includes(zoneToAdd)) {
			plannedZones = [...plannedZones, zoneToAdd];
		}
		addZoneModalOpen = false;
	}

	function removeTimezone(tz) {
		plannedZones = plannedZones.filter((z) => z !== tz);
	}

	function resetToDefaults() {
		plannedZones = [
			'America/New_York',
			'Europe/London',
			'Asia/Dubai',
			'Asia/Kolkata',
			'Asia/Singapore',
			'Asia/Tokyo',
			'Australia/Sydney'
		];
		useNow();
		confirmOpen = false;
	}

	$: utcDate = parseInTimezone(datetimeInput, referenceTz);
	$: refInfo = utcDate ? formatInTimezone(utcDate, referenceTz) : null;

	$: listResults = utcDate
		? plannedZones.map((tz) => {
				const info = formatInTimezone(utcDate, tz);
				const diff = calculateTimeDifference(utcDate, referenceTz, tz);
				const work = info ? getWorkingStatus(info.hours) : null;
				return {
					id: tz,
					info,
					diff,
					work
				};
		  })
		: [];

	function generateMeetingSummary() {
		if (!utcDate || !refInfo) return '';
		const lines = [
			`🗓️ Meeting Schedule (${refInfo.formattedLong}):`,
			`• Reference (${refInfo.abbr || referenceTz}): ${refInfo.time12} (${refInfo.dateOnly})`
		];
		listResults.forEach((r) => {
			if (r.info) {
				const dayNote = r.diff.dayShift !== 0 ? ` [${r.diff.dayShiftLabel}]` : '';
				lines.push(`• ${r.info.weekday}, ${r.id.split('/').pop().replace(/_/g, ' ')} (${r.info.abbr}): ${r.info.time12}${dayNote}`);
			}
		});
		return lines.join('\n');
	}

	$: meetingSummaryText = generateMeetingSummary();
</script>

<svelte:head>
	<title>Multi-Zone Meeting Planner — SAM Time Formatter</title>
</svelte:head>

<div class="planner-layout">
	<!-- Control Card -->
	<div class="card control-card">
		<div class="card-head">
			<h2>Multi-Zone Meeting &amp; Time Planner</h2>
			<button type="button" class="link-btn" on:click={useNow}>Use current time</button>
		</div>

		<div class="controls-grid">
			<label class="field">
				<span>Reference Date &amp; Time</span>
				<input type="datetime-local" step="60" bind:value={datetimeInput} />
			</label>

			<div class="ref-tz-box">
				<TimezoneSelect
					label="Reference Timezone"
					bind:value={referenceTz}
				/>
			</div>
		</div>

		<!-- Time Shifter Toolbar -->
		<div class="shifter-toolbar">
			<span class="shifter-label">Shift Meeting Time:</span>
			<div class="shifter-buttons">
				<button type="button" class="shift-btn" on:click={() => adjustHours(-3)}>−3h</button>
				<button type="button" class="shift-btn" on:click={() => adjustHours(-1)}>−1h</button>
				<button type="button" class="shift-btn" on:click={() => adjustHours(-0.5)}>−30m</button>
				<button type="button" class="shift-btn" on:click={() => adjustHours(0.5)}>+30m</button>
				<button type="button" class="shift-btn" on:click={() => adjustHours(1)}>+1h</button>
				<button type="button" class="shift-btn" on:click={() => adjustHours(3)}>+3h</button>
			</div>

			<div class="toolbar-actions">
				<button type="button" class="add-city-btn" on:click={() => (addZoneModalOpen = !addZoneModalOpen)}>
					+ Add Timezone
				</button>
				{#if meetingSummaryText}
					<CopyButton text={meetingSummaryText} title="Copy meeting schedule summary" />
				{/if}
			</div>
		</div>

		<!-- Add Timezone Drawer/Form -->
		{#if addZoneModalOpen}
			<div class="add-zone-box">
				<div class="add-zone-inner">
					<TimezoneSelect label="Choose timezone to add to list" bind:value={zoneToAdd} />
					<div class="add-zone-actions">
						<button type="button" class="btn-primary-sm" on:click={addTimezone}>Add to Planner</button>
						<button type="button" class="btn-subtle-sm" on:click={() => (addZoneModalOpen = false)}>Cancel</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Multi-Zone List / Cards -->
	{#if refInfo}
		<div class="zones-table-card">
			<div class="table-header">
				<div class="legend-row">
					<span class="legend-item"><span class="dot green"></span> Office Hours (9am–5pm)</span>
					<span class="legend-item"><span class="dot amber"></span> Evening / Awake</span>
					<span class="legend-item"><span class="dot purple"></span> Night / Sleeping</span>
				</div>
			</div>

			<div class="zones-list">
				<!-- Reference Zone Row -->
				<div class="zone-row reference-row">
					<div class="zone-main">
						<div class="zone-city-wrap">
							<span class="badge-ref">REFERENCE</span>
							<span class="zone-city">{referenceTz.split('/').pop().replace(/_/g, ' ')}</span>
							<span class="zone-id">{referenceTz}</span>
						</div>
						<div class="zone-datetime">
							<span class="zone-date">{refInfo.weekday}, {refInfo.dateOnly}</span>
							<span class="zone-time">{refInfo.time12}</span>
						</div>
					</div>

					<div class="zone-meta">
						<span class="offset-pill">{refInfo.offsetStr} ({refInfo.abbr})</span>
						{#if refInfo}
							{@const refWork = getWorkingStatus(refInfo.hours)}
							<span class="status-pill status-{refWork.color}">{refWork.badge}</span>
						{/if}
					</div>
				</div>

				<!-- Comparison Rows -->
				{#each listResults as item (item.id)}
					{#if item.info}
						<div class="zone-row">
							<div class="zone-main">
								<div class="zone-city-wrap">
									<span class="zone-city">{item.id.split('/').pop().replace(/_/g, ' ')}</span>
									<span class="zone-id">{item.id}</span>
									{#if item.diff.dayShift !== 0}
										<span class="day-badge" class:ahead={item.diff.dayShift > 0} class:behind={item.diff.dayShift < 0}>
											{item.diff.dayShiftLabel}
										</span>
									{/if}
								</div>
								<div class="zone-datetime">
									<span class="zone-date">{item.info.weekday}, {item.info.dateOnly}</span>
									<span class="zone-time">{item.info.time12}</span>
								</div>
							</div>

							<div class="zone-meta">
								<span class="diff-tag">{item.diff.diffText}</span>
								<span class="offset-pill">{item.info.offsetStr} ({item.info.abbr})</span>
								<span class="status-pill status-{item.work.color}">{item.work.badge}</span>
								
								<button
									type="button"
									class="remove-zone-btn"
									title="Remove timezone from planner"
									on:click={() => removeTimezone(item.id)}
								>
									×
								</button>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<button class="reset-btn" on:click={() => (confirmOpen = true)}>Reset planner to defaults</button>

	<ConfirmDialog
		open={confirmOpen}
		message="Reset all planned timezones to default cities?"
		onConfirm={resetToDefaults}
		onCancel={() => (confirmOpen = false)}
	/>
</div>

<style>
	.planner-layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		max-width: 920px;
	}

	.control-card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 26px 30px;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.14), 0 4px 16px rgba(0, 0, 0, 0.04);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.control-card:hover {
		border-color: #f97316;
		box-shadow: 0 14px 36px -10px rgba(249, 115, 22, 0.2);
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
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.08);
	}

	.link-btn:hover {
		background: #f97316;
		border-color: #f97316;
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
		transform: translateY(-1px);
	}

	.controls-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.field span {
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.field input {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		color: var(--text);
		padding: 10px 14px;
		border-radius: 12px;
		font: 14.5px/1.3 var(--font-mono);
		transition: border-color 0.2s, box-shadow 0.2s;
		width: 100%;
		box-sizing: border-box;
	}

	.field input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
	}

	.ref-tz-box {
		width: 100%;
	}

	/* Shifter Toolbar */
	.shifter-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding-top: 14px;
		border-top: 1px solid #ffedd5;
	}

	.shifter-label {
		font-size: 11.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-muted);
	}

	.shifter-buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.shift-btn {
		background: #fff7ed;
		border: 1px solid #fed7aa;
		color: #ea580c;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		padding: 5px 12px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.shift-btn:hover {
		background: #f97316;
		border-color: #f97316;
		color: #ffffff;
		transform: translateY(-1px);
	}

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.add-city-btn {
		background: #f8fafc;
		border: 1.5px solid #cbd5e1;
		color: #334155;
		font-size: 12.5px;
		font-weight: 700;
		padding: 6px 14px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-city-btn:hover {
		background: #fff7ed;
		border-color: #f97316;
		color: #ea580c;
	}

	/* Add Zone Box */
	.add-zone-box {
		margin-top: 16px;
		padding: 16px;
		background: #fffaf5;
		border: 1.5px dashed #fed7aa;
		border-radius: 14px;
	}

	.add-zone-inner {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.add-zone-actions {
		display: flex;
		gap: 8px;
	}

	.btn-primary-sm {
		background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
		border: none;
		color: #ffffff;
		font-size: 12.5px;
		font-weight: 700;
		padding: 6px 16px;
		border-radius: 9999px;
		cursor: pointer;
	}

	.btn-subtle-sm {
		background: #ffffff;
		border: 1px solid #cbd5e1;
		color: #64748b;
		font-size: 12px;
		padding: 6px 14px;
		border-radius: 9999px;
		cursor: pointer;
	}

	/* Zones Table / List */
	.zones-table-card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.12);
	}

	.table-header {
		padding: 12px 24px;
		background: #fffaf5;
		border-bottom: 1px solid #fed7aa;
		display: flex;
		justify-content: flex-end;
	}

	.legend-row {
		display: flex;
		gap: 16px;
		font-size: 11.5px;
		color: var(--text-muted);
		font-weight: 600;
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

	.zones-list {
		display: flex;
		flex-direction: column;
		divide-y: 1px solid #f1f5f9;
	}

	.zone-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		border-bottom: 1px solid #ffedd5;
		transition: background 0.15s ease;
		gap: 16px;
		flex-wrap: wrap;
	}

	.zone-row:last-child {
		border-bottom: none;
	}

	.zone-row:hover {
		background: #fffdfb;
	}

	.reference-row {
		background: #fff7ed;
		border-bottom: 2px solid #fed7aa;
	}

	.zone-main {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
		min-width: 0;
	}

	.zone-city-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 200px;
	}

	.badge-ref {
		font-size: 9.5px;
		font-weight: 800;
		letter-spacing: 0.05em;
		background: #ea580c;
		color: #ffffff;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.zone-city {
		font-size: 15px;
		font-weight: 700;
		color: var(--text);
	}

	.zone-id {
		font-size: 12px;
		color: var(--text-faint);
	}

	.zone-datetime {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.zone-date {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.zone-time {
		font-family: var(--font-mono);
		font-size: 18px;
		font-weight: 800;
		color: #ea580c;
	}

	.zone-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.diff-tag {
		font-size: 12px;
		color: var(--text-muted);
		font-weight: 600;
	}

	.offset-pill {
		font-family: var(--font-mono);
		font-size: 11.5px;
		font-weight: 600;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		color: #475569;
		padding: 3px 8px;
		border-radius: 6px;
	}

	.day-badge {
		font-size: 10.5px;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 6px;
		background: #f1f5f9;
		color: #475569;
	}

	.day-badge.ahead {
		background: #ecfdf5;
		color: #065f46;
	}

	.day-badge.behind {
		background: #fef2f2;
		color: #991b1b;
	}

	.status-pill {
		font-size: 11px;
		font-weight: 700;
		padding: 3px 10px;
		border-radius: 9999px;
		letter-spacing: 0.02em;
	}

	.status-green {
		background: #dcfce7;
		color: #15803d;
		border: 1px solid #bbf7d0;
	}

	.status-amber {
		background: #fef3c7;
		color: #b45309;
		border: 1px solid #fde68a;
	}

	.status-purple {
		background: #f3e8ff;
		color: #7e22ce;
		border: 1px solid #e9d5ff;
	}

	.remove-zone-btn {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 1px solid #fed7aa;
		background: #ffffff;
		color: #94a3b8;
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.remove-zone-btn:hover {
		background: #fee2e2;
		border-color: #fca5a5;
		color: #dc2626;
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
		.controls-grid {
			grid-template-columns: 1fr;
		}
		.zone-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}
		.zone-main {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>


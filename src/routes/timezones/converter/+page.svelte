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
		POPULAR_TIMEZONES
	} from '$lib/tz.js';

	let datetimeInput = '';
	let sourceTz = 'UTC';
	let targetTz = 'America/New_York';
	let result = null;
	let error = '';
	let confirmOpen = false;

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
			sourceTz = local;
			targetTz = local === 'America/New_York' ? 'UTC' : 'America/New_York';
		}
		useNow();
	});

	function swapTimezones() {
		const temp = sourceTz;
		sourceTz = targetTz;
		targetTz = temp;
	}

	function setTargetTz(tz) {
		targetTz = tz;
	}

	function convert() {
		error = '';
		result = null;

		if (!datetimeInput) {
			return;
		}

		const utcDate = parseInTimezone(datetimeInput, sourceTz);
		if (!utcDate || isNaN(utcDate.getTime())) {
			error = 'Please enter a valid date and time.';
			return;
		}

		const srcInfo = formatInTimezone(utcDate, sourceTz);
		const tgtInfo = formatInTimezone(utcDate, targetTz);
		const diff = calculateTimeDifference(utcDate, sourceTz, targetTz);

		if (!srcInfo || !tgtInfo) {
			error = 'Error formatting date for the selected timezones.';
			return;
		}

		result = {
			utcDate,
			epochMs: utcDate.getTime().toString(),
			src: srcInfo,
			tgt: tgtInfo,
			diff
		};
	}

	$: datetimeInput, sourceTz, targetTz, convert();

	function resetAll() {
		datetimeInput = '';
		result = null;
		error = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Timezone Converter — SAM Time Formatter</title>
</svelte:head>

<div class="converter-layout">
	<!-- Input Card -->
	<div class="card main-card">
		<div class="card-head">
			<h2>Convert Datetime Between Timezones</h2>
			<button type="button" class="link-btn" on:click={useNow}>Use current time</button>
		</div>

		<!-- Datetime Input -->
		<label class="field">
			<span>Date &amp; Time</span>
			<input type="datetime-local" step="1" bind:value={datetimeInput} />
		</label>

		<!-- Timezone Selection Grid -->
		<div class="tz-grid">
			<div class="tz-col">
				<TimezoneSelect
					label="From Timezone (Source)"
					bind:value={sourceTz}
				/>
			</div>

			<div class="swap-col">
				<button
					type="button"
					class="swap-btn"
					on:click={swapTimezones}
					title="Swap source and target timezones"
					aria-label="Swap source and target timezones"
				>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="7" y1="16" x2="17" y2="16"></line>
						<polyline points="13 20 17 16 13 12"></polyline>
						<line x1="17" y1="8" x2="7" y2="8"></line>
						<polyline points="11 4 7 8 11 12"></polyline>
					</svg>
				</button>
			</div>

			<div class="tz-col">
				<TimezoneSelect
					label="To Timezone (Target)"
					bind:value={targetTz}
				/>
			</div>
		</div>

		<!-- Target Quick Presets -->
		<div class="presets-row">
			<span class="presets-label">Quick Target:</span>
			<div class="presets-pills">
				{#each ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'] as quickTz}
					<button
						type="button"
						class="preset-pill"
						class:active={targetTz === quickTz}
						on:click={() => setTargetTz(quickTz)}
					>
						{quickTz.split('/')[1] || quickTz}
					</button>
				{/each}
			</div>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<!-- Result Display -->
		{#if result}
			<div class="result-container">
				<!-- Hero Converted Result Box -->
				<div class="hero-result">
					<div class="hero-top">
						<div class="hero-meta">
							<span class="hero-tag">CONVERTED RESULT</span>
							<span class="hero-tz-name">{result.tgt.dateOnly}</span>
						</div>
						<div class="hero-badges">
							<span class="day-badge" class:ahead={result.diff.dayShift > 0} class:behind={result.diff.dayShift < 0}>
								{result.diff.dayShiftLabel}
							</span>
							<CopyButton text={result.tgt.formattedLong} title="Copy formatted datetime" />
						</div>
					</div>

					<div class="hero-time-row">
						<span class="hero-time">{result.tgt.time12}</span>
						<span class="hero-tz-pill">{result.tgt.abbr || result.tgt.offsetStr}</span>
					</div>

					<div class="hero-subtext">
						<span>{result.tgt.formattedLong}</span>
					</div>
				</div>

				<!-- Comparison & Time Difference Banner -->
				<div class="diff-banner">
					<div class="diff-icon-wrap">
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<polyline points="12 6 12 12 16 14"></polyline>
						</svg>
					</div>
					<div class="diff-content">
						<strong>Time Difference:</strong>
						<span>{result.diff.diffText} ({result.diff.diffHours >= 0 ? `+${result.diff.diffHours}` : result.diff.diffHours} hrs)</span>
					</div>
				</div>

				<!-- Detailed Output Grid -->
				<div class="details-grid">
					<!-- Target Formats -->
					<div class="detail-card">
						<span class="detail-label">24-Hour Format</span>
						<div class="detail-value-row">
							<span class="detail-value mono">{result.tgt.time24}</span>
							<CopyButton text={result.tgt.time24} title="Copy 24h time" />
						</div>
					</div>

					<div class="detail-card">
						<span class="detail-label">12-Hour Format</span>
						<div class="detail-value-row">
							<span class="detail-value mono">{result.tgt.time12}</span>
							<CopyButton text={result.tgt.time12} title="Copy 12h time" />
						</div>
					</div>

					<div class="detail-card">
						<span class="detail-label">Target ISO-8601</span>
						<div class="detail-value-row">
							<span class="detail-value mono small">{result.tgt.iso}</span>
							<CopyButton text={result.tgt.iso} title="Copy ISO-8601 string" />
						</div>
					</div>

					<div class="detail-card">
						<span class="detail-label">Target UTC Offset</span>
						<div class="detail-value-row">
							<span class="detail-value mono">{result.tgt.offsetStr} ({result.tgt.abbr})</span>
							<CopyButton text={result.tgt.offsetStr} title="Copy UTC offset" />
						</div>
					</div>

					<!-- Daylight Saving Time Details -->
					<div class="detail-card">
						<span class="detail-label">Source Zone Daylight Status</span>
						<div class="detail-value-row">
							<span class="dst-badge" class:active-dst={result.src.isDST}>
								{result.src.dstLabel}
							</span>
							<span class="detail-sub mono">{result.src.offsetStr}</span>
						</div>
					</div>

					<div class="detail-card">
						<span class="detail-label">Target Zone Daylight Status</span>
						<div class="detail-value-row">
							<span class="dst-badge" class:active-dst={result.tgt.isDST}>
								{result.tgt.dstLabel}
							</span>
							<span class="detail-sub mono">{result.tgt.offsetStr}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<button class="reset-btn" on:click={() => (confirmOpen = true)}>Clear this page</button>

	<ConfirmDialog
		open={confirmOpen}
		message="Clear the datetime and conversion results on this page?"
		onConfirm={resetAll}
		onCancel={() => (confirmOpen = false)}
	/>
</div>

<style>
	.converter-layout {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
	}

	.main-card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 28px 32px;
		max-width: 820px;
		width: 100%;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.14), 0 4px 16px rgba(0, 0, 0, 0.04);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		box-sizing: border-box;
	}

	.main-card:hover {
		border-color: #f97316;
		box-shadow: 0 14px 36px -10px rgba(249, 115, 22, 0.22);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 22px;
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

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 20px;
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
		padding: 11px 16px;
		border-radius: 12px;
		font: 15px/1.3 var(--font-mono);
		transition: border-color 0.2s, box-shadow 0.2s;
		width: 100%;
		box-sizing: border-box;
	}

	.field input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
	}

	/* Timezone Selection Grid */
	.tz-grid {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		margin-bottom: 16px;
		width: 100%;
	}

	.tz-col {
		flex: 1;
		min-width: 0;
	}

	.swap-col {
		padding-bottom: 2px;
	}

	.swap-btn {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		color: #ea580c;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.06);
	}

	.swap-btn:hover {
		background: #f97316;
		color: #ffffff;
		border-color: #f97316;
		transform: rotate(180deg) scale(1.05);
		box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
	}

	/* Presets */
	.presets-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 24px;
	}

	.presets-label {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.presets-pills {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.preset-pill {
		background: #faf7f5;
		border: 1px solid #fed7aa;
		color: var(--text-muted);
		font-size: 11.5px;
		font-weight: 600;
		padding: 4px 12px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preset-pill:hover {
		background: #fff7ed;
		color: #ea580c;
		border-color: #f97316;
	}

	.preset-pill.active {
		background: #f97316;
		border-color: #f97316;
		color: #ffffff;
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25);
	}

	.error {
		color: #dc2626;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 10px;
		padding: 10px 14px;
		font-size: 13px;
		margin: 0 0 16px;
	}

	/* Results */
	.result-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 8px;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.hero-result {
		background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
		border: 1.5px solid #fed7aa;
		border-radius: 16px;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 16px rgba(234, 88, 12, 0.08);
	}

	.hero-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.hero-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.hero-tag {
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.06em;
		color: #ea580c;
		background: #ffffff;
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid #fed7aa;
	}

	.hero-tz-name {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.hero-badges {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.day-badge {
		font-size: 11.5px;
		font-weight: 700;
		padding: 3px 10px;
		border-radius: 9999px;
		background: #ffffff;
		border: 1px solid #fed7aa;
		color: #9a3412;
	}

	.day-badge.ahead {
		background: #ecfdf5;
		color: #065f46;
		border-color: #a7f3d0;
	}

	.day-badge.behind {
		background: #fef2f2;
		color: #991b1b;
		border-color: #fecaca;
	}

	.hero-time-row {
		display: flex;
		align-items: baseline;
		gap: 12px;
		flex-wrap: wrap;
	}

	.hero-time {
		font-family: var(--font-mono);
		font-size: clamp(28px, 4.5vw, 40px);
		font-weight: 800;
		color: #ea580c;
		letter-spacing: -0.01em;
	}

	.hero-tz-pill {
		font-family: var(--font-mono);
		font-size: 15px;
		font-weight: 700;
		color: #9a3412;
		background: #ffffff;
		padding: 4px 12px;
		border-radius: 8px;
		border: 1px solid #fed7aa;
	}

	.hero-subtext {
		font-size: 14.5px;
		font-weight: 600;
		color: var(--text);
	}

	/* Diff Banner */
	.diff-banner {
		background: #ffffff;
		border: 1px solid #fed7aa;
		border-radius: 12px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--text);
		font-size: 13.5px;
	}

	.diff-icon-wrap {
		color: #ea580c;
		flex-shrink: 0;
	}

	.diff-content {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.diff-content strong {
		color: #ea580c;
	}

	/* Details Grid */
	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.detail-card {
		background: #ffffff;
		border: 1px solid #fed7aa;
		border-radius: 12px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.detail-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.detail-value-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.detail-value {
		font-size: 14.5px;
		font-weight: 600;
		color: var(--text);
	}

	.detail-value.mono {
		font-family: var(--font-mono);
	}

	.detail-value.small {
		font-size: 12.5px;
		word-break: break-all;
	}

	.detail-sub {
		font-size: 11.5px;
		color: var(--text-muted);
	}

	.dst-badge {
		font-size: 11.5px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 6px;
		background: #f1f5f9;
		color: #475569;
	}

	.dst-badge.active-dst {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	/* Reset button */
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
	}

	.reset-btn:hover {
		color: #ea580c;
		border-color: #f97316;
		background: #fff7ed;
	}

	@media (max-width: 640px) {
		.main-card {
			padding: 18px 18px;
		}
		.tz-grid {
			flex-direction: column;
			align-items: stretch;
		}
		.swap-col {
			align-self: center;
			padding: 4px 0;
		}
		.details-grid {
			grid-template-columns: 1fr;
		}
		.hero-time {
			font-size: 26px;
		}
	}
</style>


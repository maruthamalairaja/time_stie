<script>
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	let timeInput = '';
	let secondsInput = '';
	let timeError = '';
	let secondsError = '';
	let timeResult = null;
	let secondsResult = null;
	let confirmOpen = false;

	const timePresets = [
		{ label: '00:00:00', val: '00:00:00' },
		{ label: '06:00:00', val: '06:00:00' },
		{ label: '12:00:00', val: '12:00:00' },
		{ label: '18:00:00', val: '18:00:00' },
		{ label: '23:59:59', val: '23:59:59' }
	];

	function pad(n) {
		return String(n).padStart(2, '0');
	}

	function useNowForTime() {
		const d = new Date();
		timeInput = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
		convertTimeToSeconds();
	}

	function selectPreset(val) {
		timeInput = val;
		convertTimeToSeconds();
	}

	// Accepts HH:MM:SS, MM:SS, or a bare number of hours allowed to exceed 24 (e.g. "150:15:30")
	function convertTimeToSeconds() {
		timeError = '';
		timeResult = null;
		const raw = timeInput.trim();
		if (!raw) return;
		const parts = raw.split(':').map((p) => p.trim());
		if (parts.length < 2 || parts.length > 3 || parts.some((p) => p === '' || isNaN(Number(p)))) {
			timeError = 'Use HH:MM:SS or MM:SS, e.g. 02:15:30.';
			return;
		}
		let h = 0, m = 0, s = 0;
		if (parts.length === 3) [h, m, s] = parts.map(Number);
		else [m, s] = parts.map(Number);

		if (m >= 60 || s >= 60 || m < 0 || s < 0) {
			timeError = 'Minutes and seconds must be between 0 and 59.';
			return;
		}
		const totalSeconds = h * 3600 + m * 60 + s;
		timeResult = {
			totalSeconds,
			totalMinutes: (totalSeconds / 60).toFixed(4),
			totalHours: (totalSeconds / 3600).toFixed(4)
		};
	}

	function convertSecondsToTime() {
		secondsError = '';
		secondsResult = null;
		const raw = secondsInput.trim();
		if (!raw) return;
		if (!/^-?\d+(\.\d+)?$/.test(raw)) {
			secondsError = 'Enter a number of seconds.';
			return;
		}
		const total = Math.trunc(Number(raw));
		const negative = total < 0;
		const abs = Math.abs(total);
		const h = Math.floor(abs / 3600);
		const m = Math.floor((abs % 3600) / 60);
		const s = abs % 60;
		secondsResult = {
			hms: `${negative ? '-' : ''}${pad(h)}:${pad(m)}:${pad(s)}`,
			hours: h,
			minutes: m,
			seconds: s
		};
	}

	function resetAll() {
		timeInput = '';
		secondsInput = '';
		timeResult = null;
		secondsResult = null;
		timeError = '';
		secondsError = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Time ⇄ Seconds — SAM Time Formatter</title>
</svelte:head>

<div class="grid">
	<div class="card">
		<div class="card-head">
			<h2>Time → Seconds</h2>
			<button type="button" class="link-btn" on:click={useNowForTime}>Use now</button>
		</div>

		<label class="field">
			<span>Select or Enter Time (HH:MM:SS)</span>
			<div class="time-input-row">
				<input
					type="time"
					step="1"
					class="time-picker-input"
					bind:value={timeInput}
					on:input={convertTimeToSeconds}
					on:change={convertTimeToSeconds}
				/>
				<input
					type="text"
					class="time-text-input"
					placeholder="or type e.g. 02:15:30"
					bind:value={timeInput}
					on:input={convertTimeToSeconds}
				/>
			</div>
		</label>

		<div class="preset-section">
			<span class="preset-title">Quick Select:</span>
			<div class="preset-pills">
				{#each timePresets as p}
					<button
						type="button"
						class="preset-pill"
						class:active={timeInput === p.val}
						on:click={() => selectPreset(p.val)}
					>
						{p.label}
					</button>
				{/each}
			</div>
		</div>

		{#if timeError}<p class="error">{timeError}</p>{/if}

		{#if timeResult}
			<div class="result">
				<div class="result-row">
					<span class="result-label">Seconds</span>
					<span class="result-value mono">{timeResult.totalSeconds}</span>
					<CopyButton text={String(timeResult.totalSeconds)} title="Copy seconds" />
				</div>
				<div class="result-row">
					<span class="result-label">Minutes</span>
					<span class="result-value mono">{timeResult.totalMinutes}</span>
				</div>
				<div class="result-row">
					<span class="result-label">Hours</span>
					<span class="result-value mono">{timeResult.totalHours}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="card">
		<div class="card-head">
			<h2>Seconds → Time</h2>
		</div>
		<label class="field">
			<span>Total seconds</span>
			<input
				type="text"
				inputmode="decimal"
				placeholder="e.g. 8130"
				bind:value={secondsInput}
				on:input={convertSecondsToTime}
			/>
		</label>
		{#if secondsError}<p class="error">{secondsError}</p>{/if}

		{#if secondsResult}
			<div class="result">
				<div class="result-row">
					<span class="result-label">HH:MM:SS</span>
					<span class="result-value mono">{secondsResult.hms}</span>
					<CopyButton text={secondsResult.hms} title="Copy HH:MM:SS" />
				</div>
				<div class="result-row">
					<span class="result-label">Breakdown</span>
					<span class="result-value">
						{secondsResult.hours}h {secondsResult.minutes}m {secondsResult.seconds}s
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<button type="button" class="reset-btn" on:click={() => (confirmOpen = true)}>Clear both fields</button>

<ConfirmDialog
	open={confirmOpen}
	message="Clear the time and seconds fields on this page?"
	onConfirm={resetAll}
	onCancel={() => (confirmOpen = false)}
/>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
		gap: 24px;
	}
	.card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 28px 30px;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.14), 0 4px 16px rgba(0, 0, 0, 0.04);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		min-width: 0;
	}
	.card:hover {
		border-color: #f97316;
		box-shadow: 0 14px 36px -10px rgba(249, 115, 22, 0.22);
	}
	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.card-head h2 {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		margin: 0;
		color: var(--text);
	}

	.link-btn {
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		color: #ea580c;
		font: 700 12px/1 var(--font-display);
		padding: 7px 16px;
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
		min-width: 0;
	}
	.field span {
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: var(--text-muted);
		text-transform: uppercase;
	}
	.time-input-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.time-picker-input {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		color: var(--text);
		padding: 11px 14px;
		border-radius: 12px;
		font: 14.5px/1.3 var(--font-mono);
		transition: border-color 0.2s, box-shadow 0.2s;
		cursor: pointer;
		flex: 1;
		min-width: 0;
		box-sizing: border-box;
	}
	.time-text-input {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		color: var(--text);
		padding: 11px 14px;
		border-radius: 12px;
		font: 14px/1.3 var(--font-mono);
		transition: border-color 0.2s, box-shadow 0.2s;
		flex: 1.2;
		min-width: 0;
		box-sizing: border-box;
	}
	.field input {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		color: var(--text);
		padding: 11px 14px;
		border-radius: 12px;
		font: 14.5px/1.3 var(--font-mono);
		transition: border-color 0.2s, box-shadow 0.2s;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}
	.field input:focus,
	.time-picker-input:focus,
	.time-text-input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
	}

	.preset-section {
		margin-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.preset-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--text-faint);
		letter-spacing: 0.04em;
	}
	.preset-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.preset-pill {
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		color: var(--text-muted);
		font: 600 12px/1 var(--font-mono);
		padding: 5px 14px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.preset-pill:hover {
		color: var(--accent-strong);
		border-color: #f97316;
		background: #ffedd5;
		transform: translateY(-1px);
	}
	.preset-pill.active {
		background: #f97316;
		color: #ffffff;
		border-color: #f97316;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.3);
	}

	.error {
		color: var(--danger);
		font-size: 13px;
		margin: 10px 0 0;
	}

	.result {
		margin-top: 20px;
		padding: 16px 20px;
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 12px rgba(234, 88, 12, 0.06);
	}
	.result-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.result-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		text-transform: uppercase;
	}
	.result-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.result-value.mono {
		font-family: var(--font-mono);
		font-size: 14px;
		color: var(--accent-strong);
	}

	.reset-btn {
		margin-top: 24px;
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		color: #ea580c;
		font: 700 13px/1 var(--font-display);
		padding: 10px 24px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.reset-btn:hover {
		border-color: var(--danger);
		color: var(--danger);
		background: #fef2f2;
		box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15);
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		.grid { gap: 16px; }
		.card { padding: 20px 18px; }
		.time-input-row { flex-direction: column; }
		.time-picker-input, .time-text-input { width: 100%; flex: none; }
		.result { padding: 14px 16px; }
	}
</style>
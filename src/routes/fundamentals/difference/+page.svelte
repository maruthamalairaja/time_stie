<script>
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	let fromInput = '';
	let toInput = '';
	let result = null;
	let error = '';
	let confirmOpen = false;

	function pad(n) {
		return String(n).padStart(2, '0');
	}

	function toLocalInputValue(date) {
		return (
			`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
			`T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
		);
	}

	function useNowFor(which) {
		const val = toLocalInputValue(new Date());
		if (which === 'from') fromInput = val;
		else toInput = val;
	}

	function compute() {
		error = '';
		result = null;
		if (!fromInput || !toInput) return;
		const from = new Date(fromInput);
		const to = new Date(toInput);
		if (isNaN(from.getTime()) || isNaN(to.getTime())) {
			error = 'Enter two valid dates.';
			return;
		}
		const diffMs = to.getTime() - from.getTime();
		const negative = diffMs < 0;
		const abs = Math.abs(diffMs);

		const totalSeconds = Math.floor(abs / 1000);
		const days = Math.floor(abs / 86400000);
		const hours = Math.floor((abs % 86400000) / 3600000);
		const minutes = Math.floor((abs % 3600000) / 60000);
		const seconds = Math.floor((abs % 60000) / 1000);

		result = {
			negative,
			breakdown: `${days}d ${hours}h ${minutes}m ${seconds}s`,
			totalDays: (abs / 86400000).toFixed(4),
			totalHours: (abs / 3600000).toFixed(4),
			totalMinutes: (abs / 60000).toFixed(4),
			totalSeconds
		};
	}

	$: fromInput, toInput, compute();

	function resetAll() {
		fromInput = '';
		toInput = '';
		result = null;
		error = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Get difference — SAM Time Formatter</title>
</svelte:head>

<div class="card">
	<div class="card-head">
		<h2>Difference between two moments</h2>
	</div>

	<div class="two-col">
		<label class="field">
			<span>From</span>
			<input type="datetime-local" step="1" bind:value={fromInput} />
		</label>
		<button type="button" class="link-btn narrow" on:click={() => useNowFor('from')}>Now</button>

		<label class="field">
			<span>To</span>
			<input type="datetime-local" step="1" bind:value={toInput} />
		</label>
		<button type="button" class="link-btn narrow" on:click={() => useNowFor('to')}>Now</button>
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	{#if result}
		<div class="result">
			{#if result.negative}
				<p class="direction-note">“To” is earlier than “From” — showing the absolute gap.</p>
			{/if}
			<div class="result-row">
				<span class="result-label">Breakdown</span>
				<span class="result-value big">{result.breakdown}</span>
				<CopyButton text={result.breakdown} title="Copy duration breakdown" />
			</div>
			<div class="result-row">
				<span class="result-label">Total days</span>
				<span class="result-value mono">{result.totalDays}</span>
			</div>
			<div class="result-row">
				<span class="result-label">Total hours</span>
				<span class="result-value mono">{result.totalHours}</span>
			</div>
			<div class="result-row">
				<span class="result-label">Total minutes</span>
				<span class="result-value mono">{result.totalMinutes}</span>
			</div>
			<div class="result-row">
				<span class="result-label">Total seconds</span>
				<span class="result-value mono">{result.totalSeconds}</span>
			</div>
		</div>
	{/if}
</div>

<button class="reset-btn" on:click={() => (confirmOpen = true)}>Clear this page</button>

<ConfirmDialog
	open={confirmOpen}
	message="Clear both dates on this page?"
	onConfirm={resetAll}
	onCancel={() => (confirmOpen = false)}
/>

<style>
	.card {
		background: #ffffff;
		border: 1.5px solid #fed7aa;
		border-radius: 20px;
		padding: 28px 30px;
		max-width: 680px;
		width: 100%;
		box-shadow: 0 10px 30px -8px rgba(249, 115, 22, 0.14), 0 4px 16px rgba(0, 0, 0, 0.04);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.card:hover {
		border-color: #f97316;
		box-shadow: 0 14px 36px -10px rgba(249, 115, 22, 0.22);
	}
	.card-head {
		margin-bottom: 20px;
	}
	.card-head h2 {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		margin: 0;
		color: var(--text);
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: 12px 14px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 4px;
		min-width: 0;
	}
	.field span {
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: var(--text-muted);
		text-transform: uppercase;
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
	.field input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
	}

	.link-btn {
		background: #fff7ed;
		border: 1.5px solid #fed7aa;
		color: #ea580c;
		font: 700 12px/1 var(--font-display);
		padding: 10px 16px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.08);
	}
	.link-btn:hover {
		background: #f97316;
		border-color: #f97316;
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
		transform: translateY(-1px);
	}
	.link-btn.narrow {
		height: 42px;
		margin-bottom: 4px;
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
	.direction-note {
		color: var(--warning);
		font-size: 12.5px;
		margin: 0 0 4px;
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
		font-family: var(--font-mono);
		font-size: 13.5px;
		color: var(--text);
	}
	.result-value.big {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 700;
		color: var(--accent-strong);
	}
	.result-value.mono {
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
		.card { padding: 20px 18px; }
		.result { padding: 14px 16px; }
	}
</style>
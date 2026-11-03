<script>
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	let startInput = '';
	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;
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

	function useNow() {
		startInput = toLocalInputValue(new Date());
	}

	function compute() {
		error = '';
		result = null;
		if (!startInput) return;
		const start = new Date(startInput);
		if (isNaN(start.getTime())) {
			error = 'Enter a valid start date & time.';
			return;
		}
		const addMs =
			(Number(days) || 0) * 86400000 +
			(Number(hours) || 0) * 3600000 +
			(Number(minutes) || 0) * 60000 +
			(Number(seconds) || 0) * 1000;
		const end = new Date(start.getTime() + addMs);
		result = {
			iso: end.toISOString(),
			display: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())} ${pad(
				end.getHours()
			)}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`
		};
	}

	$: startInput, days, hours, minutes, seconds, compute();

	function resetAll() {
		startInput = '';
		days = 0;
		hours = 0;
		minutes = 0;
		seconds = 0;
		result = null;
		error = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Add duration — SAM Time Formatter</title>
</svelte:head>

<div class="card">
	<div class="card-head">
		<h2>Start + duration</h2>
		<button type="button" class="link-btn" on:click={useNow}>Use now</button>
	</div>

	<label class="field">
		<span>Start date &amp; time</span>
		<input type="datetime-local" step="1" bind:value={startInput} />
	</label>

	<div class="duration-grid">
		<label class="field">
			<span>Days</span>
			<input type="number" bind:value={days} />
		</label>
		<label class="field">
			<span>Hours</span>
			<input type="number" bind:value={hours} />
		</label>
		<label class="field">
			<span>Minutes</span>
			<input type="number" bind:value={minutes} />
		</label>
		<label class="field">
			<span>Seconds</span>
			<input type="number" bind:value={seconds} />
		</label>
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	{#if result}
		<div class="result">
			<div class="result-row">
				<span class="result-label">Result</span>
				<span class="result-value big">{result.display}</span>
				<CopyButton text={result.display} title="Copy result timestamp" />
			</div>
			<div class="result-row">
				<span class="result-label">ISO (UTC)</span>
				<span class="result-value">{result.iso}</span>
			</div>
		</div>
	{/if}
</div>

<button class="reset-btn" on:click={() => (confirmOpen = true)}>Clear this page</button>

<ConfirmDialog
	open={confirmOpen}
	message="Clear the start date and duration fields on this page?"
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
		margin-bottom: 18px;
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

	.duration-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		width: 100%;
	}
	.duration-grid .field {
		margin-bottom: 6px;
		min-width: 0;
	}

	.error {
		color: var(--danger);
		font-size: 13px;
		margin: 6px 0 0;
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

	@media (max-width: 540px) {
		.duration-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.card { padding: 20px 18px; }
		.result { padding: 14px 16px; }
	}
</style>
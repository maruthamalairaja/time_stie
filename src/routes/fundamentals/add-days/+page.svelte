<script>
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let dateInput = '';
	let dayCount = 0;
	let businessDaysOnly = false;
	let result = null;
	let error = '';
	let confirmOpen = false;

	function pad(n) {
		return String(n).padStart(2, '0');
	}

	function useToday() {
		const now = new Date();
		dateInput = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	}

	function addCalendarDays(date, days) {
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		return d;
	}

	function addBusinessDays(date, days) {
		const d = new Date(date);
		const step = days >= 0 ? 1 : -1;
		let remaining = Math.abs(days);
		while (remaining > 0) {
			d.setDate(d.getDate() + step);
			const dayOfWeek = d.getDay();
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				remaining--;
			}
		}
		return d;
	}

	function compute() {
		error = '';
		result = null;
		if (!dateInput) return;
		const [y, m, d] = dateInput.split('-').map(Number);
		const base = new Date(y, m - 1, d);
		if (isNaN(base.getTime())) {
			error = 'Enter a valid date.';
			return;
		}
		const n = Math.trunc(Number(dayCount) || 0);
		const end = businessDaysOnly ? addBusinessDays(base, n) : addCalendarDays(base, n);

		result = {
			display: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
			weekday: weekdays[end.getDay()]
		};
	}

	$: dateInput, dayCount, businessDaysOnly, compute();

	function resetAll() {
		dateInput = '';
		dayCount = 0;
		businessDaysOnly = false;
		result = null;
		error = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Add days — SAM Time Formatter</title>
</svelte:head>

<div class="card">
	<div class="card-head">
		<h2>Shift a date</h2>
		<button type="button" class="link-btn" on:click={useToday}>Use today</button>
	</div>

	<label class="field">
		<span>Starting date</span>
		<input type="date" bind:value={dateInput} />
	</label>

	<label class="field">
		<span>Days to add (use a negative number to go back)</span>
		<input type="number" bind:value={dayCount} />
	</label>

	<label class="checkbox-field">
		<input type="checkbox" bind:checked={businessDaysOnly} />
		<span>Count business days only (skip Saturdays &amp; Sundays)</span>
	</label>

	{#if error}<p class="error">{error}</p>{/if}

	{#if result}
		<div class="result">
			<div class="result-row">
				<span class="result-label">Result</span>
				<span class="result-value big">{result.display} · {result.weekday}</span>
				<CopyButton text={result.display} title="Copy result date" />
			</div>
		</div>
	{/if}
</div>

<button class="reset-btn" on:click={() => (confirmOpen = true)}>Clear this page</button>

<ConfirmDialog
	open={confirmOpen}
	message="Clear the date and day count on this page?"
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

	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		cursor: pointer;
		user-select: none;
	}
	.checkbox-field input {
		width: 18px;
		height: 18px;
		accent-color: var(--accent);
		cursor: pointer;
		border-radius: 4px;
	}
	.checkbox-field span {
		font-size: 13.5px;
		color: var(--text-muted);
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

	@media (max-width: 640px) {
		.card { padding: 20px 18px; }
		.result { padding: 14px 16px; }
	}
</style>
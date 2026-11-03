<script>
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	let nanoInput = '';
	let dtInput = '';
	let nanoError = '';
	let dtError = '';
	let nanoResult = null;
	let dtResult = null;
	let confirmOpen = false;

	function pad(n, len = 2) {
		return String(n).padStart(len, '0');
	}

	function toLocalInputValue(date) {
		return (
			`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
			`T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
		);
	}

	function convertNanoToDatetime() {
		nanoError = '';
		nanoResult = null;
		const raw = nanoInput.trim();
		if (!raw) return;
		if (!/^-?\d+$/.test(raw)) {
			nanoError = 'Enter a whole number of nanoseconds (digits only).';
			return;
		}
		try {
			const ns = BigInt(raw);
			const ms = ns / 1000000n;
			const subMsNs = ns % 1000000n;
			const date = new Date(Number(ms));
			if (isNaN(date.getTime())) throw new Error('out of range');
			nanoResult = {
				utc: date.toISOString().replace('T', ' ').replace('Z', ' UTC'),
				iso: date.toISOString(),
				local: date.toLocaleString(),
				epochMs: ms.toString(),
				subMsNs: subMsNs.toString().padStart(6, '0')
			};
		} catch (e) {
			nanoError = 'That value is outside the range JavaScript can represent as a date.';
		}
	}

	function convertDatetimeToNano() {
		dtError = '';
		dtResult = null;
		if (!dtInput) return;
		const date = new Date(dtInput);
		if (isNaN(date.getTime())) {
			dtError = 'Enter a valid date and time.';
			return;
		}
		const ns = BigInt(date.getTime()) * 1000000n;
		dtResult = {
			nano: ns.toString(),
			iso: date.toISOString(),
			epochMs: date.getTime().toString()
		};
	}

	function useNowForNano() {
		nanoInput = (BigInt(Date.now()) * 1000000n).toString();
		convertNanoToDatetime();
	}
	function useNowForDatetime() {
		dtInput = toLocalInputValue(new Date());
		convertDatetimeToNano();
	}

	function resetAll() {
		nanoInput = '';
		dtInput = '';
		nanoResult = null;
		dtResult = null;
		nanoError = '';
		dtError = '';
		confirmOpen = false;
	}
</script>

<svelte:head>
	<title>Nano UTC ⇄ Datetime — SAM Time Formatter</title>
</svelte:head>

<div class="grid">
	<div class="card">
		<div class="card-head">
			<h2>Nano UTC → Datetime</h2>
			<button type="button" class="link-btn" on:click={useNowForNano}>Use now</button>
		</div>
		<label class="field">
			<span>Nanoseconds since epoch</span>
			<input
				type="text"
				inputmode="numeric"
				placeholder="e.g. 1765432100123456789"
				bind:value={nanoInput}
				on:input={convertNanoToDatetime}
			/>
		</label>
		{#if nanoError}<p class="error">{nanoError}</p>{/if}

		{#if nanoResult}
			<div class="result">
				<div class="result-row">
					<span class="result-label">UTC</span>
					<span class="result-value">{nanoResult.utc}</span>
					<CopyButton text={nanoResult.utc} title="Copy UTC Datetime" />
				</div>
				<div class="result-row">
					<span class="result-label">Local time</span>
					<span class="result-value">{nanoResult.local}</span>
				</div>
				<div class="result-row">
					<span class="result-label">Epoch ms</span>
					<span class="result-value mono">{nanoResult.epochMs}</span>
				</div>
				<div class="result-row">
					<span class="result-label">Sub-ms remainder</span>
					<span class="result-value mono">{nanoResult.subMsNs} ns</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="card">
		<div class="card-head">
			<h2>Datetime → Nano UTC</h2>
			<button type="button" class="link-btn" on:click={useNowForDatetime}>Use now</button>
		</div>
		<label class="field">
			<span>Date &amp; time (your local timezone)</span>
			<input type="datetime-local" step="1" bind:value={dtInput} on:input={convertDatetimeToNano} />
		</label>
		{#if dtError}<p class="error">{dtError}</p>{/if}

		{#if dtResult}
			<div class="result">
				<div class="result-row">
					<span class="result-label">Nano UTC</span>
					<span class="result-value mono break">{dtResult.nano}</span>
					<CopyButton text={dtResult.nano} title="Copy Nanosecond timestamp" />
				</div>
				<div class="result-row">
					<span class="result-label">ISO (UTC)</span>
					<span class="result-value">{dtResult.iso}</span>
				</div>
				<div class="result-row">
					<span class="result-label">Epoch ms</span>
					<span class="result-value mono">{dtResult.epochMs}</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<button type="button" class="reset-btn" on:click={() => (confirmOpen = true)}>Clear both fields</button>

<ConfirmDialog
	open={confirmOpen}
	message="Clear the nanosecond and datetime fields on this page?"
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
		font-size: 13.5px;
		color: var(--accent-strong);
	}
	.result-value.break {
		word-break: break-all;
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
		.result { padding: 14px 16px; }
	}
</style>
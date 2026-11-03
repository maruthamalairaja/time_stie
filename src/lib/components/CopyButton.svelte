<script>
	export let text = '';
	export let title = 'Copy to clipboard';

	let copied = false;
	let timeoutId;

	async function handleCopy() {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(String(text));
			copied = true;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}
</script>

<button
	type="button"
	class="copy-icon-btn"
	class:copied
	on:click={handleCopy}
	aria-label={copied ? 'Copied to clipboard' : title}
	title={copied ? 'Copied!' : title}
>
	{#if copied}
		<!-- Checkmark Icon -->
		<svg
			class="icon check-icon"
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	{:else}
		<!-- Clipboard / Copy Icon -->
		<svg
			class="icon"
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<rect x="9" y="9" width="13" height="13" rx="3" ry="3" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		</svg>
	{/if}
</button>

<style>
	.copy-icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		padding: 0;
		background: #fff7ed;
		color: #ea580c;
		border: 1px solid #fed7aa;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		flex-shrink: 0;
	}

	.copy-icon-btn:hover {
		background: #ffedd5;
		border-color: #f97316;
		color: #c2410c;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(249, 115, 22, 0.18);
	}

	.copy-icon-btn:active {
		transform: translateY(0);
	}

	.copy-icon-btn.copied {
		background: #ecfdf5;
		color: #059669;
		border-color: #a7f3d0;
		box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
	}

	.icon {
		display: block;
		transition: transform 0.15s ease;
	}

	.check-icon {
		animation: pop 0.2s ease-out;
	}

	@keyframes pop {
		0% {
			transform: scale(0.6);
		}
		70% {
			transform: scale(1.15);
		}
		100% {
			transform: scale(1);
		}
	}
</style>


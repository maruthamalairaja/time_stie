<script>
	export let open = false;
	export let message = 'Are you sure?';
	export let onConfirm = () => {};
	export let onCancel = () => { open = false; };
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="overlay" on:click={onCancel}>
		<div class="dialog" on:click|stopPropagation>
			<div class="dialog-icon-wrap">
				<svg class="dialog-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
			</div>
			<p class="dialog-msg">{message}</p>
			<div class="dialog-actions">
				<button type="button" class="btn-cancel" on:click={onCancel}>Cancel</button>
				<button type="button" class="btn-confirm" on:click={onConfirm}>Clear</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		animation: fadeIn 0.15s ease-out;
	}

	.dialog {
		background: #ffffff;
		border: 1px solid var(--border, #fed7aa);
		border-radius: 20px;
		padding: 28px;
		max-width: 380px;
		width: 90%;
		box-shadow: 0 20px 45px -10px rgba(234, 88, 12, 0.18), 0 10px 25px rgba(0, 0, 0, 0.08);
		animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.dialog-icon-wrap {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: #fff7ed;
		border: 1px solid #fed7aa;
		color: #ea580c;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 14px;
	}

	.dialog-msg {
		color: var(--text, #1e293b);
		font-size: 15px;
		font-weight: 600;
		margin: 0 0 24px;
		line-height: 1.5;
	}

	.dialog-actions {
		display: flex;
		gap: 12px;
		width: 100%;
		justify-content: center;
	}

	button {
		flex: 1;
		padding: 10px 20px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.15s ease;
	}

	.btn-cancel {
		background: #f8fafc;
		border-color: #e2e8f0;
		color: #64748b;
	}
	.btn-cancel:hover {
		background: #f1f5f9;
		color: #334155;
	}

	.btn-confirm {
		background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
	}
	.btn-confirm:hover {
		background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
		box-shadow: 0 6px 18px rgba(234, 88, 12, 0.42);
		transform: translateY(-1px);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scaleUp {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>

<script>
	import { toasts, dismiss } from '$lib/stores/toast.js';
</script>

<div class="toast-host" role="status" aria-live="polite">
	{#each $toasts as t (t.id)}
		<div class="toast toast-{t.type}" on:click={() => dismiss(t.id)}>
			<span class="dot"></span>
			<span class="msg">{t.message}</span>
		</div>
	{/each}
</div>

<style>
	.toast-host {
		position: fixed;
		bottom: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		z-index: 1000;
		max-width: min(360px, calc(100vw - 32px));
	}
	.toast {
		display: flex;
		align-items: center;
		gap: 12px;
		background: #ffffff;
		border: 1px solid var(--border, #fed7aa);
		color: var(--text, #1e293b);
		padding: 12px 16px;
		border-radius: 14px;
		font-size: 13.5px;
		font-weight: 500;
		font-family: var(--font-body);
		box-shadow: 0 10px 30px -5px rgba(234, 88, 12, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05);
		cursor: pointer;
		animation: rise 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		transition: transform 0.15s ease;
	}
	.toast:hover {
		transform: translateY(-2px);
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--accent, #f97316);
		box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
	}
	.toast-success .dot {
		background: var(--success, #16a34a);
		box-shadow: 0 0 8px rgba(22, 163, 74, 0.4);
	}
	.toast-error .dot {
		background: var(--danger, #ef4444);
		box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
	}
	.toast-info .dot {
		background: var(--accent, #f97316);
		box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>

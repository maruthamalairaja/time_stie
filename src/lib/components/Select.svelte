<script>
	import { createEventDispatcher } from 'svelte';

	export let label = '';
	export let value;
	export let options = [];
	export let placeholder = 'Select';

	const dispatch = createEventDispatcher();
	let open = false;
	let rootEl;

	$: current = options.find((o) => o.value === value);

	function choose(opt) {
		value = opt.value;
		open = false;
		dispatch('change', { value: opt.value });
	}
	function handleWindowClick(e) {
		if (rootEl && !rootEl.contains(e.target)) open = false;
	}
	function handleKey(e) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window on:click={handleWindowClick} on:keydown={handleKey} />

<div class="select-field" bind:this={rootEl}>
	{#if label}<label class="select-label">{label}</label>{/if}
	<button
		type="button"
		class="select-trigger"
		class:open
		on:click={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
	>
		<span>{current ? current.label : placeholder}</span>
		<svg class="chev" width="12" height="8" viewBox="0 0 12 8" fill="none">
			<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>
	{#if open}
		<ul class="select-menu" role="listbox">
			{#each options as opt}
				<li>
					<button
						type="button"
						class="select-option"
						class:selected={opt.value === value}
						role="option"
						aria-selected={opt.value === value}
						on:click={() => choose(opt)}
					>
						{opt.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.select-field {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.select-label {
		font-size: 11.5px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.select-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		width: 100%;
		background: #ffffff;
		border: 1px solid var(--border);
		color: var(--text);
		padding: 11px 16px;
		border-radius: 12px;
		font: 14px/1.3 var(--font-body);
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		box-shadow: var(--shadow-sm);
	}
	.select-trigger:hover {
		border-color: var(--accent);
	}
	.select-trigger.open {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.chev {
		color: var(--text-muted);
		flex-shrink: 0;
		transition: transform 0.15s;
	}
	.select-trigger.open .chev {
		transform: rotate(180deg);
		color: var(--accent);
	}
	.select-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 30;
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 6px;
		list-style: none;
		margin: 0;
		box-shadow: 0 16px 36px -8px rgba(234, 88, 12, 0.15), 0 4px 14px rgba(0, 0, 0, 0.04);
		max-height: 240px;
		overflow-y: auto;
	}
	.select-option {
		width: 100%;
		text-align: left;
		background: transparent;
		border: 0;
		color: var(--text);
		padding: 9px 12px;
		border-radius: 8px;
		font: 13.5px/1.3 var(--font-body);
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.select-option:hover {
		background: rgba(249, 115, 22, 0.08);
		color: var(--accent-strong);
	}
	.select-option.selected {
		color: var(--accent-strong);
		font-weight: 700;
		background: rgba(249, 115, 22, 0.12);
	}
</style>

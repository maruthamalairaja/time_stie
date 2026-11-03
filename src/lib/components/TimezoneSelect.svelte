<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { getAllTimezones, getUserTimezone } from '$lib/tz.js';

	export let label = '';
	export let value = 'UTC';
	export let placeholder = 'Select timezone';

	const dispatch = createEventDispatcher();
	let open = false;
	let rootEl;
	let searchInputEl;
	let searchQuery = '';
	let activeTab = 'all'; // 'all', 'popular', 'America', 'Europe', 'Asia', 'Pacific'

	let allTimezones = [];

	onMount(() => {
		allTimezones = getAllTimezones();
		if (!value) {
			value = getUserTimezone();
		}
	});

	$: currentTz = allTimezones.find((t) => t.id === value) || {
		id: value,
		label: value,
		city: value.split('/').pop().replace(/_/g, ' '),
		offset: ''
	};

	$: filteredList = allTimezones.filter((t) => {
		if (activeTab === 'popular' && !t.isPopular) return false;
		if (['America', 'Europe', 'Asia', 'Pacific'].includes(activeTab) && t.region !== activeTab) {
			return false;
		}
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase().trim();
		return t.searchTerms.includes(q) || t.id.toLowerCase().includes(q) || t.label.toLowerCase().includes(q);
	});

	function selectTimezone(tzId) {
		value = tzId;
		open = false;
		searchQuery = '';
		dispatch('change', { value: tzId });
	}

	function handleToggle() {
		open = !open;
		if (open) {
			setTimeout(() => {
				if (searchInputEl) searchInputEl.focus();
			}, 50);
		}
	}

	function handleWindowClick(e) {
		if (rootEl && !rootEl.contains(e.target)) {
			open = false;
		}
	}

	function handleKeyDown(e) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleWindowClick} on:keydown={handleKeyDown} />

<div class="tz-select-root" bind:this={rootEl}>
	{#if label}
		<span class="tz-label">{label}</span>
	{/if}

	<button
		type="button"
		class="tz-trigger"
		class:open
		on:click={handleToggle}
		aria-haspopup="dialog"
		aria-expanded={open}
	>
		<div class="trigger-content">
			<span class="trigger-city">{currentTz.city || placeholder}</span>
			{#if currentTz.offset}
				<span class="trigger-offset-pill">{currentTz.offset}</span>
			{/if}
			<span class="trigger-id">{currentTz.id}</span>
		</div>
		<svg class="chev" width="12" height="8" viewBox="0 0 12 8" fill="none">
			<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if open}
		<div class="tz-dropdown">
			<!-- Search & Filter Header -->
			<div class="tz-search-header">
				<div class="tz-search-box">
					<svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" width="16" height="16">
						<circle cx="9" cy="9" r="6" stroke-width="1.8" />
						<line x1="13.5" y1="13.5" x2="18" y2="18" stroke-width="1.8" stroke-linecap="round" />
					</svg>
					<input
						bind:this={searchInputEl}
						type="text"
						class="tz-search-input"
						placeholder="Search city, country, offset, code (e.g. Tokyo, EST, +5:30)..."
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button type="button" class="clear-search-btn" on:click={() => (searchQuery = '')}>×</button>
					{/if}
				</div>

				<div class="tz-filter-tabs">
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'all'}
						on:click={() => (activeTab = 'all')}
					>
						All
					</button>
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'popular'}
						on:click={() => (activeTab = 'popular')}
					>
						Popular
					</button>
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'America'}
						on:click={() => (activeTab = 'America')}
					>
						Americas
					</button>
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'Europe'}
						on:click={() => (activeTab = 'Europe')}
					>
						Europe
					</button>
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'Asia'}
						on:click={() => (activeTab = 'Asia')}
					>
						Asia
					</button>
					<button
						type="button"
						class="filter-tab"
						class:active={activeTab === 'Pacific'}
						on:click={() => (activeTab = 'Pacific')}
					>
						Pacific
					</button>
				</div>
			</div>

			<!-- Options List -->
			<ul class="tz-list" role="listbox">
				{#if filteredList.length === 0}
					<li class="empty-notice">No matching timezones found.</li>
				{:else}
					{#each filteredList as item (item.id)}
						<li>
							<button
								type="button"
								class="tz-option"
								class:selected={item.id === value}
								role="option"
								aria-selected={item.id === value}
								on:click={() => selectTimezone(item.id)}
							>
								<div class="option-left">
									<div class="option-title-row">
										<span class="option-city">{item.city}</span>
										{#if item.isPopular}
											<span class="popular-badge">Popular</span>
										{/if}
									</div>
									<span class="option-id">{item.id}</span>
								</div>
								<span class="option-offset">{item.offset}</span>
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>

<style>
	.tz-select-root {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.tz-label {
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.tz-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		background: #ffffff;
		border: 1.5px solid var(--border, #fed7aa);
		color: var(--text);
		padding: 10px 14px;
		border-radius: 12px;
		font: 14px/1.3 var(--font-body);
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.06);
		text-align: left;
		box-sizing: border-box;
	}

	.tz-trigger:hover {
		border-color: var(--accent, #f97316);
		background: #fffdfb;
	}

	.tz-trigger.open {
		border-color: var(--accent, #f97316);
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
	}

	.trigger-content {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		min-width: 0;
	}

	.trigger-city {
		font-weight: 700;
		color: var(--text);
		font-size: 14px;
	}

	.trigger-offset-pill {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		color: var(--accent-strong, #ea580c);
		background: #fff7ed;
		border: 1px solid var(--border, #fed7aa);
		padding: 2px 7px;
		border-radius: 9999px;
	}

	.trigger-id {
		font-size: 12px;
		color: var(--text-faint, #94a3b8);
	}

	.chev {
		color: var(--text-muted);
		flex-shrink: 0;
		transition: transform 0.18s ease;
	}

	.tz-trigger.open .chev {
		transform: rotate(180deg);
		color: var(--accent);
	}

	/* Dropdown Panel */
	.tz-dropdown {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 60;
		background: #ffffff;
		border: 1.5px solid var(--border-strong, #fdba74);
		border-radius: 16px;
		box-shadow: 0 18px 40px -8px rgba(234, 88, 12, 0.2), 0 6px 18px rgba(0, 0, 0, 0.06);
		overflow: hidden;
		animation: popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
		display: flex;
		flex-direction: column;
		max-height: 380px;
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.tz-search-header {
		padding: 10px 12px 8px;
		background: #fffaf5;
		border-bottom: 1px solid var(--border-subtle, #ffedd5);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tz-search-box {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		color: var(--text-muted);
		pointer-events: none;
	}

	.tz-search-input {
		width: 100%;
		padding: 8px 30px 8px 34px;
		border-radius: 10px;
		border: 1px solid var(--border, #fed7aa);
		background: #ffffff;
		font-size: 13px;
		color: var(--text);
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.15s ease;
	}

	.tz-search-input:focus {
		border-color: var(--accent, #f97316);
		box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
	}

	.clear-search-btn {
		position: absolute;
		right: 8px;
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 16px;
		cursor: pointer;
		padding: 2px 6px;
		line-height: 1;
	}

	.tz-filter-tabs {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		padding-bottom: 2px;
		scrollbar-width: none;
	}
	.tz-filter-tabs::-webkit-scrollbar {
		display: none;
	}

	.filter-tab {
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-muted);
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 9999px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s ease;
	}

	.filter-tab:hover {
		color: var(--accent-strong);
		background: rgba(249, 115, 22, 0.08);
	}

	.filter-tab.active {
		background: #ffffff;
		color: var(--accent-strong);
		border-color: var(--border, #fed7aa);
		font-weight: 700;
		box-shadow: 0 1px 3px rgba(234, 88, 12, 0.1);
	}

	/* List */
	.tz-list {
		list-style: none;
		margin: 0;
		padding: 6px;
		overflow-y: auto;
		flex: 1;
		scrollbar-width: thin;
	}

	.empty-notice {
		padding: 24px;
		text-align: center;
		color: var(--text-muted);
		font-size: 13px;
	}

	.tz-option {
		width: 100%;
		text-align: left;
		background: transparent;
		border: 0;
		border-radius: 10px;
		padding: 8px 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		transition: background 0.15s ease;
	}

	.tz-option:hover {
		background: #fff7ed;
	}

	.tz-option.selected {
		background: #ffedd5;
	}

	.option-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.option-title-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.option-city {
		font-weight: 700;
		font-size: 13px;
		color: var(--text);
	}

	.popular-badge {
		font-size: 9.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: #fed7aa;
		color: #9a3412;
		padding: 1px 6px;
		border-radius: 4px;
	}

	.option-id {
		font-size: 11px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.option-offset {
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		color: var(--accent-strong);
		background: #ffffff;
		border: 1px solid var(--border-subtle, #ffedd5);
		padding: 2px 8px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
</style>

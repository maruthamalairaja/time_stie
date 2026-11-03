<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	const subtabs = [
		{ href: `${base}/nano-utc/datetime`, label: 'Nano UTC ⇄ Datetime' },
		{ href: `${base}/nano-utc/date`, label: 'Nano UTC ⇄ Date' },
		{ href: `${base}/nano-utc/seconds`, label: 'Time ⇄ Seconds' }
	];

	$: path = $page.url.pathname;
</script>

<section class="section-shell">
	<div class="section-head">
		<h1>Nano UTC Conversion</h1>
		<p>Convert nanosecond epoch timestamps to readable dates and clock time in both directions.</p>
	</div>

	<nav class="subtabs" aria-label="Nano UTC tools">
		{#each subtabs as t}
			<a href={t.href} class="subtab" aria-current={path === t.href ? 'page' : undefined}>
				{t.label}
			</a>
		{/each}
	</nav>

	<div class="section-body">
		<slot />
	</div>
</section>

<style>
	.section-shell {
		max-width: 1280px;
		width: 100%;
		margin: 0 auto;
		padding: 24px 32px 32px;
		flex: 1;
		box-sizing: border-box;
		min-width: 0;
	}
	.section-head h1 {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 0 6px;
		color: var(--text);
	}
	.section-head p {
		font: 400 14px/1.5 var(--font-body);
		color: var(--text-muted);
		margin: 0 0 20px;
		max-width: 75ch;
	}

	.subtabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		border-bottom: 1px solid var(--border-subtle);
		padding-bottom: 12px;
		margin-bottom: 24px;
	}
	.subtab {
		text-decoration: none;
		font: 600 13px/1.3 var(--font-body);
		color: var(--text-muted);
		padding: 7px 18px;
		border-radius: var(--radius-pill);
		background: #ffffff;
		border: 1px solid var(--border);
		transition: all 0.2s ease;
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.06);
		white-space: nowrap;
	}
	.subtab:hover {
		color: var(--accent-strong);
		border-color: var(--accent);
		background: #fff7ed;
		transform: translateY(-1px);
	}
	.subtab[aria-current='page'] {
		color: #ffffff;
		background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
		border-color: transparent;
		box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
		font-weight: 700;
	}

	.section-body {
		min-width: 0;
	}

	@media (max-width: 640px) {
		.section-shell {
			padding: 16px 16px 24px;
		}
		.section-head h1 {
			font-size: 22px;
		}
		.subtabs {
			gap: 6px;
		}
		.subtab {
			font-size: 12px;
			padding: 6px 12px;
		}
	}
</style>
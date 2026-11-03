<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import Footer from '$lib/components/Footer.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';

	const tabs = [
		{ href: `${base}/nano-utc`, match: '/nano-utc', label: 'Nano UTC Conversion' },
		{ href: `${base}/fundamentals`, match: '/fundamentals', label: 'Fundamentals' },
		{ href: `${base}/timezones`, match: '/timezones', label: 'Timezones' }
	];

	$: path = $page.url.pathname;
</script>

<div class="app-shell">
	<header class="site-header">
		<div class="header-inner">
			<a class="brand" href="{base}/">
				<span class="brand-badge">SAM</span>
				<span class="brand-title">Time Formatter</span>
			</a>

			<nav class="main-tabs" aria-label="Main sections">
				{#each tabs as t}
					<a
						href={t.href}
						class="main-tab"
						aria-current={path.startsWith(t.match) ? 'page' : undefined}
					>
						{t.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<main class="site-main">
		<slot />
	</main>

	<Footer />
</div>

<ToastHost />

<style>
	:global(html, body) {
		height: 100%;
		overflow: hidden;
		background: var(--bg, #faf7f5);
		color: var(--text, #1e293b);
	}

	.app-shell {
		height: 100dvh; /* dvh = dynamic viewport height — correct on mobile with chrome bars */
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* ── Header ─────────────────────────────────────────── */
	.site-header {
		flex-shrink: 0; /* never shrink — stays at fixed height */
		z-index: 50;
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--border-subtle);
		box-shadow: 0 4px 20px rgba(234, 88, 12, 0.05);
	}

	.header-inner {
		max-width: 1360px;
		width: 100%;
		margin: 0 auto;
		padding: 11px 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: var(--text);
		transition: opacity 0.15s ease;
		flex-shrink: 0;
	}
	.brand:hover {
		opacity: 0.9;
	}

	.brand-badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 12px;
		letter-spacing: 0.06em;
		color: #ffffff;
		background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
		border-radius: var(--radius-sm);
		padding: 5px 10px;
		box-shadow: 0 2px 10px rgba(234, 88, 12, 0.3);
	}

	.brand-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 19px;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.main-tabs {
		display: flex;
		gap: 6px;
		background: #fff7ed;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		padding: 4px;
		box-shadow: 0 1px 4px rgba(234, 88, 12, 0.08);
	}

	.main-tab {
		text-decoration: none;
		font: 600 13px/1.3 var(--font-body);
		color: var(--text-muted);
		padding: 7px 18px;
		border-radius: var(--radius-pill);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		white-space: nowrap;
	}

	.main-tab:hover {
		color: var(--accent-strong);
		background: rgba(249, 115, 22, 0.08);
	}

	.main-tab[aria-current='page'] {
		background: #ffffff;
		color: var(--accent-strong);
		border: 1px solid var(--border);
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(234, 88, 12, 0.14);
	}

	/* ── Main (scrollable area) ─────────────────────────── */
	.site-main {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		/* custom scrollbar track inside main only */
		scrollbar-width: thin;
		scrollbar-color: #fed7aa var(--bg);
	}

	/* ── Footer ─────────────────────────────────────────── */
	:global(.site-footer) {
		flex-shrink: 0; /* never shrink — sticks to bottom */
	}

	/* ── Mobile ─────────────────────────────────────────── */
	@media (max-width: 640px) {
		.header-inner {
			flex-direction: column;
			align-items: stretch;
			gap: 8px;
			padding: 10px 16px;
		}
		.brand-title {
			font-size: 17px;
		}
		.main-tabs {
			width: 100%;
		}
		.main-tab {
			flex: 1;
			text-align: center;
			padding: 7px 6px;
			font-size: 12px;
		}
	}
</style>
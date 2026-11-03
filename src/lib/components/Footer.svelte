<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let heading = 'Explore our other tools';
	let projects = [];
	let loaded = false;

	onMount(async () => {
		try {
			const res = await fetch(`${base}/config/projects.json`);
			if (res.ok) {
				const data = await res.json();
				heading = data.heading || heading;
				projects = data.projects || [];
			}
		} catch (e) {
			// Config is optional — footer just shows the brand row if it's missing.
		}
		loaded = true;
	});
</script>

<footer class="site-footer">
	<div class="footer-inner">
		{#if loaded && projects.length}
			<div class="explore">
				<div class="explore-heading">{heading}</div>
				<div class="project-grid">
					{#each projects as p}
						<a class="project-card" href={p.url} target="_blank" rel="noopener noreferrer">
							<span class="project-name">{p.name}</span>
							{#if p.description}<span class="project-desc">{p.description}</span>{/if}
							<span class="project-go" aria-hidden="true">↗</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
		<div class="footer-base">
			<div class="brand-row">
				<span class="brand-badge">SAM</span>
				<span class="brand">SAM Time Formatter</span>
			</div>
			<span class="tagline">Runs 100% locally in your browser — zero tracking, zero data uploaded.</span>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		flex-shrink: 0;
		border-top: 1px solid var(--border-subtle, #ffedd5);
		background: #ffffff;
		padding: 24px 0 20px;
	}
	.footer-inner {
		max-width: 1360px;
		width: 100%;
		margin: 0 auto;
		padding: 0 32px;
	}
	.explore {
		margin-bottom: 20px;
	}
	.explore-heading {
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-bottom: 12px;
	}
	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.project-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: #ffffff;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 12px 36px 12px 16px;
		text-decoration: none;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
	}
	.project-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(234, 88, 12, 0.12);
	}
	.project-name {
		font-family: var(--font-display);
		color: var(--text);
		font-weight: 700;
		font-size: 13.5px;
	}
	.project-desc {
		color: var(--text-muted);
		font-size: 12px;
		line-height: 1.4;
	}
	.project-go {
		position: absolute;
		top: 12px;
		right: 14px;
		color: var(--text-faint);
		font-size: 13px;
		transition: all 0.15s ease;
	}
	.project-card:hover .project-go {
		color: var(--accent-strong);
		transform: translate(2px, -2px);
	}
	.footer-base {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.brand-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.brand-badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 11px;
		letter-spacing: 0.08em;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: #ffffff;
		border-radius: 6px;
		padding: 3px 7px;
		box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25);
	}
	.brand {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--text);
		font-size: 13.5px;
		letter-spacing: -0.01em;
	}
	.tagline {
		color: var(--text-faint);
		font-size: 12.5px;
	}

	@media (max-width: 640px) {
		.footer-inner {
			padding: 0 16px;
		}
		.footer-base {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
	}
</style>

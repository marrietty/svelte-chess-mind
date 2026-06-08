<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$lib/stores/theme';

	let { children } = $props();

	$effect(() => {
		const theme = $themeStore;
		if (theme === 'light') {
			document.documentElement.classList.add('light-theme');
			document.documentElement.classList.remove('dark');
			document.documentElement.setAttribute('data-theme', 'light');

			document.body.classList.add('light-theme');
			document.body.classList.remove('dark');
			document.body.setAttribute('data-theme', 'light');
		} else {
			document.documentElement.classList.remove('light-theme');
			document.documentElement.classList.add('dark');
			document.documentElement.setAttribute('data-theme', 'dark');

			document.body.classList.remove('light-theme');
			document.body.classList.add('dark');
			document.body.setAttribute('data-theme', 'dark');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}


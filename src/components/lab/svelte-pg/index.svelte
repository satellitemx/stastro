<script lang="ts">
	import { onMount } from "svelte";

	const localeLanguageFormatter = new Intl.DateTimeFormat(navigator.language, {
		month: "2-digit",
		day: "2-digit",
		year: "2-digit",
		hour: "numeric",
		hour12: true,
		minute: "numeric",
		second: "numeric",
		fractionalSecondDigits: 2,
	});
	export let serverTime: string;
	const serverGeneratedAt = localeLanguageFormatter.format(
		new Date(parseInt(serverTime))
	);

	let currentTime = new Date();
	$: computedCurrentString = localeLanguageFormatter.format(currentTime);

	const tick = () => {
		currentTime = new Date();
		requestAnimationFrame(() => tick());
	};

	onMount(() => {
		tick();
	});
</script>

<div class="container">
	<div class="flex">
		<span> Document </span>
		<span>{serverGeneratedAt}</span>
	</div>
	<div class="flex">
		<span> Current </span>
		<span>{computedCurrentString}</span>
	</div>
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	span {
		font-family: system-ui, sans-serif;
		font-variant-numeric: tabular-nums;
		color: #f2f2f2;
	}

	.container {
		position: absolute;
		max-width: 400px;
		display: flex;
		flex-direction: column;

		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.flex {
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}
</style>

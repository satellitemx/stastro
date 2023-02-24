import { computed, useSignal } from "@preact/signals";
import { render } from "preact";
import { useEffect, useMemo } from "preact/hooks";
import styles from "./styles.css?inline";

const localeLanguageFormatter = new Intl.DateTimeFormat(navigator.language, {
	month: "2-digit",
	day: "2-digit",
	year: "2-digit",
	hour: "numeric",
	hour12: true,
	minute: "numeric",
	second: "numeric",
	fractionalSecondDigits: 2,
})

const Time = (props: {
	serverGeneratedAt: Date | null;
}) => {
	const serverGeneratedAt = useMemo(() => props.serverGeneratedAt
		? localeLanguageFormatter.format(props.serverGeneratedAt)
		: "Unknown", [props.serverGeneratedAt])
	const current = useSignal(new Date())
	const computedCurrentString = computed(() => localeLanguageFormatter.format(current.value))

	const tick = () => {
		current.value = new Date()
		requestAnimationFrame(() => tick())
	}

	useEffect(() => {
		tick()
	}, [])

	return <div class="container">
		<div class="flex">
			<span>Document</span><span>{serverGeneratedAt}</span>
		</div>
		<div class="flex">
			<span>Current</span><span>{computedCurrentString}</span>
		</div>
	</div>
}

customElements.define("st-time", class extends HTMLElement {
	constructor() {
		super()
		this.innerHTML = ""
		const shadowRoot = this.attachShadow({ mode: "closed" })
		const style = document.createElement("style")
		style.innerHTML = styles
		shadowRoot.appendChild(style)
		const serverGeneratedAt = this.dataset.serverGeneratedAt
			? new Date(parseInt(this.dataset.serverGeneratedAt))
			: null
		render(<Time serverGeneratedAt={serverGeneratedAt} />, shadowRoot)
	}
})
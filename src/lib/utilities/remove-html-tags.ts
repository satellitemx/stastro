const r = /<.*>.*?/ig

const removeHTMLTags = (input: string): string => {
	return input.replaceAll(r, "")
}

export default removeHTMLTags
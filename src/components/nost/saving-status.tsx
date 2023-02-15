import { computed } from "@preact/signals";
import { noteIsSaving } from "src/lib/state/note-save.state";

interface Props {
	noteId: string | undefined;
}
const SavingStatus = ({ noteId = "Unknown" }: Props) => {
	const status = computed(() => noteIsSaving.value ? "Saving this note..." : `Viewing ${noteId}`)
	return <>
		{status}
	</>
}

export default SavingStatus
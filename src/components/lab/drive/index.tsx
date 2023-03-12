import { ActionIcon, Anchor, Badge, Button, Card, FileInput, Group, MantineProvider, Stack, Table, Text, TextInput } from "@mantine/core"
import { modals, ModalsProvider } from "@mantine/modals"
import { Notifications, notifications } from "@mantine/notifications"
import { effect, signal, useSignal } from "@preact/signals"
import { IconTrash, IconX } from "@tabler/icons-react"
import { useRef } from "preact/hooks"
import { NavHeader } from "src/components/account"
import { isLoggedIn } from "src/components/account/state"
import pb from "src/lib/pocketbase"

type File = {
	collectionId: string;
	id: string;
	file: string;
	filename: string;
	type: string;
	created: string;
}

const uploadedFiles = signal<Array<File>>([])

effect(() => {
	if (isLoggedIn.value) {
		refreshUploadeList()
	} else {
		uploadedFiles.value = []
	}
})

const deleteFile = (id: string) => {
	pb.collection("files").delete(id)
		.then(() => {
			refreshUploadeList()
		})
		.catch(e => {
			notifications.show({
				title: "Failed to delete file",
				message: e.message,
				color: "red"
			})
		})
}

const refreshUploadeList = () => {
	pb.collection("files").getFullList<File>({
		sort: "-created,id"
	})
		.then(files => {
			uploadedFiles.value = files
		})
		.catch(e => {
			notifications.show({
				title: "Failed to fetch file list",
				message: e.message,
				color: "red"
			})
		})
}

const FileUploadForm = () => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const fileNameRef = useRef<HTMLInputElement>(null)

	const file = useSignal<globalThis.File | null>(null)

	const isUploading = useSignal(false)
	const handleUpload = (formData: FormData) => {
		isUploading.value = true
		const formFile = formData.get("file") as globalThis.File
		formData.set("uploader", pb.authStore.model!.id)
		formData.set("filename", formData.get("filename") || formFile.name)
		formData.set("type", formFile.type)
		pb.collection("files").create(formData)
			.then(() => {
				notifications.show({
					title: "Success",
					message: "File uploaded.",
					color: "green",
				})
				file.value = null
				fileNameRef.current!.value = ""
				refreshUploadeList()
			})
			.catch(() => {
				notifications.show({
					title: "Error",
					message: "Failed to upload file.",
					color: "red",
				})
			})
			.finally(() => {
				isUploading.value = false
			})
	}
	return <Card
		shadow="sm"
		withBorder
	>
		<form onSubmit={e => {
			e.preventDefault()
			const formData = new FormData(e.target as HTMLFormElement)
			handleUpload(formData)
		}}>
			<FileInput
				ref={fileInputRef}
				name="file"
				style={{ display: "none" }}
				onChange={selected => {
					file.value = selected
					if (selected) {
						fileNameRef.current!.value = selected.name
					}
				}}
			/>
			<TextInput
				ref={fileNameRef}
				name="filename"
				autocomplete="off"
				label={<Group>
					<span>{file.value ? "Filename" : "Select a file"}</span>
					{file.value && <Badge size="xs">{file.value.type}</Badge>}
				</Group>}
				onClick={() => {
					if (!file.value) {
						fileInputRef.current?.click()
					}
				}}
				placeholder={file.value?.name || ""}
				rightSection={file.value && <ActionIcon
					onClick={() => {
						file.value = null
						fileNameRef.current!.value = ""
					}}
				>
					<IconX size="1rem" />
				</ActionIcon>}
			/>
			<Stack align="stretch" mt="xs">
				<Button
					type="submit"
					disabled={!file.value}
					loading={isUploading.value}
				>Upload</Button>
			</Stack>
		</form>
	</Card>
}

const FileList = () => {
	return <Table>
		<thead>
			<tr>
				<th>
					Files
				</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{uploadedFiles.value.map(file => <tr key={file.id}>
				<td>
					<Stack align="start" spacing={0}>
						<Anchor
							href={`${import.meta.env.PUBLIC_PB_URL}/api/files/${file.collectionId}/${file.id}/${file.file}`}
							target="_blank"
							lineClamp={1}
						>{file.filename}</Anchor>
						<Group align="center" spacing="xs">
							<Text size="xs" color="gray">
								{new Date(file.created).toLocaleDateString()}
							</Text>
							{file.type && <Badge size="xs" color="gray">{file.type}</Badge>}
						</Group>
					</Stack>
				</td>
				<td>
					<Group position="right">
						<Button
							compact
							leftIcon={<IconTrash size="1rem" />}
							color="red"
							variant="light"
							onClick={() => {
								modals.openConfirmModal({
									title: "Are you sure?",
									children: <Text size="sm">
										This will delete <strong>{file.filename}</strong> on server.
									</Text>,
									labels: {
										confirm: "Delete",
										cancel: "Cancel",
									},
									confirmProps: {
										color: "red"
									},
									onConfirm: () => {
										deleteFile(file.id)
									}
								})
							}}
						>Delete</Button>
					</Group>
				</td>
			</tr>)}
		</tbody>
	</Table>
}

const AppPage = () => {
	return <>
		<Stack
			align="stretch"
			style={{
				width: "100dvw",
				maxWidth: "600px",
				margin: "0 auto",
				padding: "0 0.5rem",
			}}
			spacing="1rem"
		>
			<FileUploadForm />
			<FileList />
		</Stack>
	</>
}

export default function DriveApp() {
	return <MantineProvider withGlobalStyles withNormalizeCSS>
		<NavHeader title="Web Drive" />
		<Notifications />
		<ModalsProvider>
			{isLoggedIn.value && <AppPage />}
		</ModalsProvider>
	</MantineProvider>
}
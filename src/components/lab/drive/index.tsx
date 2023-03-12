import { ActionIcon, Anchor, Badge, Button, Card, FileInput, Group, MantineProvider, Menu, PasswordInput, Stack, Table, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { modals, ModalsProvider } from "@mantine/modals"
import { Notifications, notifications } from "@mantine/notifications"
import { signal, useSignal } from "@preact/signals"
import { IconDoorExit, IconMenu2, IconTrash, IconX } from "@tabler/icons-react"
import { useLayoutEffect, useRef } from "preact/hooks"
import pb from "src/lib/pocketbase"

type File = {
	collectionId: string;
	id: string;
	file: string;
	filename: string;
}

const isLoggedIn = signal(false)
const uploadedFiles = signal<Array<File>>([])

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
	pb.collection("files").getFullList<File>()
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

const LoginForm = () => {
	const form = useForm({
		initialValues: {
			email: "",
			password: "",
		}
	})

	const loggingIn = useSignal(false)
	const login = (username: string, password: string) => {
		loggingIn.value = true
		pb.collection("users").authWithPassword(username, password)
			.then(() => {
				isLoggedIn.value = true
				refreshUploadeList()
			})
			.catch(() => {
				form.setErrors({
					username: "Invalid credentials",
					password: "Invalid credentials",
				})
			})
			.finally(() => {
				loggingIn.value = false
			})
	}

	const refreshingToken = useSignal(false)
	useLayoutEffect(() => {
		refreshingToken.value = true
		pb.collection("users").authRefresh()
			.then(() => {
				isLoggedIn.value = true
				refreshUploadeList()
			})
			.finally(() => {
				refreshingToken.value = false
			})
	}, [])

	return <>
		<h2>Login with account</h2>
		<Card
			shadow="sm"
			withBorder
		>
			<form
				onSubmit={form.onSubmit(values => {
					login(values.email, values.password)
				})}
			>
				<TextInput required autocapitalize="none" {...form.getInputProps("email")} label="Email" />
				<PasswordInput autocomplete="current-password" required {...form.getInputProps("password")} label="Password" />
				<Stack align="stretch" mt="xs">
					<Button type="submit" loading={refreshingToken.value || loggingIn.value}>Login</Button>
				</Stack>
			</form>
		</Card>
	</>
}

const ActionCentre = () => {
	const logOut = () => {
		pb.authStore.clear()
		isLoggedIn.value = false
	}
	return <Group>
		<Menu
			withArrow
			withinPortal
			shadow="md"
			position="bottom-start"
		>
			<Menu.Target>
				<Group align="center">
					<Button
						leftIcon={<IconMenu2 />}
					>{pb.authStore.model?.email}</Button>
				</Group>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item color="red" icon={<IconDoorExit size="1rem" />} onClick={logOut}>
					Log out
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	</Group>
}

const FileUploadForm = () => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const fileNameRef = useRef<HTMLInputElement>(null)

	const file = useSignal<globalThis.File | null>(null)

	const isUploading = useSignal(false)
	const handleUpload = (formData: FormData) => {
		isUploading.value = true
		formData.set("uploader", pb.authStore.model!.id)
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
	return <>
		<h4>Upload a file</h4>
		<Card
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
					label={<Group>
						<span>{file.value ? "Filename" : "Select a file"}</span>
						{file.value && <Badge size="xs">{file.value.name}</Badge>}
					</Group>}
					onClick={() => {
						if (!file.value) {
							fileInputRef.current?.click()
						}
					}}
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
	</>
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
					<Anchor
						href={`${import.meta.env.PUBLIC_PB_URL}/api/files/${file.collectionId}/${file.id}/${file.file}`}
						target="_blank"
					>{file.filename}</Anchor>
				</td>
				<td>
					<Group position="right">
						<Button.Group>
							<Button
								compact
								leftIcon={<IconTrash size="1rem" />}
								color="red"
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
						</Button.Group>
					</Group>
				</td>
			</tr>)}
		</tbody>
	</Table>
}

const AppPage = () => {
	return <>
		<ActionCentre />
		<FileUploadForm />
		<FileList />
	</>
}

export default function DriveApp() {
	return <MantineProvider withGlobalStyles withNormalizeCSS>
		<Notifications />
		<ModalsProvider>
			<Stack
				align="stretch"
				style={{
					width: "calc(100dvw - 2rem)",
					maxWidth: "600px",
					margin: "1rem auto"
				}}
				spacing="1rem"
			>
				{isLoggedIn.value
					? <AppPage />
					: <LoginForm />}
			</Stack>
		</ModalsProvider>
	</MantineProvider>
}
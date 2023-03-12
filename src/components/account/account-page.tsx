import { Avatar, Button, Card, Center, FileInput, Group, MantineProvider, Stack, TextInput } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { notifications, Notifications } from "@mantine/notifications"
import { signal, useSignal } from "@preact/signals"
import { IconUpload } from "@tabler/icons-react"
import { useRef } from "preact/hooks"
import { NavHeader } from "src/components/account"
import { isLoggedIn } from "src/components/account/state"
import pb from "src/lib/pocketbase"

const AccountForm = () => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const overrideAvatar = useSignal(false)
	const src = useSignal(pb.authStore.model?.avatar && `${import.meta.env.PUBLIC_PB_URL}/api/files/${pb.authStore.model?.collectionName}/${pb.authStore.model?.id}/${pb.authStore.model?.avatar}?thumb=100x100f`)

	const updating = signal(false)
	const handleUpdate = (formData: FormData) => {
		updating.value = true
		pb.collection("users").update(pb.authStore.model!.id, formData)
			.then(() => {
				notifications.show({
					title: "Success",
					message: "Profle updated. ",
					color: "green"
				})
			})
			.catch(e => {
				notifications.show({
					title: "Failed to update your profile",
					message: e.message,
					color: "red"
				})
			})
			.finally(() => {
				updating.value = false
			})
	}
	return <Center>
		<Card mt="calc(50px + 1rem)" style={{
			width: "calc(100dvw - 2rem)",
			maxWidth: 400,
			overflow: "visible"
		}} withBorder>
			<form onSubmit={e => {
				e.preventDefault()
				const formData = new FormData(e.target as HTMLFormElement)
				if (!overrideAvatar.value) {
					formData.delete("avatar")
				}
				handleUpdate(formData)
			}}>
				<Group align="end" position="apart" mb="xs">
					<Avatar
						size={100}
						mt="calc(-50px - 1rem)"
						radius={50}
						src={src.value}
						style={{
							boxShadow: "0 0 1px 1px #CCC",
						}}
					/>
					<Button compact variant="outline" leftIcon={<IconUpload size="1rem" />}
						onClick={() => {
							fileInputRef.current?.click()
						}}
					>
						Picture
					</Button>
				</Group>
				<FileInput name="avatar" ref={fileInputRef} style={{ display: "none" }} onChange={file => {
					if (file) {
						src.value = URL.createObjectURL(file)
						overrideAvatar.value = true
					}
				}} />
				<TextInput disabled label="Username" defaultValue={pb.authStore.model?.username} />
				<TextInput disabled label="Email" defaultValue={pb.authStore.model?.email} />
				<TextInput required name="name" label="Name" defaultValue={pb.authStore.model?.name} />
				<Stack mt="xs" align="stretch">
					<Button loading={updating.value} type="submit">Update</Button>
				</Stack>
			</form>
		</Card>
	</Center>
}

const AccountPage = () => {
	return <MantineProvider withNormalizeCSS withGlobalStyles>
		<ModalsProvider>
			<Notifications />
			<NavHeader title="Account" />
			{isLoggedIn.value && <AccountForm />}
		</ModalsProvider>
	</MantineProvider>
}

export default AccountPage
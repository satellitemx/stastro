import { ActionIcon, Button, Card, Group, Menu, PasswordInput, Stack, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { modals } from "@mantine/modals"
import { useSignal, useSignalEffect } from "@preact/signals"
import { IconDoorExit, IconMenu2, IconUser } from "@tabler/icons-react"
import { useLayoutEffect } from "preact/hooks"
import { isLoggedIn } from "src/components/account/state"
import pb from "src/lib/pocketbase"

const logOut = () => {
	pb.authStore.clear()
	isLoggedIn.value = false
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
			})
			.finally(() => {
				refreshingToken.value = false
			})
	}, [])

	return <Card
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
}

type NavHeaderProps = {
	title?: string;
}

export const NavHeader = (props: NavHeaderProps) => {
	useSignalEffect(() => {
		if (!isLoggedIn.value) {
			modals.open({
				modalId: "login-modal",
				closeOnClickOutside: false,
				closeOnEscape: false,
				withCloseButton: false,
				title: "Please login",
				children: <LoginForm />,
				overlayProps: {
					opacity: 0.5,
					blur: 20,
				}
			})
		} else {
			modals.close("login-modal")
		}
	})

	return <Card
		withBorder
		shadow="md"
		p="0.5rem 1rem"
		m="0.5rem"
		style={{
			top: "0.5rem",
			left: 0,
			position: "sticky",
			zIndex: 100,
			background: "#F2F2F2",
		}}
	>
		<Group position="apart">
			<Group>
				<Menu
					withArrow
					withinPortal
					shadow="md"
					position="bottom-start"
					trigger="hover"
				>
					<Menu.Target>
						<Group align="center">
							<ActionIcon>
								<IconMenu2 size="1rem" />
							</ActionIcon>
						</Group>
					</Menu.Target>
					<Menu.Dropdown>
						{isLoggedIn.value && <>
							<Menu.Label>Welcome back, {pb.authStore.model?.name}</Menu.Label>
							<Menu.Item icon={<IconUser size="1rem" />}
								component="a"
								target="_blank"
								href="/account"
							>
								My Account
							</Menu.Item>
							<Menu.Divider />
							<Menu.Label>Danger zone</Menu.Label>
							<Menu.Item color="red" icon={<IconDoorExit size="1rem" />} onClick={logOut}>
								Log out
							</Menu.Item>
						</>}
					</Menu.Dropdown>
				</Menu>
				<Text weight={700}>{props.title || "ST LAB"}</Text>
			</Group>
		</Group>
	</Card>
}
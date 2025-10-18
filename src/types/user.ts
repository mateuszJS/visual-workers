export type User = {
	id: number
	name?: string
	photo?: string
	email: string
	created_at: Date
	language?: string
	country?: string
	browser?: string
	device_type?: string
	device_model?: string
	browser_engine?: string
	os?: string
	is_bot: boolean
	login_method: string
	oidc_google_id?: string
	last_login: Date
}

export type UserBasicInfo = Pick<User, 'id' | 'email' | 'name' | 'photo'>

// export function sanitize(data: User): UserBasicInfo {
// 	return {
// 		id: data.id,
// 		email: data.email,
// 		name: data.name,
// 		photo: data.photo,
// 	}
// }

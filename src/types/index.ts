import type { HttpCode } from '@/types/const_http'
export type u<T> = T | undefined
export type nu = u<number>
export type su = u<string>
export type P<T> = Promise<T>
export type PV = P<void>
export type PB = P<boolean>

export type ConstT<T> = T[keyof T]

export type TAuthObject = { password: string } & Partial<TToken>

export type TSignin = TAuthObject & {
	email: string
	remember: boolean
}

export type TPasswordChange = Partial<TToken> & Record<'current_password' | 'new_password', string> & { remove_sessions: boolean }

export type TPasswordPatch = Record<'resetId' | 'password', string> & { token?: string }

export type TRegisterUser = Record<'email' | 'full_name' | 'invite' | 'password', string>

export const TPerson = {
	JACK: 'Jack',
	DAVE: 'Dave',
} as const

export type TPersonVal = (typeof TPerson)[keyof typeof TPerson]

export type TTFASetupPatch = { always_required: boolean } & Partial<TAuthObject>

export type TAdminPhoto = {
	file_name_original: string | null
	file_name_converted: string | null
	size_in_bytes_converted: number | null
	size_in_bytes_original: number | null
	person: string | null
	meal_date: string | null
}

export type TSendEmail = Record<'title' | 'line_one', string> & Partial<Record<'line_two' | 'button_text' | 'link', string>> & { emails: Array<string> }
export type TUserLimit = { key: string }

type TActivePatch = { active: boolean }
type TAttemptPatch = { attempt: boolean }
type TPasswordResetId = { password_reset_id: number }
type TPasswordReset = { reset: boolean }
type TTfaSecret = { two_fa_secret: boolean }
type TLogLevels = 'debug' | 'error' | 'verbose' | 'warn'

export type TPhoto = Record<'o' | 'c', string>
export type TPhotoLong = Record<'original' | 'converted', string>

export type TUserInfo = {
	timestamp: Date
	login_attempt_number?: number
}
& Record<'full_name' | 'email' | 'user_creation_ip', string>
& Record<'active' | 'admin' | 'two_fa_active', boolean>
& Partial<Record<'password_reset_id' | 'password_reset_creation_ip' | 'login_ip' | 'user_agent_string' | 'reset_string' | 'login_date' | 'password_reset_date', string>>
& Partial<Record<'password_reset_consumed' | 'login_success', boolean>>

export type TAdminPatch = {
	patch: TActivePatch | TAttemptPatch | TPasswordResetId | TPasswordReset | TTfaSecret
	email: string
}

export type TId = { id: string }

export type TCategoryTableDate = {
	category_name: string
	category_id: number
} & Record<'t' | 'd' | 'j', number>

export type TMealPatch = {
	meal: TMealDatePerson
	original_date: string
}

type TBaseMeal = Record<'date' | 'category' | 'description', string> & Record<TMealVariant, boolean> & { person: TPersonVal }

export type TMealDatePerson = TBaseMeal & Record<'photo_original' | 'photo_converted', string | undefined>

export type TSnack = {
	message?: string
	icon?: string
	timeout?: number
	type?: 'success' | 'error' | 'info'
	closable?: boolean
	loading?: boolean
} & Partial<TSnackPosition>

export type TPositions = 'bottom' | 'left' | 'right' | 'top'

export type TSnackPosition = {
	x: u<TPositions>
	y: u<TPositions>
}

export type TToken = { token: string }

export type TMealDelete = {
	person: string
	date: string
	auth: TAuthObject
}

export type TSingleMeal = {
	date: string
	person: TPersonVal
}

export type TServerStats = Record<'rss' | 'virt', string> & Record<'uptime' | 'uptime_app', number>

export type TBackup = Array<Record<'file_name' | 'file_size', string>>

export type TLimit = Array<{
	key: string
	points: number
}>

export type TAllUserInfo = Array<TUserInfo>

export type TAdminSession = Record<'user_agent' | 'ip' | 'login_date' | 'end_date' | 'ulid' | 'current', string>

export type TConfirmFunction = (authentication: TAuthObject) => Promise<void>

export type TInfobarmessage = {
	message: string
	color: 'infobar'
}

export type TCategory = Record<'id' | 'c' | 'n', string>

export type TButtonText = 'confirm' | 'disable' | 'remove' | 'refresh' | 'restart' | 'delete' | 'update'

export type TDialogTitle = 'Remove Backup Codes' | 'Disable Two-Factor Authentication' | 'Confirm' | 'Restart Server' | 'Delete Meal' | 'Update Meal'

export type TMealVariant = 'restaurant' | 'takeaway' | 'vegetarian'

export type TChangePassword = Record<'autocomplete' | 'icon' | 'label' | 'type' | 'appendIcon', string>
  & { model: 'current_password' | 'new_password' }

export type TResetPassword = Record<'autocomplete' | 'icon' | 'label' | 'type' | 'appendIcon', string>
  & { model: 'new_password' }

export type TErrorLog = Record<'error_log_id' | 'message' | 'stack' | 'uuid', string> & {
	timestamp: Date
	level: TLogLevels
	http_code?: number
}
export type TLogs = {
	timestamp: string
	level: string
	fields: Record<string, string>
	target: string
}

export type TFooterProps = {
	itemsPerPageOptions: Array<number>
	itemsPerPageText: string
}

export type TCategoryTotals = Array<{
	variant: TMealVariant
	q: {

		Dave: number
		Jack: number
	}
}>

export type TFilterClick = 'removePhotos' | 'removeDisabled' | 'removeJack' | 'removeDave' | 'reset'
export type TFilterDisabled = 'photoDisabled' | 'personDisabled' | 'original'

type TAxiosStatus = { status: (typeof HttpCode)[keyof typeof HttpCode] }

export type TSigninBody = { response: { twoFABackup: boolean } }
export type TSigninResponse = TSigninBody & TAxiosStatus

export type TAdminAxiosNames = 'backup' | 'limit' | 'email' | 'user' | 'memory' | 'error'
export type TAdminShow = 'showBackup' | 'showLimit' | 'showError' | 'showEmail' | 'showRegisterUsers' | 'showMemory'

export type TDialogData = {
	buttonText: u<TButtonText>
	icon?: string
	message: string
	confirmFunction: TConfirmFunction
	passwordRequired: boolean
	title: u<TDialogTitle>
	timeout?: number
	visible?: boolean
}

export type TPersonFood = {
	meal_description_id: number
	meal_category_id: number
	restaurant?: number | null
	vegetarian?: number | null
	takeaway?: number | null
	photo?: PersonPhoto | null
}

export type c_TPersonFood = {
	// meal_description_id
	m: number
	// category_id
	c: number
	// restaurant
	r?: number | null
	// vegetarian
	v?: number | null
	// takeaway
	t?: number | null
	// photo
	p?: c_PersonPhoto | null
}

export type MealDescriptionMap = Map<number, string>
export type MealCategoryMap = Map<number, string>

export type MealInfo = {
	meal_descriptions: MealDescriptionMap
	meal_categories: MealCategoryMap
	date_meals: Array<DateMeal>
}

export type c_MealInfo = {
	// meal_descriptions
	d: Record<number, string>
	// meal_categories
	c: Record<number, string>
	// date_meals
	m: Array<c_DateMeal>
}

export type DateMeal = {
	date: string
	Dave?: TPersonFood | null
	Jack?: TPersonFood | null
}

export type c_DateMeal = {
	// date
	a: string
	// Dave
	d?: c_TPersonFood | null
	// Jack
	j?: c_TPersonFood | null
}

export type PersonPhoto = {
	original?: string | null
	converted?: string | null
}

export type c_PersonPhoto = {
	// original
	o?: string | null
	// converted
	c?: string | null
}

export type search_by = {
	category_id: number
	end_date: string
	include_dave: boolean
	include_jack: boolean
	include_restaurant: boolean
	include_takeaway: boolean
	include_vegetarian: boolean
	only_photos: boolean
	start_date: string
	term: string
}

export type c_search_by = {
	c?: number
	d?: number
	e?: string
	j?: number
	m?: string
	p?: number
	r?: number
	s?: string
	t?: number
	v?: number
}

export type MealHistoryValue = {
	filtered_meal_descriptions: Map<number, string>
	filtered_meal_categories: Map<number, string>
	filtered_meal_variants: Set<TMealVariant>
	filtered_date_meals: Array<DateMeal>
}

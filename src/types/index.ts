import { HttpCode } from '@/types/enum_http';
export type u<T> = T | undefined
export type nu = u<number>
export type su = u<string>
export type P<T> = Promise<T>
export type PV = P<void>
export type PB = P<boolean>

type Branded<K, T> = K & { __brand: T }

// a number as a string, due to bigint
export type B_lastId = Branded<string, 'last_id'>
export type B_dateString = Branded<string, 'date_string'>

export type TAuthObject = {
	password: string,
	} & Partial<TToken>

export type TSignin = TAuthObject & { email: string, remember: boolean }

export type TPasswordChange = Partial<TToken> & { [ K in 'current_password' | 'new_password']: string }

export type TPasswordPatch = {[K in 'resetId' | 'password']: string } & { token?: string}

export type TRegisterUser = { [ K in 'email' | 'full_name' | 'invite' | 'password'] : string }

export type TPerson = 'Dave' | 'Jack'

export type TTFASetupPatch = { always_required: boolean } & Partial<TAuthObject>

export type TSendEmail = { [ K in 'title' | 'line_one'] : string } & { [ K in 'line_two' | 'button_text' | 'link']? : string } & { emails: Array<string> }
export type TUserLimit = { key: string }

type TActivePatch = { active: boolean}
type TAttemptPatch = { attempt: boolean}
type TPasswordResetId = { password_reset_id: string }
type TReset = { reset: boolean }
type TLogLevels = 'debug' | 'error' | 'verbose' | 'warn'
type TTfaSecret = { two_fa_secret: boolean }

export type TPhoto = { [K in 'o' |'c']: string }

export type TUserInfo =
	{ timestamp: Date, login_attempt_number?:number }
	& { [ K in 'full_name' | 'email' | 'user_creation_ip'] : string }
	& { [ K in 'active' | 'admin' |'two_fa_active']: boolean }
	& { [ K in 'password_reset_id' | 'password_reset_creation_ip' |'login_ip' | 'user_agent_string' |'reset_string' |'login_date' | 'password_reset_date']?: string }
	& { [ K in 'password_reset_consumed' | 'login_success' ]?: boolean }

export type TAdminPatch = {
	patch: TActivePatch | TAttemptPatch | TPasswordResetId | TReset | TTfaSecret
	email: string
}

export type TId = { id: string }

export type TBaseMealVue =
	{ [ K in 'md' | 'c']: string } &
	{ [ K in 'v'|'t'|'r']?: boolean } &
	{ p?: TPhoto }

export type TCategoryTableDate = { category_name: string } & { [ K in 't' | 'd' | 'j']: number }

export type TMealPatch = {
	meal: TMealDatePerson
	originalDate: string
}

type TBaseMeal = { [ K in 'date' | 'category' | 'description'] : string } & { [K in 'restaurant' | 'takeaway' | 'vegetarian']: boolean } & { person: TPerson }

export type TInsertMeal = TBaseMeal & { [K in 'photoNameOriginal' | 'photoNameConverted']: string|null }

export type TMealDatePerson = TInsertMeal & { [K in 'id' | 'meal_photo_id']: string }

export type TPiniaDateMeal = { da: B_dateString } & { [K in 'D' | 'J' ]?: TBaseMealVue }

export type TSnack = {
	message?: string,
	icon?: string
	timeout?: number,
	type? : 'success' | 'error'| 'info'
	closable?: boolean,
	loading?: boolean
} & Partial<TSnackPosition>

export type TPositions = 'bottom' | 'left' | 'right' | 'top'

export type TSnackPosition = {x: u<TPositions>, y: u<TPositions> }

export type TToken = { token: string }

export type TMealDelete = { person: string, date: string, auth: TAuthObject }

export type TSingleMeal = { date: string, person: TPerson}

export type TServerStats = { [K in 'rss' | 'virt']: string } & {[K in 'uptime' | 'uptime_app' ]: number }

export type TBackup = Array<{ [K in 'filename' | 'filesize' ]: string }>

export type TLimit = Array<{ key: string, points: number }>

export type TAllUserInfo = Array<TUserInfo>

export type TAdminSession = { [ K in 'user_agent'| 'ip' | 'login_date'| 'end_date'| 'uuid' ]: string }

export type TConfirmFunction = (authentication : TAuthObject) => Promise<void>

export type TInfobarmessage = { message: string, color: 'infobar'}

export type TMeal = {
	md: string,
	c: number,
	p?: { [ K in 'o' | 'c']: string }
	& { [ K in 'v' | 'v' | 't']?: boolean }
}

export type TIndexDBDateMeal = { da: B_dateString } & { [ K in 'D' | 'J' ]: TMeal }

export type TCategory= { [ K in 'id' | 'c' | 'n' ]: string }

export type TLastId = B_lastId

export type TInsert = { data: TLastId, table_name: 'last_id' } | { data: Array<TCategory>, table_name: 'category' } | { data: Array<TIndexDBDateMeal>, table_name: 'dateMeal' }

export type TButtonText = 'confirm' | 'disable' | 'remove' | 'refresh' | 'restart' | 'delete' | 'update'

export type TDialogTitle = 'Remove Backup Codes' | 'Disable Two-Factor Authentication' | 'Confirm' | 'Restart Server' | 'Delete Meal' | 'Update Meal'

export type TMealType = 'restaurant' | 'takeout' | 'vegetarian'

export type TChangePassword =
	{ [ K in 'autocomplete' | 'icon' | 'label' | 'type' | 'appendIcon']: string }
	& {	model : 'current_password' | 'new_password' }

export type TResetPassword =
	{ [ K in 'autocomplete' | 'icon' | 'label' | 'type' | 'appendIcon']: string }
	& {	model : 'new_password' }

export type TErrorLog = { [ K in 'error_log_id' | 'message' | 'stack' | 'uuid'] : string } & { timestamp: Date, level: TLogLevels, http_code?: number}
export type TLogs = { timestamp: string, level: string, fields: {[key: string]: string}, target: string }

export type TFooterProps = {
	itemsPerPageOptions: Array<number>,
	itemsPerPageText: string
};

export type TCategoryTotals = Array<{
	type: TMealType,
	D: number,
	J: number

}>

export type TFilterClick = 'removePhotos' | 'removeDisabled' | 'removeJack' | 'removeDave' | 'reset'
export type TFilterDisabled = 'photoDisabled' | 'personDisabled' |'original'

export type THeader = Array<{
	align: 'left' | 'center' | 'right',
	class: string
	sortable: boolean,
	text: 'Date' | TPerson
	value: string,
	width: string
}>

export type TDialogTextField = Array<{
		autocomplete: string,
		icon: string,
		label: string,
		model: 'password',
		type: string,
		appendIcon: su
	}>

type TAxiosStatus = { status: HttpCode }

export type TSigninBody = { response: { twoFABackup: boolean }}
export type TSigninResponse = TSigninBody & TAxiosStatus

export type TAdminAxiosNames = 'backup' | 'limit' | 'email' | 'user' | 'memory' | 'error'
export type TAdminShow = 'showBackup' | 'showLimit' | 'showError'| 'showEmail' | 'showRegisterUsers' | 'showMemory'

export type TDialogData = {
	buttonText: u<TButtonText>;
	icon?: string;
	message: string;
	confirmFunction: TConfirmFunction;
	passwordRequired: boolean;
	title: u<TDialogTitle>;
	timeout?: number;
	visible?: boolean;

}
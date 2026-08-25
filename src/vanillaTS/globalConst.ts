import { mdiAccountPlus, mdiFood, mdiLogin } from '@mdi/js'
import { FrontEndNames, FrontEndRoutes } from '@/types/const_routes'

export const genesisDate = Date.UTC(2015, 4, 9, 18)
export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const registerLinks = [
	{
		icon: mdiFood,
		text: FrontEndNames.MEALS,
		route: FrontEndRoutes.MEALS,
	},
	{
		icon: mdiAccountPlus,
		text: FrontEndNames.REGISTER,
		route: FrontEndRoutes.REGISTER,
	},
	{
		icon: mdiLogin,
		text: FrontEndNames.SIGNIN,
		route: FrontEndRoutes.SIGNIN,
	},
]

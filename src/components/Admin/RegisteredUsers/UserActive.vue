<template>
	<v-row align='center' class='ma-0 pa-0' justify='start'>
		<v-col class='ma-0 pa-0' cols='auto'>
			<v-switch
				v-model='newActive'
				class='ma-0 pa-0 mb-n6'
				:color='newActive ? "mealtype" : ""'
				:disabled='disabled || readOnly'
				:readonly='readOnly'
			/>
		</v-col>
	</v-row>
	<v-expand-x-transition>
		<v-row align='center' class='ma-0 pa-0' justify='start'>
			<v-col v-if='showSave' class='ma-0 pa-0 heartbeat' cols='auto'>
				<v-btn
					class='ma-0 pa-0'
					fab
					size='small'
					variant='text'
					@click='save'
				>
					<v-icon color='secondary' :icon='mdiContentSave' size='small' />
				</v-btn>
			</v-col>
		</v-row>
	</v-expand-x-transition>
</template>

<script setup lang='ts'>
import type { PV } from '@/types'
import { mdiContentSave } from '@mdi/js'
import { axios_admin } from '@/services/axios'

const disabled = computed((): boolean => props.removeOnly && !props.active ? true : false)
const showSave = computed((): boolean => props.removeOnly ? !newActive.value && newActive.value !== props.active : newActive.value !== props.active)
const newActive = ref(false as boolean)

async function save (): PV {
	if (props.patchName) {
		switch (props.patchName) {
			case 'active': {
				await axios_admin.user_patch({
					patch: { active: newActive.value },
					email: props.email,
				})
				break
			}

			case 'two_fa_secret': {
				await axios_admin.user_patch({
					patch: { two_fa_secret: newActive.value },
					email: props.email,
				})
				break
			}
		}
		await axios_admin.user_get()
	}
}

onBeforeMount(() => {
	newActive.value = props.active
})

const props = withDefaults(defineProps<{
	active?: boolean
	email: string
	removeOnly?: boolean
	patchName?: 'active' | 'two_fa_secret'
	readOnly?: boolean
}>(), {
	removeOnly: false,
	readOnly: false,
})

</script>

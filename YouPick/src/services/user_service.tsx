import { useQuery, useMutation, useQueryClient } from 'react-query'
import { db, useCurrentUser } from 'services/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface User {
    name: string
    friend_ids: string[]
}

export const useCurrentUserDetails = () => {
    const authUser = useCurrentUser()

    const _get = async () => {
        if (!authUser) {
            return null
        }
        const ref = doc(db, 'users/' + authUser.uid)
        const userDetailsLazy = await getDoc(ref)
        const userDetails = userDetailsLazy.data() as User
        return userDetails
    }
    const query = useQuery(['user', 'self'], _get, { enabled: !!authUser })
    return query
}

export const useUpdateCurrentUser = () => {
    const authUser = useCurrentUser()
    const _post = async (userPatch: Partial<User>) => {
        if (!authUser) {
            return null
        }
        const updatedUser = { ...user, ...userPatch }
        const ref = doc(db, 'users/' + authUser.uid)
        await setDoc(ref, updatedUser)
        return updatedUser
    }
    const { data: user } = useCurrentUserDetails()
    const queryClient = useQueryClient()
    const mutation = useMutation((patch: Partial<User>) => _post(patch), {
        onMutate: async () => {
            await queryClient.cancelQueries(['user', 'self'])
        },
        onSettled: () => {
            queryClient.invalidateQueries(['user', 'self'])
        },
    })
    return mutation
}

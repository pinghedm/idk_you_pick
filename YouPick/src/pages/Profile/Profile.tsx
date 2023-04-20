import React, { useState } from 'react'
import { useCurrentUserDetails, useUpdateCurrentUser } from 'services/user_service'
import { Input, Button, Spin } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
export interface ProfileProps {}

const Profile = ({}: ProfileProps) => {
    const { data: currentUser, status } = useCurrentUserDetails()
    const updateUserMutation = useUpdateCurrentUser()

    const [newName, setNewName] = useState<string | undefined>(undefined)
    if (status === 'loading') {
        return <Spin />
    }
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                    width: '500px',
                }}
            >
                <Input
                    placeholder="Name"
                    onChange={e => {
                        setNewName(e.target.value)
                    }}
                    defaultValue={currentUser?.name}
                    onPressEnter={e => {
                        if (newName && newName !== currentUser?.name) {
                            updateUserMutation.mutate({ name: newName.trim() })
                        }
                    }}
                />
                <Button
                    icon={<CheckOutlined />}
                    onClick={() => {
                        if (newName !== undefined) {
                            updateUserMutation.mutate({ name: newName.trim() })
                        }
                    }}
                    disabled={newName === currentUser?.name}
                />
            </div>
        </div>
    )
}

export default Profile

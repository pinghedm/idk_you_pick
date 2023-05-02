import React, { useState, useEffect } from 'react'
import { useCurrentUserDetails, useUpdateCurrentUser } from 'services/user_service'
import { Input, Button, Spin } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
export interface ProfileProps {}

const Profile = ({}: ProfileProps) => {
    const { data: currentUser, status } = useCurrentUserDetails()
    const updateUserMutation = useUpdateCurrentUser()

    const [newName, setNewName] = useState<string | undefined>(currentUser?.name)
    useEffect(() => {
        if (status !== 'loading' && currentUser?.name) {
            setNewName(currentUser.name)
        }
    }, [currentUser, status])
    if (status !== 'success') {
        return <Spin />
    }
    return (
        <div style={{ width: '100%', height: '100%', padding: '15px' }}>
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
                    value={newName}
                    onPressEnter={e => {
                        if (newName && newName !== currentUser?.name) {
                            updateUserMutation.mutate({ name: newName.trim() })
                        }
                    }}
                />
                <Button
                    icon={<CheckOutlined />}
                    onClick={() => {
                        if (newName && newName !== currentUser?.name) {
                            updateUserMutation.mutate({ name: newName.trim() })
                        }
                    }}
                    disabled={!newName || newName === currentUser?.name}
                />
            </div>
        </div>
    )
}

export default Profile

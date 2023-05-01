import React, { useState } from 'react'
import { Typography, Form, Input, Button, Card, Alert } from 'antd'
import { loginUser } from 'services/firebase'

export interface LoginProps {}

const Login = ({}: LoginProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleFormSubmit = async () => {
        setError('')
        const err = await loginUser(email, password)
        if (err) {
            setError(err.message)
        }
    }
    return (
        <div style={{ width: '100vw' }}>
            <Typography.Title level={3}>You Pick</Typography.Title>
            <Card
                title="Login to your account"
                style={{ width: '50%', maxWidth: '400px', margin: 'auto', marginTop: '20%' }}
            >
                {error ? (
                    <Alert type="error" message={error} style={{ marginBottom: '10px' }} />
                ) : null}
                <Form layout="vertical">
                    <Form.Item label="E-mail" name="email">
                        <Input
                            type="email"
                            autoFocus
                            placeholder="Email Address"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value)
                            }}
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item label="Password" name="password">
                        <Input.Password
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onPressEnter={() =>
                                email.length && password.length ? handleFormSubmit() : null
                            }
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" block size="large" onClick={handleFormSubmit}>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login

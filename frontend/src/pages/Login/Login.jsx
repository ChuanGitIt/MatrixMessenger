import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { loadPrivateKey } from '../crypto/crypto';
import { getUserByUsername } from '../../api/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1: verify credentials with backend → get id + username
            const resonse = await login(username, password);
            if(!resonse.ok){
                console.log(resonse.body);
                throw new Error('Invalid credentials');
            }

            const user = await getUserByUsername(username);
            // Step 2: persist session
            localStorage.setItem('userId', user.id);
            localStorage.setItem('username', user.username);

            // Step 3: warn if private key is missing (e.g. different device)
            // user can still log in but won't be able to decrypt messages
            const privateKey = await loadPrivateKey(user.id);
            if (!privateKey) {
                setError('Warning: private key not found on this device. You will not be able to decrypt messages.');
                setLoading(false);
                return;
            }
            
            //navigate('/home');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>No account? <a href="/register">Register</a></p>
        </div>
    );
}

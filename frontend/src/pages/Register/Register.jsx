import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {register , login, getUserByUsername } from '../../api/api'
import {
    generateRSAKeyPair,
    generateX509Certificate,
    storePrivateKey,
    derToPem,
} from '../../crypto/crypto'

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    //const [confirmPassword, setConfirmPassword] = useState('');
    const [userID, setUserID] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            // 1 generate RSA key pair
            const keyPair = await generateRSAKeyPair();

            // 2 create self-signed X.509 certificate using userID
            const certificate = await generateX509Certificate(keyPair, username);

            // 3 export public key as SPKI PEM format for server storage
            const spkiBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
            const publicKeyPem = derToPem(spkiBuffer, 'PUBLIC KEY');

            // 4 send to backend
            await register(username, password, publicKeyPem,certificate);

            // 5 auto-login after successful registration
            await login(username, password);

            // 6 store private key securely in IndexedDB
            const User = await getUserByUsername(username);
            await storePrivateKey(User.id, keyPair.privateKey);

            // persist session 
            localStorage.setItem('userId', User.id);
            localStorage.setItem('username', username);

            // redirect to home page
            navigate('/groups');

        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
}
}
    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Generating keys...' : 'Register'}
                </button>
            </form>
            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    )
}



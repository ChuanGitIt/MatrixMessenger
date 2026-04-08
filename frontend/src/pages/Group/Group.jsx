import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGroups, getAllUsers } from '../api/api';

export default function Groups() {
    const [groups, setGroups]   = useState([]);
    const [users, setUsers]     = useState([]);
    const [error, setError]     = useState('');
    const navigate = useNavigate();

    const userId   = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    useEffect(() => {
        async function fetchData() {
            try {
                const [groupData, userData] = await Promise.all([
                    getAllGroups(),
                    getAllUsers()
                ]);
                setGroups(groupData);
                setUsers(userData);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchData();
    }, []);

    function getUsernameById(id) {
        const user = users.find(u => u.id === id);
        return user ? user.username : id;
    }

    function isMember(group) {
        return group.memberIds.includes(userId);
    }

    return (
        <div>
            <h2>Groups</h2>
            <p>Logged in as: <strong>{username}</strong></p>
            <button onClick={() => navigate('/posts')}>View All Posts</button>
            <button onClick={() => {
                localStorage.clear();
                navigate('/login');
            }}>Logout</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {groups.map(group => (
                <div key={group.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{group.name}</h3>
                    <p>
                        Members: {group.memberIds.map(id => getUsernameById(id)).join(', ')}
                    </p>
                    <p>
                        Status: {isMember(group)
                            ? '✅ You are a member — you can decrypt posts'
                            : '🔒 You are not a member'}
                    </p>
                </div>
            ))}
        </div>
    );
}

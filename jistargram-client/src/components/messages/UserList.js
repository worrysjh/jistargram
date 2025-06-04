import { useEffect, useState } from "react";
import { authFetch } from "../../utils/authFetch";

export default function UserList({ onSelectUser, currentUser }) {
  const [users, setUsers] = useState([]);

  console.log("접속 유저 :", JSON.stringify(currentUser, null, 2));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authFetch(
          `${process.env.REACT_APP_API_URL}/users/all`
        );
        if (res && res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          console.error("유저 목록 불러오기 실패", res.status);
        }
      } catch (err) {
        console.error("네트워크 오류", err);
      }
    };

    fetchUsers();
  }, []);

  if (!currentUser) {
    return <div className="user-list">로딩 중...</div>;
  }

  return (
    <div className="user-list">
      <h3>Users</h3>
      <ul>
        {users
          .filter((user) => user.user_id !== currentUser.user_id)
          .map((user) => (
            <li key={user.user_id} onClick={() => onSelectUser(user)}>
              {user.user_name}
            </li>
          ))}
      </ul>
    </div>
  );
}

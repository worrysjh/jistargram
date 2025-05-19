import { authFetch } from "../../utils/authFetch";

export async function register({
  user_name,
  nick_name,
  email,
  passwd,
  birthdate,
  gender,
}) {
  const response = await authFetch("http://localhost:4000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name,
      nick_name,
      email,
      passwd,
      birthdate,
      gender,
    }),
  });
  const data = await response.json();
  return { response, data };
}

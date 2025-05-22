import { authFetch } from "../../utils/authFetch";

export async function login(user_name, passwd) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
    method: "POST",
    credentials: "include", // refresh_token 쿠키를 위한 설정
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_name, passwd }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = { message: "응답 파싱 실패" };
  }

  return { response, data };
}

export async function register({
  user_name,
  nick_name,
  email,
  passwd,
  birthdate,
  gender,
}) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/register`,
    {
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
    }
  );
  const data = await response.json();
  return { response, data };
}

import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileChangePage.css";

function ProfileChangePage() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const response = await authFetch(
        "http://localhost:4000/users/getMyProfile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        navigate
      );

      const data = await response.json();
      setProfile(data);
    };

    fetchProfile();
  }, [navigate]);

  if (!profile) return <p>로딩 중...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await authFetch(
      "http://localhost:4000/users/updateProfile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ biography: bio }),
      },
      navigate
    );

    if (response && response.ok) {
      alert("프로필이 수정되었습니다.");
    } else {
      alert("수정 실패: 서버 오류 또는 권한 없음");
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <img
          src={profile.profile_img || "/default-profile.png"}
          alt="프로필사진"
          className="profile-edit-picture"
        />
        <div>
          <h2 className="profile-edit-username">{profile.userid}</h2>
          <p>{profile.username}</p>
          <button className="photo-change-btn">사진 변경</button>
        </div>
      </div>

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <label>소개</label>
        <textarea
          value={profile.biography}
          onChange={(e) => setBio(e.target.value)}
          placeholder="작성된 자기소개가 없습니다."
          maxLength={149}
        ></textarea>
        <small>{bio.length}/150</small>

        <button type="submit" className="submit-btn">
          제출
        </button>
      </form>
    </div>
  );
}

export default ProfileChangePage;

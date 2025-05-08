import React, { useState, useEffect } from "react";
import "../styles/ProfilePage.css";
import { authFetch } from "../utils/authFetch";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const response = await authFetch(
        "http://localhost:4000/users/getMyProfile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) return <p>로딩 중...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img
            src={profile.profile_img || "/default-profile.png"}
            alt="프로필사진"
          />
        </div>
        <div className="profile-info">
          <div className="profile-top">
            <h2 className="profile-username">{profile.username}</h2>
            <button className="profile-button">프로필 편집</button>
            <span className="settings-icon">설정</span>
          </div>
          <ul className="profile-stats">
            <li>
              게시물 <b>0</b>
            </li>
            <li>
              팔로워 <b>5</b>
            </li>
            <li>
              팔로우 <b>6</b>
            </li>
          </ul>
          <div className="profile-details">
            <strong>{profile.username}</strong>
            <p>{profile.birthdate}</p>
            <p>{profile.biography || "작성된 자기소개가 없습니다."}</p>
          </div>
        </div>
      </div>
      <hr />
      <div className="profile-tabs">
        <span>게시물</span>
      </div>
      <div className="profile-posts"></div>
    </div>
  );
}

export default ProfilePage;

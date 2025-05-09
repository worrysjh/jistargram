DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS follows;

--사용자 테이블
CREATE TABLE  users (
    userid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    biography TEXT,
    profile_img VARCHAR(255);
);

--게시글 테이블
CREATE TABLE posts (
    postid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(userid),
    content TEXT,
    media_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

--좋아요 테이블
--수정 필요
CREATE TABLE likes (
    postid INTEGER NOT NULL,
    userid VARCHAR(255) NOT NULL,
    liked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (postid, userid),
    FOREIGN KEY (postid) REFERENCES posts(postid) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
);

--댓글 테이블
--수정 필요
CREATE TABLE comments (
    commentid SERIAL PRIMARY KEY,
    postid INTEGER NOT NULL,
    userid VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY(postid) REFERENCES posts(postid) ON DELETE CASCADE
);

--팔로잉 테이블
--수정 필요
CREATE TABLE follows (
    followerid VARCHAR(255) NOT NULL,
    followingid VARCHAR(255) NOT NULL,
    followed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (followerid, followingid),
    FOREIGN KEY (followerid) REFERENCES users(userid) ON DELETE CASCADE,
    FOREIGN KEY (followingid) REFERENCES users(userid) ON DELETE CASCADE
);
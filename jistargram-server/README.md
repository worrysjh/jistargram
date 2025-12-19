# Jistargram Server - 채팅 기능 구현

## 개요
Jistargram 서버는 실시간 채팅 기능을 제공하는 Instagram 스타일의 소셜 미디어 백엔드입니다. Socket.io와 Redis를 활용하여 확장 가능한 실시간 메시징 시스템을 구현했습니다.

## 구현 내용
| 구현여부 | 구분               | 기능명             | 설명                                           | 비고                                       |
| :------- | :----------------- | :----------------- | :--------------------------------------------- | :----------------------------------------- |
| ✅       | 채팅 기능          | 채팅방 자동 생성   | 첫 메시지 전송 시 UUID v5 기반 채팅방 자동 생성 |       |
| ✅       | 채팅 기능          | 채팅방 입장/퇴장   | Socket.io room 기반 입장/퇴장 관리             | join_room, leave_room 이벤트               |
| ✅       | 채팅 기능          | Redis Pub/Sub      | Redis Adapter를 통한 멀티 서버 메시지 동기화   | 수평 확장 가능                             |
| ✅       | 채팅 기능          | 대화 가능 목록 조회 | 팔로우 사용자 + 메시지 수신한 미팔로우 사용자  | expMessageRoomList API                     |
| ❌      | 메시지          | 안읽은 메시지           | 안읽은 메시지에 대하여 선별 및 '1' 등 UI 추가    |   |
| ❌      | 메시지          | 메시지 일별/시간별 구분     | 메시지별 송/수신 날짜 UI 추가           |   |
| ❌      | 메시지          | 메시지 검색      | 채팅방 내 메시지 검색 기능 제공         |   |
| ❌      | 사용자          | 사용자 마지막 활동 시간 출력      | 사용자 마지막 Jistargram 접속 시간 출력           |   |
| ❌      | 채팅방          | 마지막 채팅 시간 출력      | 채팅방 내 마지막 메시지의 날짜 기반 몇일/주전인지 UI 추가   |   |
| ❌      | 채팅방          | 최신 메시지 기반 채팅방 정렬  | 최신 메시지 수신시 채팅방 최상단으로 재정렬 기능 추가    |   |
| ❌      | 채팅방          | 안읽은 메시지 카운팅     | 안읽은 메시지 수량을 파악 및 채팅방에 '10' 등 UI 추가   |   |
| ❌      | 채팅방          | 채팅방 검색           | 사용자ID, nick_name 등을 기반으로 필터링 기능 제공   |   |
| ❌      | 알림            | 신규 채팅 수신 알림           | 신규 메시지 알림 기능 및 알림끄기 기능    | 후순위  |


## 동작 화면

- **채팅**
    ![동작화면]()


## 시나리오

- **Flow - Client-DB관점**
    ![흐름도](/docs/다이어그램/채팅흐름도.png)



## 기술 스택
- **Node.js & Express**: REST API 서버
- **Socket.io**: 실시간 양방향 통신
- **Redis**: Socket.io 어댑터 및 메시지 브로커
- **PostgreSQL**: 메시지 영구 저장
- **UUID v5**: 결정론적 채팅방 ID 생성

## 채팅 시스템 아키텍처

### 1. 실시간 통신 구조
```
Client (Socket.io Client)
    ↕ WebSocket
Server (Socket.io Server with Redis Adapter)
    ↕ Redis Pub/Sub
Database (PostgreSQL)
```

### 2. Redis Adapter 사용
- **멀티 서버 환경 지원**: 여러 서버 인스턴스 간 메시지 동기화
- **Pub/Sub 패턴**: Redis를 통해 모든 서버 인스턴스에 이벤트 전파
- **수평 확장 가능**: 로드 밸런서 뒤에서 여러 서버 운영 가능

```javascript
// index.js - Redis Adapter 설정
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
  });
```

## API 엔드포인트

### 메시지 관련 API

#### 1. 대화 가능한 사용자 목록 조회
```
GET /messages/expMessageRoomList
Authorization: Bearer Token
```
**응답**: 팔로우 중인 사용자 + 수신받은 메시지가 있는 미팔로우 사용자 목록

#### 2. 채팅방 존재 여부 확인
```
GET /messages/checkMessageRoom/:user_id
Authorization: Bearer Token
```
**응답**: 
```json
{
  "exists": true,
  "roomId": "uuid-v5-generated-id"
}
```

#### 3. 메시지 이력 조회
```
GET /messages/:user_id
Authorization: Bearer Token
```
**응답**: 해당 사용자와의 모든 메시지 목록 (시간순 정렬)

#### 4. 메시지 전송 (HTTP)
```
POST /messages/sendMessage
Authorization: Bearer Token
Content-Type: application/json

{
  "sender_id": 1,
  "receiver_id": 2,
  "content": "안녕하세요",
  "content_type": "text"
}
```
**응답**:
```json
{
  "success": true,
  "room_id": "uuid-v5-generated-id",
  "message": {...}
}
```

## Socket.io 이벤트

### 클라이언트 → 서버

#### 1. join_room
```javascript
socket.emit('join_room', room_id);
```
특정 채팅방에 입장

#### 2. leave_room
```javascript
socket.emit('leave_room', room_id);
```
특정 채팅방에서 퇴장

#### 3. send_message
```javascript
socket.emit('send_message', {
  roomId: 'uuid-room-id',
  sender_id: 1,
  receiver_id: 2,
  content: '메시지 내용',
  timestamp: new Date().toISOString()
});
```
실시간 메시지 전송

### 서버 → 클라이언트

#### receive_message
```javascript
socket.on('receive_message', (message) => {
  // 메시지 수신 처리
});
```
해당 방에 있는 모든 클라이언트에게 메시지 브로드캐스트

## 클라이언트-서버 메시지 흐름

### 메시지 전송 시나리오

```
1. 사용자가 메시지 입력 후 전송 버튼 클릭

2. Client: POST /messages/sendMessage (HTTP)
   - 메시지를 DB에 영구 저장
   - 채팅방이 없으면 생성
   - room_id 반환

3. Client: socket.emit('send_message', messageData)
   - 실시간 전송을 위한 Socket 이벤트 발행

4. Server: Redis Pub/Sub을 통해 모든 서버 인스턴스에 전파
   - io.to(room_id).emit('receive_message', message)

5. Client: socket.on('receive_message', callback)
   - 해당 방에 있는 모든 클라이언트가 메시지 수신
   - UI 업데이트
```

### 채팅방 입장 시나리오

```
1. 사용자가 대화 상대 선택

2. Client: GET /messages/checkMessageRoom/:user_id
   - 채팅방 존재 여부 확인
   - room_id 획득

3. Client: GET /messages/:user_id
   - 기존 메시지 이력 로드

4. Client: socket.emit('join_room', room_id)
   - Socket.io 방에 입장
   - 이후 해당 방의 실시간 메시지 수신 가능

5. 컴포넌트 언마운트 시
   Client: socket.emit('leave_room', room_id)
```

## 채팅방 ID 생성 로직

### UUID v5를 사용한 결정론적 생성
```javascript
// messageController.js
function generateRoomId(userId1, userId2) {
  const JISTARGRAM_NAMESPACE = process.env.JISTARGRAM_NAMESPACE;
  const sortedIds = [userId1, userId2].sort();
  const combinedString = sortedIds.join("_");
  
  const roomId = uuidv5(combinedString, JISTARGRAM_NAMESPACE);
  return roomId;
}
```

**특징**:
- 두 사용자 ID의 조합으로 항상 동일한 room_id 생성
- 순서에 관계없이 동일한 결과 (A→B, B→A 모두 같은 방)
- 네임스페이스로 충돌 방지

## 데이터베이스 스키마

### message_rooms
```sql
CREATE TABLE message_rooms (
    room_id UUID PRIMARY KEY,
    last_message_id SERIAL,
    last_activity_at timestamptz default now(),
    created_at timestamptz default now()
);
```

### message_participant
```sql
CREATE TABLE message_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID references message_room(room_id),
    user_id UUID references users(user_id),
    joined_at timestamptz default now(),
    left_at timestamptz,
    last_read_message_id SERIAL
);
```

### messages
```sql
CREATE TABLE messages (
	message_id SERIAL primary key,
    room_id UUID references message_room(room_id),
	sender_id UUID references users(user_id),
	receiver_id UUID references users(user_id),
	content TEXT not null,
    content_type VARCHAR(50) default 'text' not null,
	timestamp timestamptz default now()
);
```

## 주요 서비스 함수

### message.service.js

- **getExpMessageRoomList(user_id)**: 팔로우 목록 + 수신받은 미팔로우 메시지 방 목록 조회
- **createMessageRoom(room_id)**: 새 채팅방 생성
- **joinMessageRoom(room_id, user_id, target_user_id)**: 채팅방 참가자 등록
- **checkMessageRoom(room_id)**: 채팅방 존재 여부 확인
- **getMessageContent(room_id)**: 채팅방 메시지 이력 조회
- **saveMessage(room_id, sender_id, receiver_id, content, content_type)**: 메시지 저장

import React, { useState, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '../../../layout/BasicLayout';
import RoundedBottomInput from '../../../components/common/Input/RoundedBottomInput/RoundedBottomInput';
import BottomSheet from '../../../components/common/BottomSheet/BottomSheet';
import ListModal from '../../../components/common/BottomSheet/ListModal';
import Confirm from '../../../components/common/Confirm/Confirm';
import {
  ChatRoomWrapper,
  ChatRoomContainer,
  ChatBox,
  ImgWrapper,
  ChatText,
  ChatTime,
  Message,
} from './ChatRoomPageStyle';

export default function ChatRoomPage() {
  const location = useLocation();

  const [isShow, setIsShow] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isShowConfirm, setIsShowConfirm] = useState(false);

  const [type, setType] = useState('text');
  const [message, setMessage] = useState('');
  const [arrMessages, setarrMessages] = useState([]);

  const [isUser, setIsUser] = useState(false);

  const bottomRef = useRef(null);
  const [scrollDown, setScrollDown] = useState(false);

  const navigate = useNavigate();

  // 시간, 분 정보 추출
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  ////// header //////
  // 모달창 열기
  const handleClickRightButton = () => {
    setModalType('chat');
    setIsShow(true);
  };
  const handleClickModalOpen = () => {
    setIsShow((prev) => !prev);
  };
  // 채팅방 나가기를 누르면 ChatListPage로 이동
  const handleClickListItem = () => {
    navigate('/chat');
  };

  ////// bottom input //////
  // input 클릭하면 실행
  const handleInputClick = (e) => {
    if (e.target.tagName.toLowerCase() === 'img') {
      // 이미지 버튼을 클릭하면 confirm창이 뜨도록
      setIsShowConfirm(true);
    } else {
      setIsShowConfirm(false);
    }
  };

  // 파일 업로드 버튼을 눌렀을 때
  const handleClickConfirm = (e) => {
    setType('file');
    // confirm창 닫기
    setIsShowConfirm(false);
  };

  const handleMsgChange = (e) => {
    if (type === 'text') {
      const value = e.target.value;
      setMessage(value);
    } else if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setIsUser(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          // 파일의 이미지 URL
          const fileUrl = reader.result;
          const newImageMsg = {
            content: fileUrl,
            isUser: true,
            timestamp: new Date(),
            type: 'image',
          };

          const newMsgArray = [...arrMessages, newImageMsg];

          if (arrMessages.length < newMsgArray.length) {
            setScrollDown(true);
          }
          setarrMessages(newMsgArray);
        };

        // 파일을 읽어서 이미지 URL을 생성
        reader.readAsDataURL(file);
        setType('text');
      }
    }
  };

  // Submit되면 입력한 메시지들을 처리
  const handleShowMsg = (e) => {
    e.preventDefault();
    setIsUser(true);

    // 빈 메시지가 아니면
    if (message.trim() !== '') {
      const newMessage = {
        content: message,
        isUser: true,
        timestamp: new Date(),
        type: 'text',
      };

      const newMsgArray = [...arrMessages, newMessage];

      if (arrMessages.length < newMsgArray.length) {
        setScrollDown(true);
      }
      setarrMessages(newMsgArray);
    }

    // input value값 초기화
    setMessage('');
  };

  //scroll아래로 이동하기
  useLayoutEffect(() => {
    if (scrollDown) {
      bottomRef.current.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
      setScrollDown(false);
    }
  }, [scrollDown]);

  return (
    <BasicLayout
      name={'chat'}
      type={'post'}
      title={location.state.username}
      isNonNav={true}
      onClickLeftButton={() => navigate(-1)}
      onClickRightButton={handleClickRightButton}
    >
      {/* 상대 채팅 */}
      <ChatRoomWrapper>
        <ChatRoomContainer ref={bottomRef}>
          {location.state.otherChatArr ? (
            location.state.otherChatArr.map((chat, index) => (
              <ChatBox key={index}>
                <ImgWrapper>
                  <img src={location.state.image} alt='상대 프로필 이미지' />
                </ImgWrapper>
                <ChatText>
                  <p>{chat}</p>
                </ChatText>
                <ChatTime>
                  <span>{`${hours}:${minutes}`}</span>
                </ChatTime>
              </ChatBox>
            ))
          ) : (
            <Message>{location.state.username}님과의 채팅을 시작해보세요!</Message>
          )}

          {/* 내가 보낸 채팅 */}
          {isUser &&
            arrMessages.map((message, index) => (
              <ChatBox isUser={isUser} key={index} type={type}>
                {message.type === 'text' ? (
                  <>
                    {/* 메시지가 텍스트면 */}
                    <ChatText isUser={isUser}>
                      <p>{message.content}</p>
                    </ChatText>
                  </>
                ) : (
                  <>
                    {/* 메시지가 이미지면 */}
                    <img src={message.content} alt='유저 업로드 이미지' />
                  </>
                )}
                <ChatTime isUser={isUser}>
                  <span>{`${message.timestamp.getHours()}:${message.timestamp.getMinutes()}`}</span>
                </ChatTime>
              </ChatBox>
            ))}

          {isShowConfirm && (
            <Confirm
              type='upload'
              object='file'
              setIsShowConfirm={setIsShowConfirm}
              onClick={handleClickConfirm}
            />
          )}
        </ChatRoomContainer>
      </ChatRoomWrapper>
      <RoundedBottomInput
        type={type}
        placeholder={'메시지를 보내세요'}
        value={message}
        onClick={handleInputClick}
        onChange={handleMsgChange}
        onSubmit={handleShowMsg}
        isChat={true}
      />
      {/* 모달 열기 */}
      {isShow && (
        <BottomSheet isShow={isShow} onClick={handleClickModalOpen}>
          <ListModal type={modalType} onClick={handleClickListItem}></ListModal>
        </BottomSheet>
      )}
    </BasicLayout>
  );
}

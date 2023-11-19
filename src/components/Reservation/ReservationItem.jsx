import { useMemo } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import Button from "../Button/Button.jsx";

import PatientIcon from "../../assets/images/role/role_patient.png";
import DoctorIcon from "../../assets/images/role/role_doctor.png";
import TherapistIcon from "../../assets/images/role/role_therapist.png";

import { MdCalendarMonth, MdPerson } from "react-icons/md";
import { DATE_FORMAT, ROLE_LIST, ROLE_TYPE } from "../../librarys/type.js";
import dayjs from "dayjs";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { show } from "../../redux/modalSlice.js";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  height: 110px;
  padding: 0 24px;
  border: 1px solid #bbbbbb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Image = styled.img`
  width: 72px;
  height: 72px;
  background-color: #d9d9d9;
  border-radius: 36px;
  object-fit: contain;
  overflow: hidden;
`;

const Info = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  font-size: 16px;
  font-weight: 400;
`;

const Big = styled.span`
  margin-right: 8px;
  font-size: 22px;
  font-weight: 800;
`;

const Item = styled.div`
  width: ${(props) => props.width || "auto"};
  vertical-align: middle;

  &.user {
    display: none;
  }

  & > svg {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Btn = styled(Button)`
  width: 160px;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
`;

/* 
1. Close  !isOpen && !isDone     아직 열리지 않은 예약
2. Open    isOpen && !isDone     열려서 들어갈 수 있는 예약
3. Done    isOpen &&  isDone     완료된 예약
*/

const buttonStyleList = {
  normal: { type: "primary", text: "입장" },
  complete: { type: "disabled", text: "종료되었습니다" },
  notReady: { type: "disabled", text: "예약 시간이 아닙니다" },
};

const ReservationItem = ({
  id,
  uuid,
  name,
  role,
  date,
  index,
  description,
  summary,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const image = useMemo(() => {
    switch (role) {
      case ROLE_TYPE.DOCTOR:
        return DoctorIcon;
      case ROLE_TYPE.THERAPIST:
        return TherapistIcon;
      default:
        return PatientIcon;
    }
  }, [role]);

  const roleDisplay = useMemo(() => {
    const find = ROLE_LIST.find((item) => item.key === role);

    if (find) return find.value;
    return "환자";
  }, [role]);

  const fullDate = useMemo(
    () => dayjs(date).add(index * 30, "minute"),
    [date, index],
  );

  const time = useMemo(() => dayjs().diff(fullDate, "minute"), [fullDate]);
  const isUser = useMemo(() => classNames({ user: role === "USER" }), [role]);

  const isRoomOpen = time >= -10;
  const isReservationDone = time > 30;

  const buttonStyle = useMemo(() => {
    if (isReservationDone) {
      return buttonStyleList.complete;
    } else if (isRoomOpen) {
      return buttonStyleList.normal;
    } else {
      return buttonStyleList.notReady;
    }
  }, [isRoomOpen, isReservationDone]);

  function onJoinButtonClick() {
    if (isReservationDone || !isRoomOpen) {
      return;
    }

    navigate("/meeting/room/" + uuid);
  }

  function onInfoButtonClick() {
    dispatch(
      show({
        id: "reservation_detail",
        props: {
          reservationId: id,
          chartDetail: null,
          description,
          summary,
        },
      }),
    );
  }

  return (
    <Container>
      <Image src={image} />
      <Info>
        <Item>
          <Big>{name}</Big>님
        </Item>
        <Item width="100px" className={isUser}>
          <MdPerson />
          {roleDisplay}
        </Item>
        <Item>
          <MdCalendarMonth />
          {fullDate.format(DATE_FORMAT)}
        </Item>
      </Info>
      <ButtonContainer>
        <Btn type={buttonStyle.type} onClick={onJoinButtonClick}>
          {buttonStyle.text}
        </Btn>
        <Btn type="info" onClick={onInfoButtonClick}>
          상세 정보
        </Btn>
      </ButtonContainer>
    </Container>
  );
};

ReservationItem.propTypes = {
  id: PropTypes.string,
  uuid: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
  date: PropTypes.string,
  index: PropTypes.number,
  description: PropTypes.string,
  summary: PropTypes.string,
};

ReservationItem.defaultProps = {
  role: "USER",
};

export default ReservationItem;

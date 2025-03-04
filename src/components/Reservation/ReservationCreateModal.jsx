import styled from "styled-components";
import Calendar from "../Calender/Calender.jsx";
import Modal from "../Common/Modal.jsx";
import ModalTitleText from "../Common/ModalTitleText.jsx";
import InputAreaContainer from "../Input/InputAreaContainer.jsx";
import ToggleButton from "../Button/ToggleButton.jsx";
import Button from "../Button/Button.jsx";
import CalenderMonth from "../Calender/CalenderMonth.jsx";
import { ReducerContext } from "../../reducer/context.js";
import { useEffect, useMemo, useReducer, useState } from "react";
import {
  intialReserveCreateState,
  reserveCreateReducer,
} from "../../reducer/meeting-create.js";
import dayjs from "dayjs";
import {
  createReservation,
  getReserveTime,
} from "../../librarys/api/reservation.js";
import { useSelector } from "react-redux";
import { selectId } from "../../redux/userSlice.js";
import { selectProps } from "../../redux/modalSlice.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const Label = styled.p`
  width: 100%;
  &::after {
    content: "*";
    padding-left: 4px;
    color: gray;
    vertical-align: sub;
  }
`;

const InputArea = styled(InputAreaContainer)`
  width: 100%;
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const id = "reservation_create";

function createTimes(start = 0, count = 5) {
  const date = dayjs("2023-01-01T00:00:00+09:00");
  const times = [];
  for (let i = start; i < start + count * 10; i += 10) {
    const deltaTime = date.add(30 * i, "m");
    times.push({
      index: i,
      value: deltaTime.format("HH:mm"),
    });
  }
  return times;
}

export const ReservationCreateModal = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    reserveCreateReducer,
    intialReserveCreateState,
  );
  const userId = useSelector(selectId);
  const adminId = useSelector(selectProps(id));

  const [times, setTimes] = useState(createTimes());
  const { index, disabledTime, description, year, month, date } = state;
  const serverTime = useMemo(
    () => dayjs([year, month, date]).format("YYYY-MM-DD"),
    [(year, month, date)],
  );

  useEffect(() => {
    dispatch({
      type: "disabledTime",
      payload: [0, 10, 20, 30, 40],
    });

    (async () => {
      if (!adminId) {
        return;
      }
      const response = await getReserveTime(adminId, serverTime);

      dispatch({
        type: "disabledTime",
        payload: response,
      });
    })();
  }, [adminId, serverTime]);

  function onSelect(id) {
    dispatch({
      type: "index",
      payload: id,
    });
  }

  function onChange(event) {
    dispatch({
      type: "description",
      payload: event.target.value,
    });
  }

  async function onComplete() {
    const res = await createReservation({
      adminId,
      userId,
      description: state.description,
      date: serverTime,
      index: state.index,
    });

    toast.success("예약이 성공적으로 등록되었습니다.");
    navigate("/");
  }

  return (
    <ReducerContext.Provider value={[state, dispatch]}>
      <Modal id={id}>
        <Container>
          <ModalTitleText text="예약 정보 작성" id={id} />
          <Label>날짜 선택</Label>
          <Wrapper>
            <CalenderMonth />
            <Calendar />
          </Wrapper>
          <Wrapper>
            <Label>시간 선택</Label>
            <ButtonContainer>
              {times.map((item) => (
                <ToggleButton
                  key={item.index}
                  selected={item.index === index}
                  disabled={disabledTime.includes(item.index)}
                  onClick={() => onSelect(item.index)}
                >
                  {item.value}
                </ToggleButton>
              ))}
            </ButtonContainer>
          </Wrapper>

          <InputArea
            label="진료 희망 사유"
            value={description}
            onChange={onChange}
          />
          <Button type="primary" onClick={onComplete}>
            예약 신청
          </Button>
        </Container>
      </Modal>
    </ReducerContext.Provider>
  );
};

export default ReservationCreateModal;

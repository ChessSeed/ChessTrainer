import { useRef, useState, useEffect } from 'react';
//import './Stopwatch.css';
import React from 'react';

const Stopwatch = (props: any) => {
  const intervalRef = useRef<number>();
  
  const [state, setState] = useState({
    total: 0,
    isCounting: false,
    buttonClicked: "start",
  });
  
  useEffect(() => () => clearInterval(intervalRef.current), []);
  useEffect(() => { if(props.running === 1){
      onStartBtnClick();
    }else if (props.running === 2){
      onStartBtnClick();
    }else{
      onClearBtnClick();
    } 
  }, [props.running]);
  
  const { total, isCounting, buttonClicked } = state;

  const onStartBtnClick = () => {
    const clickTime = new Date().getTime();
    if (!isCounting) {
      intervalRef.current = window.setInterval(() => {
        const totalTime = total + new Date().getTime() - clickTime;
        setState({ total: totalTime, isCounting: true, buttonClicked: "start" });
      }, 0);
    } else {
      window.clearInterval(intervalRef.current);
      const totalTime = total + new Date().getTime() - clickTime;
      setState({ isCounting: false, total: totalTime, buttonClicked: "start" });
    }
  };
  
  const onClearBtnClick = () => {
    window.clearInterval(intervalRef.current);
    setState({ isCounting: false, total: 0, buttonClicked: "clear" });
  };

  function padInt(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  
  return (
    <div className='StopWatch'>
      <h1 className="headline">
        <i className="fas fa-stopwatch" />
        Time : <div className="timer">{Math.floor(total/1000)} : {Math.floor(total/100)%10}{Math.floor(total/10)%10}{total%10}</div>
      </h1>
    </div>
  );
};

export default React.memo(Stopwatch);
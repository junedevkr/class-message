import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';


function StudentPage() {
  const [classCode, setClassCode] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");
  const [students, setStudents] = useState([]); // students 상태 변수 추가
  const [user, setUser] = useState(null); // user 상태 변수 추가

  const handleClassCodeChange = (event) => {
    if (event.target.value.length <= 8) {
      setClassCode(event.target.value);
    }
  };

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const handleTextBlur = async (studentId) => {
    if (studentId) { // studentId가 유효한지 확인
      const updatedStudent = students.find((student) => student.id === studentId);
      const collectionName = user.email;
      const classCollectionRef = collection(db, collectionName, 'class', 'data');
      const studentDocRef = doc(classCollectionRef, studentId.toString()); // 문서 제목을 번호로 생성
      await updateDoc(studentDocRef, { text: updatedStudent.text });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // 1. 입력된 학급코드로 db/list에서 일치하는 문서를 확인
    const listDocRef = doc(db, 'list', classCode);
    const listDocSnapshot = await getDoc(listDocRef);
  
    if (listDocSnapshot.exists()) {
      // 2. 확인한 문서의 id 필드값에 있는 user.email을 확인
      const userEmail = listDocSnapshot.data().id;
  
      // 3. 확인한 user.email과 일치하는 collection을 찾음
      const classCollectionRef = collection(db, userEmail, 'class', 'data');
  
      // 4. 찾은 collection/class/data에서 입력된 번호와 일치하는 번호의 문서를 확인
      const studentDocRef = doc(classCollectionRef, number);
      const studentDocSnapshot = await getDoc(studentDocRef);
  
      if (studentDocSnapshot.exists()) {
        // 5. 문서의 text필드 값을 화면에 보여줌
        setText(studentDocSnapshot.data().text);
        setMessage("");
      } else {
        setMessage("번호를 다시 선택하세요.");
        setText("");
      }
    } else {
      setMessage("학급코드를 다시 입력하세요.");
      setText("");
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ marginBottom: 'auto' }}>
        <h2>메시지 확인하기</h2>
        <form onSubmit={handleSubmit}>
        <input type="text" value={classCode} onChange={handleClassCodeChange} maxLength={8} placeholder="학급코드를 입력하세요." />
<input type="number" value={number} onChange={handleNumberChange} placeholder="번호를 선택하세요." />
<button onClick={handleSubmit}>확인</button>
        </form>
        {message && <p>{message}</p>}
      </div>
      {text && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    fontSize: '4em',
    width: '80vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

  }}>
    {text}
  </div>
)} 
   </div>

  );}

export default StudentPage;

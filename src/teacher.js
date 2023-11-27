import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, deleteDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function generateClassCode() {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function TeacherPage() {
  const [user, setUser] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [studentCount, setStudentCount] = useState(1);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const textInputRefs = useRef([]); // 텍스트 입력 참조를 저장하는 배열

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setUser(user);
        
              // Define the collection name based on the user's email
      const collectionName = user.email;

        // list 컬렉션에서 classCode를 문서 제목으로 하고, 그 안에 사용자 아이디를 저장
        const listCollectionRef = collection(db, 'list');
        const classCollectionRef = collection(db, user.email, 'class', 'data');
        
        // class 문서 가져오기
        const classDocRef = doc(db, user.email, 'class');
        const classDocSnapshot = await getDoc(classDocRef);
        let classCode;
        
// class 문서가 존재하는 경우, 이미 생성된 classCode를 가져옴
if (classDocSnapshot.exists()) {
  classCode = classDocSnapshot.data().title;
} else {
  // class 문서가 존재하지 않는 경우, 새로운 classCode를 생성하고 문서를 생성함
  classCode = generateClassCode();
  await setDoc(classDocRef, { title: classCode });
}        
        setClassCode(classCode);
        
        const listDocRef = doc(listCollectionRef, classCode);
        const docSnapshot = await getDoc(listDocRef);
        
        // list 컬렉션에 classCode 문서가 존재하지 않는 경우, 새로운 문서를 생성함
        if (!docSnapshot.exists()) {
          await setDoc(listDocRef, { id: user.email });
        }
      
        getDoc(listDocRef).then((docSnapshot) => {
          if (!docSnapshot.exists()) {
            setDoc(listDocRef, { id: user.email }).then(() => {
              setDoc(listDocRef, { userId: user.email, classCode: classCode }).then(() => {
                // Update the title field of the class document
                const classDocRef = doc(db, collectionName, 'class');
                updateDoc(classDocRef, { title: classCode }).then(() => {
                  setClassCode(classCode); // Update the classCode state after updating the class document
                  getDocs(classCollectionRef).then((snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      deleteDoc(doc.ref);
                    });
                    for (let i = 1; i <= studentCount; i++) {
                      const studentDocRef = doc(classCollectionRef, i.toString()); // 문서 제목을 번호로 생성
                      setDoc(studentDocRef, {
                        id: i,
                        text: `메시지를 입력하세요 ${i}`
                      });
                    }
                  });
                });
              });
            });
          }
        });
      } else {
        setUser(null);
        signInWithPopup(auth, provider)
          .catch((error) => {
            console.error(error);
          });
      }
    });
  
    return () => unsubscribe();
  }, [studentCount]);
    
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    if (user) {
      const collectionName = user.email;
      const docRef = doc(db, collectionName, 'class');

      getDoc(docRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setClassCode(docSnapshot.data().title);
        }
      });

      const classCollectionRef = collection(db, collectionName, 'class', 'data');
      const unsubscribe = onSnapshot(classCollectionRef, (snapshot) => {
        const studentList = snapshot.docs.map((doc) => doc.data());
        studentList.sort((a, b) => a.id - b.id); // 카드번호를 오름차순으로 정렬
        setStudents(studentList);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleStudentCountChange = async (event) => {
    const newStudentCount = parseInt(event.target.value);
  
    // Delete all existing student data
    const classCollectionRef = collection(db, user.email, 'class', 'data');
    const snapshot = await getDocs(classCollectionRef);
    snapshot.docs.forEach((doc) => {
      deleteDoc(doc.ref);
    });
  
    // Generate new student data
    for (let i = 1; i <= newStudentCount; i++) {
      const studentDocRef = doc(classCollectionRef, i.toString()); // 문서 제목을 번호로 생성
      setDoc(studentDocRef, {
        id: i,
        text: `메시지를 입력하세요 ${i}`
      });
    }
  
    setStudentCount(newStudentCount);
  };
  
  const handleTextChange = (event, studentId) => {
    const newText = event.target.value;
    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        return { ...student, text: newText };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleTextBlur = async (studentId) => {
    const updatedStudent = students.find((student) => student.id === studentId);
    if (updatedStudent) {
      const collectionName = user.email;
      const classCollectionRef = collection(db, collectionName, 'class', 'data');
      const studentDocRef = doc(classCollectionRef, studentId.toString()); // 문서 제목을 번호로 생성
      await updateDoc(studentDocRef, { text: updatedStudent.text });
    }
  };

  return (
    <div style={{ width: '80%', margin: '10 auto', marginTop: '50px', marginBottom: '50px' }}>
    <h2>메시지 보내기</h2>
      <p>{user ? user.email : '로그인하지 않음'}</p>
      {user && <button onClick={handleLogout}>Logout</button>}
      <p>교실 코드: {classCode} <button onClick={openModal}>🔍</button></p>
      
      <Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  contentLabel="Class Code"
  style={{
    overlay: { background: 'rgba(0, 0, 0, 0.5)' },
    content: {
      color: '#000',
      fontSize: '10em',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // 세로 중앙 정렬
      alignItems: 'center', // 가로 중앙 정렬
      height: '85%', // 모달 높이 설정
    }
  }}
>
  {classCode}
  <button onClick={closeModal}>닫기</button>
</Modal>

      <select value={studentCount} onChange={handleStudentCountChange}>
        {[...Array(30).keys()].map((value) => (
          <option key={value} value={value + 1}>{value + 1}</option>
        ))}
      </select>
      <div>
        {students.map((student) => (
          <div key={student.id} style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '10px', margin: '10px', position: 'relative' }}>
  <p style={{ fontSize: '1em', marginRight: '20px' }}>{student.id}번</p>
  <input
    ref={(el) => (textInputRefs.current[student.id] = el)}
    type="text"
    value={student.text}
    onChange={(event) => handleTextChange(event, student.id)}
    onBlur={() => handleTextBlur(student.id)}
    onKeyDown={(event) => {
      if (event.key === 'Enter') {
        handleTextBlur(student.id);
        textInputRefs.current[student.id].blur();
      }
    }}
    style={{ width: '80%', fontSize: '1em', border: '0px', borderBottom: '1px solid black' }}
  />
</div>
        ))}
      </div>
    </div>
  );
}

export default TeacherPage;

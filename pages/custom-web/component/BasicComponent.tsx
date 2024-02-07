/* eslint-disable import/order */
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, ref, get, getDatabase, update, remove } from 'firebase/database';
import Container from 'components/Container';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import AutofitGrid from 'components/AutofitGrid';
import { media } from 'utils/media';
import BasicSection from 'components/BasicSection';

interface BasicComponentArray {
  title: string;
  p1: string;
  overTitle: string;
  li1:string;
  li2:string;
  li3:string;
  li4:string;
  li5:string;
}

export default function BasicComponentEdit() {
  const [basicComponent, setBasicComponent] = useState<BasicComponentArray[]>([]);
  const [selectedBasicComponent, setSelectedBasicComponent] = useState(false);
  const [title, setTitle] = useState("");
  const [checkBox, setCheckBox] = useState(false);
  const [desc, setDesc] = useState("");
  const [li1, setLi1] = useState("");
  const [li2, setLi2] = useState("");
  const [li3, setLi3] = useState("");
  const [li4, setLi4] = useState("");
  const [li5, setLi5] = useState("");

  const fetchData = async () => {
    try {
      const DB = ref(getDatabase());
      const dataSnapshot = await get(childDb(DB, 'MainSection/BasicSection'));
      const data = dataSnapshot.val() || {};
      setBasicComponent(Object.values(data));
    } catch (error) {
     alert('Error fetching partners');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!title) {
        alert("Please input the title for database ID");
      }else{
            const DB = getDatabase();
            const partnerRef = ref(DB, `MainSection/BasicSection/${title}`);
            let PushToDatabase = {};
              if(checkBox){
                PushToDatabase = {
                    title: "",
                    p1: desc || "",
                    overTitle: title,
                    li1: li1 || "",
                    li2: li2 || "",
                    li3: li3 || "",
                    li4: li4 || "",
                    li5: li5 || "",
                }
              }else{
                PushToDatabase = {
                    title: title,
                    p1: desc || "",
                    overTitle: title,
                    li1: li1 || "",
                    li2: li2 || "",
                    li3: li3 || "",
                    li4: li4 || "",
                    li5: li5 || "",
                }
              }
            console.log(PushToDatabase);
            update(partnerRef, PushToDatabase);
            alert("Berhasil di upload");
            await fetchData()
          }
    } catch (error) {
      console.log(error);
      alert('Error uploading file');
    }
  };

  function handleEdit() {
    setSelectedBasicComponent(true);

  }
  
  function handleDelete(i: number) {
    const basicComponentToDelete = basicComponent[i];
    const titleToDelete = basicComponentToDelete.overTitle;
    const confirmDelete = window.confirm(`Apakah Kamu Yakin Akan Menghapus ${titleToDelete} ?`)

    if(confirmDelete){
      try {
        const DB = getDatabase();
        const featuresRef = ref(DB, `MainSection/BasicSection/${titleToDelete}`);
        remove(featuresRef);
        const updatedFeatures = basicComponent.filter((basicComponent) => basicComponent.title !== titleToDelete);
        setBasicComponent(updatedFeatures);
        alert(`Banner telah dihapus: ${titleToDelete}`);
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  }
 
  return (
    <Wrapper>
        <Container>
            <CustomAutofitGrid>
                {basicComponent.map((a, index) => (
                  <BasicSection key={index} title={a.title || a.overTitle}>
                    <p>{a.p1}</p>
                      <ul>
                        <li>{a.li1}</li>
                        <li>{a.li2}</li>
                        <li>{a.li3}</li>
                        <li>{a.li4}</li>
                        <li>{a.li5}</li>
                        {/* li Should be in Array for better renderin */}
                      </ul>
                      <ButtonDelete onClick={() => handleDelete(index)}>Hapus</ButtonDelete>
                  </BasicSection>
                  ))}
                    <Button onClick={() => handleEdit()}>Tambah Contenr Lain</Button>
                  </CustomAutofitGrid>
                </Container>
        {selectedBasicComponent && (
          <Modal>
            <Form>
            <h2>Edit Partner</h2>
            <label>Masukan Judul Utama</label>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setTitle(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
                <Checkbox type="checkbox" onChange={(e) => setCheckBox(e.target.checked)}/>
                <CheckboxLabel>Tampilkan Tanpa Judul?</CheckboxLabel>
            </InputTextWrapper>
            <label>Masukan Deskripsi</label>
            <InputTextWrapper>
              <InputDesc placeholder={"Text Here"} onChange={(e) => setDesc(e.target.value)}/>
            </InputTextWrapper>

            <label>Masukan Text Centang</label>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setLi1(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setLi2(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setLi3(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setLi4(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
              <InputText type='text' placeholder={"Text Here"} onChange={(e) => setLi5(e.target.value)}/>
            </InputTextWrapper>
              <ButtonGroup>
                <Button onClick={() => handleSubmit()}>Submit</Button>
                <ButtonTutup onClick={() => setSelectedBasicComponent(false)}>Tutup</ButtonTutup>
              </ButtonGroup>
            </Form>
          </Modal>
        )}
    </Wrapper>
  );
}

  const CheckboxLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 1.6rem;
  color: rgb(var(--text));
  `;
  
  const Checkbox = styled.input`
  align-items: center;
  text-align: center;
  margin-right: 0.5rem;
  width: 2rem;
  height: 2rem;
`;

const Form = styled.div`
text-align:center;
align-items: center;
`

const ButtonDelete = styled.button`
  border: none;
  background: none;
  display: inline-block;
  text-decoration: none;
  text-align: center;
  background: red;
  padding: 1.75rem 2.25rem;
  font-size: 1.2rem;
  color: rgb(var(--textSecondary));
  text-transform: uppercase;
  font-family: var(--font);
  font-weight: bold;
  border-radius: 2rem;
  border: 2px solid red;
  transition: transform 0.3s;
  backface-visibility: hidden;
  will-change: transform;
  cursor: pointer;

  span {
    margin-left: 2rem;
  }

  &:hover {
    transform: scale(1.025);
  }
`;

const ButtonTutup = styled.button`
  border: none;
  background: none;
  display: inline-block;
  text-decoration: none;
  text-align: center;
  background: red;
  padding: 1.75rem 2.25rem;
  font-size: 1.2rem;
  color: rgb(var(--textSecondary));
  text-transform: uppercase;
  font-family: var(--font);
  font-weight: bold;
  border-radius: 2rem;
  border: 2px solid red;
  transition: transform 0.3s;
  backface-visibility: hidden;
  will-change: transform;
  cursor: pointer;

  span {
    margin-left: 2rem;
  }

  &:hover {
    transform: scale(1.025);
  }
`;

const CustomAutofitGrid = styled(AutofitGrid)`
  --autofit-grid-item-size: 40rem;

  ${media('<=tablet')} {
    --autofit-grid-item-size: 30rem;
  }

  ${media('<=phone')} {
    --autofit-grid-item-size: 100%;
  }
`;

const Wrapper = styled.div`
padding-top: 3rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  max-height: 45rem;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: rgb(var(--background));
  padding: 10px;
  overflow-y: auto;
  border: 1px solid black;
`;


const InputTextWrapper = styled.div`
  padding: 1rem;
  text-align: center;
`

const InputText = styled.input`
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  border-radius: 0.6rem;
  main-width: 80%;
  max-height: 3rem;
  font-size: 1.6rem;
  color: rgb(var(--text))
  padding: 1.8rem;
  box-shadow: var(--shadow-md);

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`;

const InputDesc = styled.textarea`
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  border-radius: 0.6rem;
  max-width: 80%;
  min-height: 12rem;
  font-size: 1.6rem;
  color: rgb(var(--text));
  padding: 1.8rem;
  box-shadow: var(--shadow-md);
  resize: vertical;
  height: auto;

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`;
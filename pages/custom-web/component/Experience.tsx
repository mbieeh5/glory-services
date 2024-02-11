/* eslint-disable import/order */
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, get, getDatabase, ref, remove, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../firebase';
import Container from 'components/Container';
import BasicCard from 'components/BasicCard';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import AutofitGrid from 'components/AutofitGrid';
import { media } from 'utils/media';

interface FeaturesArray {
  title: string;
  overTitle: string;
  url: string;
  desc: string;
}

export default function ExperienceEditor() {
  const [experience, setExperience] = useState<FeaturesArray[]>([]);
  const [selectedExperience, setSelectedExperience] = useState(false);
  const [title2, setTitle2] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploading, setUploading] = useState(false);

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 9000) + 1000;
  };
  const fetchData = async () => {
    try {
      const DB = ref(getDatabase());
      const dataSnapshot = await get(childDb(DB, 'MainSection/Experience'));
      const data = dataSnapshot.val() || {};
      setExperience(Object.values(data));
    } catch (error) {
     alert('Error fetching partners');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  const handleSubmit = async () => {
    const angkaRandom4digit = generateRandomNumber();
    const DBS = storageRef(storage, `mainBanner/${title2}-${angkaRandom4digit}`);
    try {
        if(!photo || !title2 || !desc){
            alert("Photo, Title, Desc can't be blank")
        }else{
          setUploading(true);
          const UploadTask = uploadBytesResumable(DBS, photo);
            UploadTask.on('state_changed', (ss) => {
              const progress = (ss.bytesTransferred / ss.totalBytes) * 100;
              setUploadProgress(progress)
            }, (error) => {
              console.error('error Uploading File', error);
              alert('error while uploading file');
              setUploading(false);
            }, async() => {
              const downloadURL = await getDownloadURL(DBS);
              const TitleRandom = title2 + angkaRandom4digit;
              setUploading(false);
              setSelectedExperience(false);
              await uploadBytes(DBS, photo);
                const DB = getDatabase();
                const partnerRef = ref(DB, `MainSection/Experience/${TitleRandom}`);
                update(partnerRef, { title: title2, overTitle: TitleRandom ,url: downloadURL, desc: desc });
              alert("Berhasil di upload");
              await fetchData()
            })
        }
    } catch (error) {
      alert('Error uploading file');
    }
  };

  function handleEdit() {
    setSelectedExperience(true);

  }
  
  function handleDelete(i: number) {
    const partnerToDelete = experience[i];
    const titleToDelete = partnerToDelete.overTitle;
    const confirmDelete = window.confirm(`Apakah Kamu Yakin Akan Menghapus ${titleToDelete} ?`)

    if(confirmDelete){
      try {
        const DB = getDatabase();
        const featuresRef = ref(DB, `MainSection/Experience/${titleToDelete}`);
        remove(featuresRef);
        const updatedFeatures = experience.filter((exp) => exp.title !== titleToDelete);
        setExperience(updatedFeatures);
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
                {experience.map((a, index) => (
                  <AnimatedElement key={index}>
                      <BasicCard title={a.title} imageUrl={a.url} description={a.desc} />
                      <ButtonGroup>
                        <ButtonDelete onClick={() => handleDelete(index)}>Hapus</ButtonDelete>
                      </ButtonGroup>
                  </AnimatedElement>
                  ))}
                    <Button onClick={() => handleEdit()}>Tambah Banner Lain</Button>
                  </CustomAutofitGrid>
                </Container>
        {selectedExperience && (
          <Modal>
            <h2>Edit Partner</h2>
            <InputTextWrapper>
              <InputText type='text' placeholder={"masukan Judul"} onChange={(e) => setTitle2(e.target.value)}/>
            </InputTextWrapper>
            <InputTextWrapper>
              <InputDesc placeholder={"masukan Deskripsi"} onChange={(e) => setDesc(e.target.value)}/>
            </InputTextWrapper>
              <InputFile type='file' onChange={handleFileChange} />
              <ButtonGroup>
                <Button onClick={handleSubmit} disabled={uploading}>Submit</Button>
                <ButtonTutup onClick={() => setSelectedExperience(false)} disabled={uploading}>Tutup</ButtonTutup>
              </ButtonGroup>
              {uploading && <p>Uploading... {Math.floor(uploadProgress)}%</p>}
          </Modal>
        )}
    </Wrapper>
  );
}

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

const AnimatedElement = styled.div`
  transition: transform 0.3s ease;
  text-align: center;
  &:hover {
    transform: scale(0.9);
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
  transform: translate(-50%, -50%);
  background-color: rgb(var(--background));
  padding: 10px;
  border: 1px solid black;
`;


const InputTextWrapper = styled.div`
  padding: 2rem;
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

const InputFile = styled.input` 
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  border-radius: 0.6rem;
  max-width: 80%;
  max-height: 3rem;
  margin: 0.8rem;
  box-shadow: var(--shadow-md);

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`
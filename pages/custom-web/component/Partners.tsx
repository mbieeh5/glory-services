import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, ref, get, getDatabase, update, remove } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../../../firebase';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';

interface PartnerArray {
  title: string;
  url: string;
}

export default function PartnerEditor() {
  const [partners, setPartners] = useState<PartnerArray[]>([]);
  const [selectedPartner, setSelectedPartner] = useState(false);
  const [title2, setTitle2] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DB = ref(getDatabase());
        const dataSnapshot = await get(childDb(DB, 'MainSection/Partner'));
        const data = dataSnapshot.val() || {};
        setPartners(Object.values(data));
      } catch (error) {
       alert('Error fetching partners');
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  const handleSubmit = async () => {
    const DBS = storageRef(storage, `mainBanner/${title2}`);
    try {
        if(!photo || !title2){
            alert("Photo and Title can't be blank")
        }else{
            await uploadBytes(DBS, photo);
            const downloadURL = await getDownloadURL(DBS);
            alert("Berhasil di upload");
            const DB = getDatabase();
            const partnerRef = ref(DB, `MainSection/Partner/${title2}`);
            update(partnerRef, { title: title2, url: downloadURL });
            window.location.reload();
        }
    } catch (error) {
      alert('Error uploading file');
    }
  };

  function handleEdit() {
    setSelectedPartner(true);

  }
  
  function handleDelete(i: number) {
    const partnerToDelete = partners[i];
    const titleToDelete = partnerToDelete.title;
    const confirmDelete = window.confirm(`Apakah Kamu Yakin Akan Menghapus ${titleToDelete} ?`)

    if(confirmDelete){
      try {
        const DB = getDatabase();
        const partnerRef = ref(DB, `MainSection/Partner/${titleToDelete}`);
        remove(partnerRef);
        const updatedPartners = partners.filter((partner) => partner.title !== titleToDelete);
        setPartners(updatedPartners);
        alert(`Data mitra dihapus: ${titleToDelete}`);
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  }
  
 
  return (
    <Wrapper>
        <Table>
          <thead>
            <tr>
              <th>Nama Logo</th>
              <th>Deskripsi</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <tr key={index}>
                <td>{partner.title}</td>
                <td>
                  <LogoPartner alt={partner.title} src={partner.url}/>
                </td>
                <td>
                  <ButtonDelete onClick={() => handleDelete(index)}>Delete</ButtonDelete>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button onClick={() => handleEdit()}>Tambah Logo Lain</Button>
              </td>
            </tr>
          </tbody>
        </Table>
        {selectedPartner && (
          <Modal>
            <h2>Edit Partner</h2>
            <InputTextWrapper>
              <InputText type='text' placeholder={"masukan Nama"} onChange={(e) => setTitle2(e.target.value)}/>
            </InputTextWrapper>
              <InputFile type='file' onChange={handleFileChange} />
              <ButtonGroup>
                <Button onClick={handleSubmit}>Submit</Button>
                <ButtonTutup onClick={() => setSelectedPartner(false)}>Tutup</ButtonTutup>
              </ButtonGroup>
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

const Wrapper = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  align-items: center;
  text-align: center;

  th,
  td {
    border: 1px solid #dddddd;
    text-align: center;
    padding: 8px;
  }

  th {
    background-color: #f2f2f2;
    color: black;
  }

  tr:nth-child(even) {
    background-color: #fff;
    color: black;
  }

  tr:hover {
    background-color: #dddddd;
    color: black;
  }
`;

const LogoPartner = styled.img`
  width: 15rem;
  padding: 2rem;
`

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgb(var(--background));
  padding: 20px;
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
  max-width: 80%;
  max-height: 3rem;
  font-size: 1.6rem;
  padding: 1.8rem;
  box-shadow: var(--shadow-md);

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
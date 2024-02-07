import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, ref, get, getDatabase, update, remove } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../firebase';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';

interface PartnerArray {
  title: string;
  url: string;
}

export default function BannerHero2() {
  const [banner, setBanner] = useState<PartnerArray[]>([]);
  const [selectedBanner, setSelectedBanner] = useState(false);
  const [title2, setTitle2] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploading, setUploading] = useState(false);

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 9000) + 1000;
  };
  const fetchData = async () => {
    try {
      const DB = ref(getDatabase());
      const dataSnapshot = await get(childDb(DB, 'MainSection/Hero2'));
      const data = dataSnapshot.val() || {};
      setBanner(Object.values(data));
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
        if(!photo || !title2){
            alert("Photo and Title can't be blank")
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
              setUploading(false);
              setSelectedBanner(false);
              await uploadBytes(DBS, photo);
                const DB = getDatabase();
                const partnerRef = ref(DB, `MainSection/Hero2/${title2}`);
                update(partnerRef, { title: title2, url: downloadURL });
              alert("Berhasil di upload");
              await fetchData()
            })
        }
    } catch (error) {
      alert('Error uploading file');
    }
  };

  function handleEdit() {
    setSelectedBanner(true);

  }
  
  function handleDelete(i: number) {
    const partnerToDelete = banner[i];
    const titleToDelete = partnerToDelete.title;
    const confirmDelete = window.confirm(`Apakah Kamu Yakin Akan Menghapus ${titleToDelete} ?`)

    if(confirmDelete){
      try {
        const DB = getDatabase();
        const partnerRef = ref(DB, `MainSection/Hero2/${titleToDelete}`);
        remove(partnerRef);
        const updatedPartners = banner.filter((banners) => banners.title !== titleToDelete);
        setBanner(updatedPartners);
        alert(`Banner telah dihapus: ${titleToDelete}`);
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
              <th>Nama Banner</th>
              <th>Deskripsi</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {banner.map((banner, index) => (
              <tr key={index}>
                <td>{banner.title}</td>
                <td>
                  <LogoPartner alt={banner.title} src={banner.url}/>
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
        {selectedBanner && (
          <Modal>
            <h2>Edit Partner</h2>
            <InputTextWrapper>
              <InputText type='text' placeholder={"masukan Nama"} onChange={(e) => setTitle2(e.target.value)}/>
            </InputTextWrapper>
              <InputFile type='file' onChange={handleFileChange} />
              <ButtonGroup>
                <Button onClick={handleSubmit} disabled={uploading}>Submit</Button>
                <ButtonTutup onClick={() => setSelectedBanner(false)} disabled={uploading}>Tutup</ButtonTutup>
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
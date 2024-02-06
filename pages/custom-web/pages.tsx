import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, ref, get, getDatabase, update, remove } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase';
import BasicSection from 'components/BasicSection';
import Button from 'components/Button';

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
    console.log(photo)
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
  
 
  return (
    <Wrapper>
      <BasicSection title='Partner Section'>
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
                </td> {/* Perbaikan #3 */}
                <td>
                  <Button onClick={() => handleDelete(index)}>Delete</Button>
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
            <input type='text' placeholder={"masukan Nama"} onChange={(e) => setTitle2(e.target.value)}/>
            <input type='file' onChange={handleFileChange} />
            <Button onClick={handleSubmit}>Submit</Button>
            <Button onClick={() => setSelectedPartner(false)}>Tutup</Button>
          </Modal>
        )}
      </BasicSection>
    </Wrapper>
  );
}

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

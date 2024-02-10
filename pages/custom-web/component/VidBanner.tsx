/* eslint-disable import/order */
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { child as childDb, get, getDatabase, ref, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../firebase';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';

interface VidBannerArray {
  title: string;
  url: string;
}

export default function VidBannerEditor() {
  const [vidBanner, setVidBanner] = useState<VidBannerArray[]>([]);
  const [selectedPartner, setSelectedPartner] = useState(false);
  const [title2, setTitle2] = useState("");
  const [video, setVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DB = ref(getDatabase());
        const dataSnapshot = await get(childDb(DB, 'MainSection/Hero1'));
        const data = dataSnapshot.val() || {};
        setVidBanner(Object.values(data));
      } catch (error) {
       alert('Error fetching partners');
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
        // Periksa apakah ekstensi file adalah mp4
      if (file && file.type === 'video/mp4') {
        setVideo(file);
      } else {
        setVideo(null);
        alert('Please select an Video file or Mp4 file.');
      }
    };

    const handleSubmit = async () => {
      const DBS = storageRef(storage, `mainBanner/BgVidMainBanner`);
    
      try {
        if (!video || !title2) {
          alert("File must be Video and Title can't be blank");
          return;
        } else {
          const videoElement = document.createElement('video');
          videoElement.src = URL.createObjectURL(video);
          videoElement.load();

          videoElement.addEventListener('loadedmetadata', async() => {
            console.log(videoElement.videoHeight)
            if (videoElement.duration > 16) {
              alert('Video duration must be less than or equal to 15 second.');
              return;
            }
            if (videoElement.videoWidth > 1280 || videoElement.videoHeight > 720) {
              alert('Video resolution must be 1080p or lower.');
              return;
            }
            setUploading(true);

            const uploadTask = uploadBytesResumable(DBS, video);
            uploadTask.on('state_changed', (ss) => {
              const progress = (ss.bytesTransferred / ss.totalBytes) * 100;
              setUploadProgress(progress);
            },(err) => {
              console.error('error uploading file:', err)
              alert('Error Uploading file');
              setUploading(false);
            }, async() => {
              const downloadURL = await getDownloadURL(DBS);

              const DB = getDatabase();
              const partnerRef = ref(DB, `MainSection/Hero1/bgVid`);
              await update(partnerRef, { title: title2, url: downloadURL });
              alert('Berhasil di upload');
              window.location.reload();
            })

          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    };
    
  

  function handleEdit() {
    setSelectedPartner(true);

  }
 
  return (
    <Wrapper>
            {vidBanner.map((vid, index) => (
              <Wrapper  key={index}>
                      <VideoWrapper>
                      <p>{vid.title}</p>
                        <Video src={vid.url} autoPlay muted loop />
                      </VideoWrapper>
                <ButtonWrapper>
                  <Button onClick={() => handleEdit()}>Ubah Video</Button>
                </ButtonWrapper>
              </Wrapper>
                  ))}
            {selectedPartner && (
          <Modal>
            <h2>Edit Video</h2>
              <InputTextWrapper>
                <InputText type='text' placeholder={"masukan Nama"} onChange={(e) => setTitle2(e.target.value)}/>
              </InputTextWrapper>
            <InputFile type='file' onChange={handleFileChange} />
            <ButtonGroup>
              <Button onClick={handleSubmit} disabled={uploading}>Submit</Button>
              <ButtonTutup onClick={() => setSelectedPartner(false)} disabled={uploading}>Tutup</ButtonTutup>
            </ButtonGroup>
            {uploading && <p>Uploading... {Math.floor(uploadProgress)}%</p>}
          </Modal>
        )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px;
  padding-bottom: 4rem;
  `;
  
const ButtonWrapper = styled.div`
  text-align:center;
  padding-top: 2rem;
  `
  
const VideoWrapper = styled.div`
  text-align:center;
  `

const Video = styled.video`
  width: 25rem;
  @media (min-width: 765px){
    width: 50rem;
  }
  `
const Modal = styled.div`
  position: fixed;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgb(var(--background));
  padding: 20px;
  border: 1px solid black;
  overflow-y: auto;
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

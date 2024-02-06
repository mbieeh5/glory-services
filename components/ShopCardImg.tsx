import { child, get, getDatabase,ref, update } from 'firebase/database';
import NextLink from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';
import { media } from 'utils/media';
import Button from './Button';
import ButtonGroup from './ButtonGroup';

export interface ShopCards {
  title: string;
  link: string;
  description: string;
  img : string;
  ID: number;
  price: number;
  stock: number;
}

export default function ShopCard({ title, link, description, img, price, stock}: ShopCards) {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [qty, setQty] = useState(0);
  const [noHp, setNoHp] = useState('');
  const db = getDatabase();
  const dbd = ref(getDatabase());
  const openPopup = () => setPopupVisible(true);
  const closePopup = () => setPopupVisible(false);
  
  function HandlerNoHP(noHP : string){
    const RegexNo0 = /^0/;
    const noHP62 = noHP.replace(RegexNo0, '62');
    setNoHp(noHP62)
  }
  
  function SuccessBuy() {
      if(noHp && qty && qty >= 1){
        const noHPFinal = `${noHp}_c_us`;
        const lowerCaseTitle = title !== "trainingTicket" ? title.toLocaleLowerCase() : title;
        const childRef = ref(db, `dataPengguna/pengguna/${noHPFinal}`);
        const childRef2 = ref(db, `dataPengguna/pengguna/${noHPFinal}/pokemon/inventory`);
        const barangRef = ref(db, `dataData/delay/${lowerCaseTitle}`);
        const harga: number = price;
        const totalHarga = qty * harga;
        get(child(dbd, `dataData/delay`)).then((snapshot) => {
            const val = snapshot.val() || {};
              const allIn = val[lowerCaseTitle].stock || 0;
          get(child(dbd, `dataPengguna/pengguna/${noHPFinal}`)).then((snapshot) => {
          if(!snapshot.exists()){
            alert('Nomor Tujuan Tidak Di temukan di database')
          }else{
          const val = snapshot.val() || {};
          const invent = val.pokemon.inventory || {}
          const point = val.point || 0;
          let points = point;
          const Allinvent = invent[lowerCaseTitle] || 0;
          if(points < totalHarga){
            alert(`Pointmu Tidak Cukup\nSisa point: ${point.toLocaleString('id')}\nTotal Belanja : ${totalHarga.toLocaleString('id')}`)
          }else{
            let success = '';
              if(lowerCaseTitle){
                if(allIn < qty){
                  success = 'false'
                }else{
                  update(childRef,{point: point - totalHarga});
                  update(childRef2,{[lowerCaseTitle]: Allinvent + qty});
                  update(barangRef,{stock : allIn - qty});
                  success = 'true'
                }
              }else{
                alert(`Barang Belum Terdaftar di System`)
              }
              if(success === 'true'){
                setTimeout(() => {
                  alert(`Berhasil Membeli ${qty} ${title}`);
                  setPopupVisible(false);
                  window.location.reload();
                }, 3000)
              }else if(success === 'false'){
                setTimeout(() => {
                  alert('Pembelian Gagal, Stock atau Jumlah Pembelian Tidak Sesuai');
                  setPopupVisible(false);
                  window.location.reload();
                }, 3000)
              }else{
                window.location.reload();
              }
          }
        }
        })
      })
      }else{
        alert('gagal Membeli');
        setQty(0);
        setNoHp("");
      }
  }
    
  return (
    <>
    <NextLink href={link} passHref>
        <HoverEffectContainer>
      <ArticleCardWrapper className="article-card-wrapper" onClick={openPopup}>
          <ImageContainer>
            <ImageHolder alt={title} src={img}/>
          </ImageContainer>
        <Content>
          <Title>{title}</Title>
            <Descriptions>{description}</Descriptions>
        </Content>
      </ArticleCardWrapper>
        </HoverEffectContainer>
    </NextLink>

    {isPopupVisible && (
      <PopupForm>
              <PopupContent>
                  <PopupTitle >{title}</PopupTitle>
                    <Descriptions>Harga: {price.toLocaleString(`id`)}</Descriptions>
                    <Descriptions>Stock: {stock <= 0 ? 'SOLD OUT' : stock}</Descriptions>
                    <Descriptions>
                    Nomor HP :<br/>
                      <Input type='number' placeholder='6281234567891' value={noHp} onChange={(e) => HandlerNoHP(e.target.value)} />
                    </Descriptions>
                    <Descriptions>
                      Jumlah :<br/>
                      <Input type='number' value={qty} placeholder='0' onChange={(e) => setQty(parseInt(e.target.value))}/>
                    </Descriptions>
                <br/>
                  <ButtonGroup>
                    <Button transparent onClick={closePopup}>Close</Button>
                    {stock <= 0 ? <Button disabled transparent>Buy</Button> : <Button onClick={(e) => SuccessBuy()}>Buy</Button>}
                  </ButtonGroup>
              </PopupContent>
      </PopupForm>
    )}
    </>
  );
}

const ImageHolder = styled.img`
position: relative ;
  display: flex;
  max-height: 25rem;
  max-width: 25rem; 
  border-radius: 8px;
`

const Input = styled.input`
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  color: rgb(var(--text))
  border-radius: 0.6rem;
  max-width: 18rem;
  max-height: 3rem;
  font-size: 1.6rem;
  padding: 1.8rem;
  box-shadow: var(--shadow-md);

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`;

const PopupForm = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  `;
  
  const PopupContent = styled.div`
  background: white;
  padding: 2rem;
  min-width: 250px;
  min-height: 150px;
  background: rgb(var(--cardBackground));
  border-radius: 0.6rem;
  text-align: left;
`;

const PopupTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ImageContainer = styled.div`
  position: relative;  
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin-top: 2rem;
  border-radius: 0.6rem;
  
  &:before {
    display: block;
    content: '';
    width: 100%;
    padding: 5%;
  }

  & > div {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  ${media('<=desktop')} {
    width: 100%;
  }
`;

const ArticleCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 40rem;
  max-width: 35rem;
  overflow: hidden;
  text-decoration: none;
  border-radius: 0.6rem;
  background: rgb(var(--cardBackground));
  cursor: pointer;
  color: rgb(var(--text));
`;

const HoverEffectContainer = styled.div`
  transition: transform 0.5s;
  backface-visibility: hidden;
  will-change: transform;

  &:hover {
    border-radius: 0.6rem;
    overflow: hidden;
    transform: scale(1.025);
  }
`;

const Content = styled.div`
  margin-top: 2rem;
  text-align:center;
  & > * {
    margin-top: 1rem;
  }
`;

const Title = styled.h4`
  font-size: 1.8rem;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const Descriptions = styled.p`
  font-size: 1.6rem;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  opacity: 0.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
`;

/* eslint-disable import/order */
import { child, get, getDatabase, ref, update } from "firebase/database";
import { useState } from "react";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Head from "next/head";

interface DataRes {
    NoNota: string;
    NamaUser: string;
    NoHpUser: string;
    TglMasuk: string;
    TglKeluar: string;
    MerkHp: string;
    Kerusakan: string;
    Penerima: string;
    Harga: number;
    Sparepart: any;
    Imei: any;
    Lokasi: string;
    Teknisi: string;
    HargaIbnu: number;
    status: string;
}

interface SparepartInterface {Sparepart:string; TypeOrColor:string; HargaSparepart:any;}

export default function UpdateResi() {
    const [noNotaSearch, setNoNotaSearch] = useState("");
    const [cekNotaSearch, setCekNotaSearch] = useState<DataRes[]>([]);
    const [isLoading, setIsloading] = useState<Boolean>(false);
    const [isSearch, setIsSearch] = useState(false);
    const [isCekNota, setIsCekNota] = useState<Boolean>(false);
    const [isMerkHp, setIsMerkHp] = useState<string>('')
    const [isImei, setIsImei] = useState<string>('');
    const [serviceDataToEdit, setServiceDataToEdit] = useState<DataRes[]>([]);
    const [sparepart, setSparepart] = useState<SparepartInterface[]>([])
    const [isError, setIsError] = useState("");
    const [cekNota, setCekNota] = useState<string>('')
    const [isIbnu, setIsIbnu] = useState<Boolean>(false);
    const [isTeknisiUpdate, setIsTeknisiUpdate] = useState<string>("")
    const [isKerusakan, setIsKerusakan] = useState<string>("")
    const [isNoHpUser, setIsNoHpUser] = useState<string>("");
    const fakeKey = 1;
    
    const addForms = () => {
        setSparepart([...sparepart, {Sparepart: "", TypeOrColor: "", HargaSparepart:0}])
    };
    const removeForms = (index:number) => {
        setSparepart(sparepart.filter((_,i) => i !== index));
    }
    const IbnuController = (e:string) => {
        
        if(e.toLowerCase() === 'ibnu'){
            setIsIbnu(true)
        }else{
            setIsIbnu(false)
        }
        return setIsTeknisiUpdate(e);
    };
    const isSearchService = () => {
        setIsSearch(true)
        if (!noNotaSearch) {
            setIsError("Silahkan Masukan Nomor Nota");
            setIsSearch(false);
        } else {
            const noNotaRegex = /^GL\d{3}[A-Za-z]{3}$/;
            if(noNotaRegex.test(noNotaSearch)){
                const DB = ref(getDatabase());
                get(child(DB, `Service/sandboxDS/${noNotaSearch.toUpperCase()}`))
                .then(async (data) => {
                if(data.exists()){
                    setIsloading(true)
                    setTimeout(() => {
                            setIsloading(false)
                            const Data = data.val() || {};
                            setIsKerusakan(Data.Kerusakan);
                            setIsNoHpUser(Data.NoHpUser);
                            setIsMerkHp(Data.MerkHp);
                            setIsImei(Data.Imei);
                            const sparepartDatas = Data.sparepart;
                            if(sparepartDatas){
                                const initialDataSparepart = Object.keys(sparepartDatas).map((key)=> ({
                                    Sparepart: sparepartDatas[key].Sparepart || "",
                                    TypeOrColor: sparepartDatas[key].TypeOrColor || "",
                                    HargaSparepart: sparepartDatas[key].HargaSparepart || "",
                                }));
                                setSparepart(initialDataSparepart);
                            }
                            const Array:DataRes[] = Object.values({Data});
                            setServiceDataToEdit(Array);
                            setIsError("");
                        },1000)
                    }else{
                        setIsloading(true)
                        setTimeout(() => {
                            setIsloading(false)
                            setIsError("Nomor Nota Tidak Di Temukan");
                            setIsSearch(false);
                        },1000)
                    }
                })
                .catch((error) => {
                    console.error("Error fetching resi data:", error);
                    setIsError("Terjadi kesalahan saat mencari resi");
                });
            }else{
                setIsError("Silahkan Masukan Nomor Nota Dengan Benar");
                setIsSearch(false);
            }
        }
    };
    const handleChangeNoHp = (e:string) => { 
        if(e.length > 0){
            return setIsNoHpUser(e);
        }
        return e;
    };
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target) || "Null";
        const DB = ref(getDatabase());
        const NoNota = formData.get('noNota')?.toString() || "null";
        const TglMasuk = formData.get('tanggalMasuk')?.toString() || "null";  
        const TglKeluar = formData.get('tanggalKeluar')?.toString() || "null";  
        const NamaUser = formData.get('namaUser')?.toString() || "null";
        const Penerima = formData.get('penerima')?.toString() || "null";
        const NoHpUser = formData.get('noHpUser')?.toString() || "null";
        const MerkHp = formData.get('merkHp')?.toString() || "null";
        const Imei = formData.get('imei')?.toString() || "null"
        const HargaIbnu = formData.get('hargaIbnu')?.toString() || "0"
        const Kerusakan = formData.get('kerusakan')?.toString() || "null";
        const Lokasi = formData.get('lokasi')?.toString() || "null";
        const Harga = formData.get('hargaAkhir')?.toString() || "null";
        const Teknisi = formData.get('teknisi')?.toString() || "null";
        const status = formData.get('status')?.toString() || "null";

        const spareparts: Record<string, SparepartInterface> = {};
        formData.forEach((val, key)=> {
              if(key.startsWith('sparepart')) {
                const index = key.match(/\d+/)?.[0] || 0;
                const partName = formData.get(`sparepart-${index}`)?.toString() || "null";
                const typeOrColor = formData.get(`typeOrColor-${index}`)?.toString() || "-";
                const hargaSparepart = formData.get(`hargaSparepart-${index}`)?.toString() || "null"

                if(partName !== 'null'){
                    spareparts[index]= {
                        Sparepart: partName,
                        TypeOrColor: typeOrColor,
                        HargaSparepart: hargaSparepart,
                    }
                }
            }
        });

            const newData = {
                [NoNota] : {
                    NoNota,
                    NamaUser,
                    TglMasuk,
                    TglKeluar,
                    NoHpUser,
                    MerkHp,
                    Penerima, 
                    Kerusakan, 
                    Imei,
                    Harga,
                    Lokasi,
                    Teknisi,
                    HargaIbnu,
                    status,
                    sparepart: spareparts
                }
            };
          const notaRef = ref(getDatabase(), `Service/sandboxDS/`);
            update(notaRef, newData)
            .then(() => {
                alert('Resi Berhasil di Update')
                e.target.reset();
                window.location.reload();
                get(child(DB, `Users/dataPenerima/${Penerima}`)).then(async(datas) => {
                    const exsist = datas.val() || {};
                    const points = exsist.point || 0;
                    const units = exsist.unit || 0;
                    const oldUnit = exsist.oldUnit || 0;
                        const pts = points + 5000
                        const unit = units + 1;
                            const pointData = {
                                [Penerima] : {
                                    nama: Penerima,
                                    point: pts,
                                    oldUnit: oldUnit,
                                    unit: unit,
                                }
                            }
                            if(status === 'sudah diambil' && TglKeluar.length > 5){
                                if(Imei.length > 5){
                                    const pointRef = ref(getDatabase(), `Users/dataPenerima/`);
                                    update(pointRef, pointData)
                                }
                            }
                    }).catch((err) => {
                        console.error(err);
                    });
            })
            .catch((error) => {
                console.error('Gagal menyimpan data:', error);
            });
    };
    const handleChange = (e:any) => {
    setIsKerusakan(e);
    };
    const SearchNota = () => {
        if(cekNota.length < 3){
            alert('HARAP ISI NO NOTA')
            setIsCekNota(false);
        }else{
            setIsloading(true);
            setTimeout(() => {
                const DB = ref(getDatabase());
                get(child(DB, `Service/sandboxDS/${cekNota}`))
                .then(async (ss) => {
                    if(ss.exists()){
                        const datas = ss.val() || {};
                        const Array:DataRes[] = Object.values({datas});
                        setCekNotaSearch(Array);
                    }else{
                        return alert('No Nota Tidak Di Temukan')
                    }
                    setIsCekNota(true);
                })
                setIsloading(false)
            },1500)
        }
    }

    return (
        <Wrapper>
        <Head>
            <title>Update Data || Rraf Project</title>
        </Head>
            {isLoading ? 
            <>
                <WrapperLoading>
                        <Spinner />
                </WrapperLoading>
            </> : 
            
            <>
            
            <SearchWrapper>
                <LabelSearch>
                    Cari Service:
                <Input type="text" placeholder="Cari Nomor Nota" onChange={(e) => setNoNotaSearch(e.target.value.toUpperCase())} />
                </LabelSearch>
                <ButtonSearch onClick={(isSearchService)}>Cari Service</ButtonSearch>
            </SearchWrapper>
            <ErrorText>{isError}</ErrorText>
            <Divider />
            <WrapperContent>
                {isSearch ? (
                    <BasicSection2 title="Update Data Service">
                <Wrapper2>
                    {serviceDataToEdit.map((a) => {

                        /* TGL KELUAR === TGL HARI INI, CAN EDIT IS TRUE */
                        if(a.status === "sudah diambil" && a.TglKeluar.length > 5){
                                alert(`Status Service ${a.status} data tidak bisa di ubah!`)
                                return window.location.reload();
                            }else if(a.status === "cancel" && a.TglKeluar.length > 5) {
                                alert(`Status Service ${a.status} data tidak bisa di ubah!`)
                                return window.location.reload();
                            }else {

                            return(
                        <FormCard key={fakeKey}>
                        <Form onSubmit={handleSubmit}>
                            <Splitter>
                            <Label>
                                No Nota:
                                <Input type="text" placeholder="Resi ID" value={a.NoNota} name="noNota" readOnly/>
                            </Label>
                            <Label>
                                Tanggal Masuk:
                                <Input type="datetime-local" placeholder="null" value={a.TglMasuk} name="tanggalMasuk" readOnly/>
                            </Label>
                            <Label>
                                Tanggal Keluar:
                                <Input type="datetime-local" placeholder="null" name="tanggalKeluar"/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Nama User:
                                <Input type="text" value={a.NamaUser} name="namaUser" readOnly/>
                            </Label>
                            <Label>
                                No Hp User:
                                <Input type="text" value={isNoHpUser} onChange={(e) => {handleChangeNoHp(e.target.value)}} name="noHpUser" required/>
                            </Label>
                            <Label>
                                Penerima:
                                <Input type="text" value={a.Penerima} name="penerima" readOnly/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Merk Hp:
                                <Input type="text" value={isMerkHp} onChange={(e) => {setIsMerkHp(e.target.value)}}  name="merkHp" required/>
                            </Label>
                            <Label>
                                Imei:
                                <Input type="text" value={isImei} onChange={(e) => {setIsImei(e.target.value)}} placeholder="Masukan Imei 1 (*#06#)" name="imei" required/>
                            </Label>
                            <Label>
                                Kerusakan:
                                <Input type="text" placeholder="Kerusakannya apa" value={isKerusakan} onChange={(e) => {handleChange(e.target.value)}} name="kerusakan" required/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Estimasi Harga:
                                <Input type="number" value={a.Harga} name="hargaAwal" readOnly/>
                            </Label>
                                <Label>
                                    Harga Akhir:
                                    <Input type="number" placeholder="Harga Akhir" name="hargaAkhir" required/>
                                </Label>
                            </Splitter>
                            <Splitter>
                                {sparepart.map((spareparts, i) => (
                            <SplitterSparepart key={i}>
                           <Label>
                                Sparepart:
                                <Select placeholder="Sparepart" 
                                name={`sparepart-${i}`}
                                value={spareparts.Sparepart}
                                onChange={(e)=> {
                                    const newSpareparts = [...sparepart];
                                    newSpareparts[i].Sparepart = e.target.value;
                                    setSparepart(newSpareparts);
                                }}
                                >
                                    <option>ANT CABLE</option>
                                    <option>BAZEL HP</option>
                                    <option>BACKDOOR</option>
                                    <option>BATERAI</option>
                                    <option>CON T/C</option>
                                    <option>FLEXI BOARD</option>
                                    <option>FLEXI O/F</option>
                                    <option>FLEXI O/F + VOL</option>
                                    <option>FLEXI VOL</option>
                                    <option>LCD</option>
                                    <option>MIC</option>
                                    <option>MIDDLE FRAME LCD</option>
                                    <option>SIMLOCK</option>
                                    <option>SPEAKER</option>
                                    <option>TOMBOL LUAR</option>
                                </Select>
                                </Label>
                                <Label>
                                    Merk/Warna Sparepart:
                                    <Input type="text" 
                                    placeholder="Warna & Merk" 
                                    name={`typeOrColor-${i}`}
                                    value={spareparts.TypeOrColor}
                                    onChange={(e) => {
                                        const newSpareparts = [...sparepart];
                                        newSpareparts[i].TypeOrColor = e.target.value;
                                        setSparepart(newSpareparts);
                                    }}
                                    />
                                </Label>
                                <Label>
                                    Harga Sparepart:
                                    <Input type="number" 
                                    placeholder="Harga Sparepart" 
                                    name={`hargaSparepart-${i}`} 
                                    value={spareparts.HargaSparepart}
                                    onChange={(e) => {
                                        const newSpareparts = [...sparepart];
                                        newSpareparts[i].HargaSparepart = e.target.value;
                                        setSparepart(newSpareparts);
                                    }}
                                    />
                                </Label>
                                <Buttons2 type="button" onClick={() => {removeForms(i)}}>Hapus</Buttons2>
                                </SplitterSparepart>
                            ))}
                            <Buttons type="button" onClick={addForms}>+</Buttons>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Lokasi:
                                <Select placeholder="Lokasi Service"  name="lokasi" required>
                                    <option>{a.Lokasi}</option>
                                </Select>
                            </Label>
                            <Label>
                                Teknisi:
                                <Select placeholder="Kerjaan Siapa ?" value={isTeknisiUpdate} onChange={(e) => {IbnuController(e.target.value)}}  name="teknisi" required>
                                    <option>Amri</option>
                                    <option>Ibnu</option>
                                    <option>Rafi</option>
                                </Select>
                            </Label>
                            {isIbnu && 
                            <Label>
                                Harga Ibnu: 
                                <Input type="number" placeholder="Harga Ibnu Tanya Amri" name="hargaIbnu" required />
                            </Label>}
                            <Label>
                            Status:
                                <Select name='status' required>
                                <option value={'sudah diambil'}>sukses</option>
                                <option value={'sudah diambil'}>sudah diambil</option>
                                <option value={'claim garansi'}>claim garansi</option>
                                <option value={'cancel'}>cancel</option>
                                </Select>
                            </Label>
                            </Splitter>
                            <Splitter>
                            </Splitter>
                            <Splitter>
                                <ButtonGroup>
                                    <Buttons type="submit">Update</Buttons>
                                </ButtonGroup>
                            </Splitter>
                    </Form>
                    </FormCard>
                        
                    )}
                })}
                </Wrapper2>
                    </BasicSection2>
                ) : (
                <>
                    <SearchWrapper>
                        <LabelSearch>
                            Cek Nota:
                            <Input type="text" placeholder="Masukan Nomor Nota" onChange={(e) => {setCekNota(e.target.value.toLocaleUpperCase())}}/>
                        </LabelSearch>
                            <ButtonSearch onClick={(SearchNota)}>Cari Data</ButtonSearch>
                    </SearchWrapper>
                    {isCekNota && (
                    <>
                        {cekNotaSearch.map((a) => {

                            return(
                                <Container key={a.NoNota}>
                                    <Box>
                                        <Header>
                                            <div>{a.NoNota}</div>
                                            <div>{a.TglMasuk}</div>
                                        </Header>
                                        <Info>
                                            <LabelCard>Nama:</LabelCard><Value>{a.NamaUser}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>No Hp:</LabelCard><Value>{a.NoHpUser}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>Hp:</LabelCard><Value>{a.MerkHp}</Value>
                                        </Info>
                                        {/* OnCheck semua, untuk user Tampil */}
                                        <Info>
                                            <LabelCard>Kerusakan:</LabelCard><Value>{a.Kerusakan}</Value>
                                        </Info>
                                        <Line />
                                        <Info>
                                            <LabelCard>Teknisi:</LabelCard><Value>{a.Teknisi}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>Tgl Keluar:</LabelCard><Value>{(a.TglKeluar)}</Value>
                                        </Info>
                                        <StatusBox>
                                            {a.status.toLocaleUpperCase()}
                                        </StatusBox>
                                    </Box>
                                </Container>
                            )    
                        })}
                    </>
                    )}
                </>
                )}
            </WrapperContent>             
        </>}
        </Wrapper>
    );
}
const SearchWrapper = styled.div`
display: flex;
padding: 2rem;
align-items: center;
flex-direction: column;
`;


const Wrapper = styled.div`
width: 100%;
height: 100%;
align-item: center;
justify-content: center;
text-align: center;
padding-bottom: 12rem;
` 

const ErrorText = styled.h2`
color: rgb(var(--errorColor));
`

const Input = styled.input`
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  color: rgb(var(--text));
  border-radius: 0.6rem;
  max-width: 25rem;
  max-height: 2rem;
  text-align: center;
  font-size: 1.6rem;
  padding: 1.8rem;
  box-shadow: var(--shadow-md);

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`;

const Buttons = styled(Button)`
padding: 1rem;
font-size: 2rem;
`

const Buttons2 = styled(Button)`
padding: 1rem;
font-size: 2rem;
background-color: red;
`

const ButtonSearch = styled(Button)`
padding: 1rem;
margin-top: 1rem;
font-size: 1rem;
margin-left: 12px;
`

const LabelSearch = styled.label`
display: flex;
font-size: 1.8rem;
flex-direction: column;
padding: 1rem;
`

const WrapperContent = styled.div`
padding-top: 5rem;
display: absolute;

`

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: rgb(var(--text));
    margin-top: 1rem;
`;

const Wrapper2 = styled.div`
    position: relative;
    display: flex;
    width: 100%; 
    height: 100%;
    align-items: center;
    justify-content: center;
`;

const FormCard = styled.div`
    background: rgb(var(--cardBackground));
    padding: 2rem;
    border-radius: 10px;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 100%;
`;


const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 100%;
`;

const SplitterSparepart = styled.div`
overflow-x: auto;
`

const Splitter = styled.div` 
    display: flex;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    @media (max-width: 512px) {
        flex-direction: column;
    }
`

const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    align-items: center;
`;

const Select = styled.select`
width: 15rem;
background: rgb(var(--inputBackground));
color: rgb(var(--text));
overflow-y: auto;
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const WrapperLoading = styled.div`
display: flex;
justify-content: center;
align-items: center;
height: 100%;
width: 100%;
position: fixed;
top: 0;
left: 0;
background-color: rgba(255, 255, 255, 0.6);
`

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 2rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const Box = styled.div`
  border: 1px solid #000;
  padding: 16px;
  margin-bottom: 16px;
  width: 350px;
`;

const Header = styled.div`
  display: flex;
  font-size: 1.5rem;
  justify-content: space-between;
  border-bottom: 1px solid #000;
  padding-bottom: 8px;
  margin-bottom: 8px;
`;

const Line = styled.hr`
  border: none;
  border-top: 1px solid #000;
  margin: 8px 0;
`;

const LabelCard = styled.div`
  font-weight: bold;
  display: inline;
`;

const Value = styled.div`
  display: inline;
`;

const Info = styled.div`
  display: grid;
  font-size: 2rem;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

const StatusBox = styled.div`
  font-size: 2rem;
  font-weight: bold;
  border: 1px solid #000;
  padding: 8px;
  margin-top: 8px;
  text-align: center;

`;
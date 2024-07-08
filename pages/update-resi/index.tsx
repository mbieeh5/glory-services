/* eslint-disable import/order */
import { child, get, getDatabase, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import { getAuth } from "firebase/auth";

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
    Teknisi: string;
    status: string;
}

export default function UpdateResi() {
    const [noNotaSearch, setNoNotaSearch] = useState("");
    const [isLoading, setIsloading] = useState<Boolean>(false);
    const [recentServiceData, setRecentServiceData] = useState<DataRes[]>([]);
    const [isSearch, setIsSearch] = useState(false);
    const [serviceDataToEdit, setServiceDataToEdit] = useState<DataRes[]>([]);
    const [isError, setIsError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);
    const fakeKey = 1;
    
    const loadNextFiveItems = () => {
        setStartIndex(prevIndex => prevIndex + 5);
    };
    const loadPreviousFiveItems = () => {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 5));
    };
    
    const isSearchService = () => {
        setIsSearch(true)
        if (!noNotaSearch) {
            setIsError("Silahkan Masukan Nomor Nota");
            setIsSearch(false);
        } else {
            const DB = ref(getDatabase());
            get(child(DB, `Service/sandboxDS/${noNotaSearch}`))
                .then(async (data) => {
                    const Data = data.val() || {};
                    console.log(Data);
                    const Array:DataRes[] = Object.values({Data});
                    setServiceDataToEdit(Array);
                    setIsError("");
                    setRecentServiceData([]);
                    const statusBool = Data.status;
                    console.log(statusBool)
                    if(statusBool === 'process'){
                        setButtonDisabled(false);
                    }else{
                        setButtonDisabled(true);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching resi data:", error);
                    setIsError("Terjadi kesalahan saat mencari resi");
                });
            }
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
        const Kerusakan = formData.get('kerusakan')?.toString() || "null";
        const Harga = formData.get('hargaAkhir')?.toString() || "null";
        const Teknisi = formData.get('teknisi')?.toString() || "null";
        const status = formData.get('status')?.toString() || "null";

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
                    Harga,
                    Teknisi,
                    status
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
                        const pts = points + 5000
                        const unit = units + 1;
                            const pointData = {
                                [Penerima] : {
                                    nama: Penerima,
                                    point: pts,
                                    unit: unit,
                                }
                            }
                            if(status === 'sudah diambil'){
                                const pointRef = ref(getDatabase(), `Users/dataPenerima/`);
                                update(pointRef, pointData)
                            }
                    }).catch((err) => {
                        console.error(err);
                    });
            })
            .catch((error) => {
                console.error('Gagal menyimpan data:', error);
            });
    }

    const handleSearchFilter1 = (i:string) => {
        if(i === ''){
            alert('silahkan masukan kata Kunci Terlebih dahulu');
        }else{
            const DB = ref(getDatabase());
            get(child(DB, `Service/sandboxDS`))
            .then(async (snapshot) => {
                    console.log(1);
                    const Data = snapshot.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    const filterData = Array.filter(items => 
                        items.NoNota.toLowerCase().includes(i.toLowerCase()) ||
                        items.NamaUser.toLowerCase().includes(i.toLowerCase()) ||
                        items.MerkHp.toLowerCase().includes(i.toLowerCase()) ||
                        items.Kerusakan.toLowerCase().includes(i.toLowerCase()) ||
                        items.Penerima.toLowerCase().includes(i.toLowerCase()) ||
                        items.status.toLowerCase().includes(i.toLowerCase()) ||
                        items.status.toLowerCase().includes(i.toLowerCase())
                    )
                    setRecentServiceData(filterData);
                    setIsError("");
                })
                .catch((error) => {
                    console.error("Error fetching recent resi data:", error);
                    setIsError("Terjadi kesalahan saat mengambil data resi terbaru");
                });
        }
    } 

    const popUpModalFilter = () => {
        setIsModalOpen(true);
    }

    const closePopUpModalFilter = () => {
        setIsModalOpen(false);
    }
    useEffect(() => {
        setIsloading(true);
        setTimeout(() => {
            setIsloading(false);
            const DB = ref(getDatabase());
            const AuthG:any = getAuth();
            const role = AuthG.currentUser.email.split('@')[0];
            if(role === 'admin'){
                setIsAdmin(true);
                get(child(DB, `Service/sandboxDS`))
                .then(async (snapshot) => {
                    const Data = snapshot.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    setRecentServiceData(Array);
                    setIsError("");
                })
                .catch((error) => {
                    console.error("Error fetching recent resi data:", error);
                    setIsError("Terjadi kesalahan saat mengambil data resi terbaru");
                });
            }
        },3000)
    }, []);

    return (
        <Wrapper>
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
                        if(a.status === "sudah diambil"){
                                alert(`Status Service ${a.status} data tidak bisa di ubah!`)
                                return window.location.reload();
                            }else if(a.status === "cancel") {
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
                                <Input type="datetime-local" placeholder="null" name="tanggalKeluar" required/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Nama User:
                                <Input type="text" value={a.NamaUser} name="namaUser" readOnly/>
                            </Label>
                            <Label>
                                No Hp User:
                                <Input type="text" value={a.NoHpUser} name="noHpUser" readOnly/>
                            </Label>
                            <Label>
                                Penerima:
                                <Input type="text" value={a.Penerima} name="penerima" readOnly/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Merk Hp:
                                <Input type="text" value={a.MerkHp} name="merkHp" readOnly/>
                            </Label>
                            <Label>
                                Kerusakan:
                                <Input type="text" placeholder="Kerusakannya apa" value={a.Kerusakan} name="kerusakan" required/>
                            </Label>
                            <Label>
                                Estimasi Harga:
                                <Input type="number" value={a.Harga} name="hargaAwal" readOnly/>
                            </Label>
                            </Splitter>
                            <Label>
                                Harga Akhir:
                                <Input type="number" placeholder="Masukan Harga Akhir" name="hargaAkhir" required/>
                            </Label>
                            <Splitter>
                            <Label>
                                Teknisi:
                                <Select placeholder="Kerjaan Siapa ?"  name="teknisi" required>
                                    <option>Amri</option>
                                    <option>Ibnu</option>
                                    <option>Rafi</option>
                                </Select>
                            </Label>
                            <Label>
                            Status:
                                <Select name='status' required>
                                <option>cancel</option>
                                <option>sudah diambil</option>
                                </Select>
                            </Label>
                            </Splitter>
                            <Splitter>
                            </Splitter>
                            <Splitter>
                                <Buttons type="submit" disabled={buttonDisabled}>Update</Buttons>
                            </Splitter>
                    </Form>
                    </FormCard>
                        
                    )}
                })}
                </Wrapper2>
                    </BasicSection2>
                ) : (
                <>
                {isAdmin ? 
                <>
                    {recentServiceData && (
                        <BasicSection2 title="Recent Data Service">
                            <FilterWrapper>
                                <SearchWrapper>
                                    <Search>
                                        <Input placeholder="Masukan Kata Kunci" onChange={(e) => setSearchFilter(e.target.value)} />
                                            <ButtonSearch onClick={() => handleSearchFilter1(searchFilter)}>Cari</ButtonSearch>
                                    </Search>
                                    <FilterSearch>
                                        <ButtonFilter onClick={() => popUpModalFilter()}>...</ButtonFilter>
                                    </FilterSearch>
                                </SearchWrapper>
                            </FilterWrapper>
                                    <TableWrapper>
                                        <div>Total Service Total : {recentServiceData.length}</div>
                                        <Table>
                                            <thead>
                                            <TableRow>
                                                <TableHeader>No Nota</TableHeader>
                                                <TableHeader>Nama user</TableHeader>
                                                <TableHeader>Nomor HP User</TableHeader>
                                                <TableHeader>Tanggal Masuk</TableHeader>
                                                <TableHeader>Tanggal Keluar</TableHeader>
                                                <TableHeader>Merk HP</TableHeader>
                                                <TableHeader>Kerusakan</TableHeader>
                                                <TableHeader>Penerima</TableHeader>
                                                <TableHeader>Estimasi Harga</TableHeader>
                                                <TableHeader>Teknisi</TableHeader>
                                                <TableHeader>Status</TableHeader>
                                            </TableRow>
                                            </thead>
                            {recentServiceData.slice(startIndex, startIndex + 5).map((a, i) => (
                                <tbody key={i}>
                                                <TableRow>
                                                    <TableData key={i}>{a.NoNota}</TableData>
                                                    <TableData key={i}>{a.NamaUser}</TableData>
                                                    <TableData key={i}>{a.NoHpUser}</TableData>
                                                    <TableData key={i}>{a.TglMasuk}</TableData>
                                                    <TableData key={i}>{a.TglKeluar}</TableData>
                                                    <TableData key={i}>{a.MerkHp}</TableData>
                                                    <TableData key={i}>{a.Kerusakan}</TableData>
                                                    <TableData key={i}>{a.Penerima}</TableData>
                                                    <TableData key={i}>{a.Harga.toLocaleString('id')}</TableData>
                                                    <TableData key={i}>{a.Teknisi}</TableData>
                                                    <TableData key={i}>{a.status}</TableData>
                                                </TableRow>
                                                </tbody>
                                    ))}
                            </Table>
                        </TableWrapper>
                            <Buttons2 onClick={loadPreviousFiveItems}>Previous</Buttons2>
                            <Buttons2 onClick={loadNextFiveItems}>Next</Buttons2>
                        </BasicSection2>
                    )}
                </> : 
                <>

                </>}
                </>
                )}
            </WrapperContent>
            
            {/* Modal Section*/}
                {isModalOpen ? 
                <>
                <Modal isOpen={isModalOpen} onClose={closePopUpModalFilter}>
                <h2>Filter Data</h2>
                <div>
                <Label>Tanggal Masuk Awal:
                <Input type="date" />
                </Label>
                </div>
                <div>
                        <Label>Tanggal Masuk Akhir:
                        <Input type="date" />
                        </Label>
                    </div>
                    <div>
                        <Label>Tanggal Keluar Awal:
                        <Input type="date" />
                        </Label>
                    </div>
                    <div>
                        <Label>Tanggal Keluar Akhir:
                        <Input type="date" />
                        </Label>
                    </div>
                    <div>
                        <Label>Teknisi:
                            <Select>
                                <option value="rafi">Rafi</option>
                                <option value="amri">Amri</option>
                                <option value="ibnu">Ibnu</option>
                            </Select>
                        </Label>
                    </div>
                    <div>
                        <Label>Penerima:
                            <Select>
                                <option value="sindi">Sindi</option>
                                <option value="tiara">Tiara</option>
                                <option value="vina">Vina</option>
                                <option value="yuniska">Yuniska</option>
                            </Select>
                        </Label>
                    </div>
                    <div>
                        <Label>Status:
                            <Select>
                                <option value="sudah diambil">Sudah Diambil</option>
                                <option value="cancel">Cancel</option>
                                <option value="process">Process</option>
                            </Select>
                        </Label>
                    </div>
                    <button onClick={closePopUpModalFilter}>Tutup</button>
                    <button onClick={closePopUpModalFilter}>Filter Data</button>
                </Modal>
                </> 
                : 
                <>
                </>}
                
            </>}
        </Wrapper>
    );
}

const Modal = ({isOpen, onClose, children}:any) => {
    if(!isOpen) return null;

    return (
        <WrapperModal>
            <WrapperModalContent>
                <SpanClose onClick={onClose}>&times;</SpanClose>
                {children}
            </WrapperModalContent>
        </WrapperModal>
    );
};

const WrapperModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center; 
    align-items: center; 
    z-index: 999;
`;

const WrapperModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5); /* Efek bayangan untuk modal */
`;

const SpanClose = styled.span`
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 24px;
    color: #555;
`;

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

const ButtonSearch = styled(Button)`
padding: 1rem;
margin-top: 1rem;
font-size: 1.5rem;
`

const LabelSearch = styled.label`
display: flex;
font-size: 1.8rem;
flex-direction: column;
padding: 1rem;
`

const Buttons2 = styled(Button)`
padding: 1rem;
margin-top: 2rem;
width: 15rem;
height: 7rem;
margin-left: 2rem;
font-size: 100%;
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

const TableWrapper = styled.div` 
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Table = styled.table`
max-width: 80%;
  border-collapse: collapse;
  table-layout: auto;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  width: 25rem;
  background-color: #4caf50;
  color: rgb(0,0,0);
  `;
  
  const TableData = styled.td`
  padding: 2rem;
  max-width: 100%;
  border-bottom: 1px solid #ddd;
  color: rgb(var(--text));
  white-space: nowrap;
  word-wrap: break-word;
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
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`

const FilterWrapper = styled.div`

`

const FilterSearch = styled.div`
padding-top: 1rem;
`

const Search = styled.div`

`
const ButtonFilter = styled.button`
background: rgb(var(--inputBackground));
color: rgb(var(--text));
border: none;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
border-radius: 1rem;
width: 4.5rem;
font-size: 3rem;
padding: 0.5rem;
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
background-color: rgba(255, 255, 255, 0.8);
`

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;
/* eslint-disable import/order */
import BasicSection2 from "components/BasicSection2"
import { child, get, getDatabase, ref, remove, update } from "firebase/database";
import Button from "components/Button";
import { useEffect, useState } from "react"
import styled from "styled-components"


interface DataRes {
    ATA: string;
    ATD: string;
    ETA: string;
    ETD: string;
    deliveryFrom: string;
    destination: string;
    goodsName: string;
    namaU: string;
    locations: {
        loct: string;
        dateTime: string;
    };
    noResi: string;
    status: string;
    timeMake: string;
}

export default function UpdateResi() {
    const [noResiSearch, setNoResiSearch] = useState("");
    const [recentResiData, setRecentResiData] = useState<DataRes[]>([]);
    const [isSearch, setIsSearch] = useState(false);
    const [resiDataToEdit, setResiDataToEdit] = useState<DataRes[]>([]);
    const [isError, setIsError] = useState("");
    const [etd, setEtd] = useState("");
    const [eta, setEta] = useState("");
    const [atd, setAtd] = useState("");
    const [ata, setAta] = useState("");
    const [namaU, setNamaU] = useState("");
    const [goods, setGoods] = useState("");
    const [dest, setDest] = useState("");
    const [from, setFrom] = useState("");
    const [status, setStatus] = useState("");
    const [locations, setLocations] = useState({});
    const [startIndex, setStartIndex] = useState(0);
    const fakeKey = 1;
    
    const loadNextFiveItems = () => {
        setStartIndex(prevIndex => prevIndex + 5);
    };
    const loadPreviousFiveItems = () => {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 5));
    };
    
    
    const isSearchResi = () => {
        setIsSearch(true)
        if (!noResiSearch) {
            setIsError("Silahkan Masukan Nomor Resi");
            setIsSearch(false);
        } else {
            const DB = ref(getDatabase());
            get(child(DB, `dataInput/resi/${noResiSearch}`))
                .then(async (data) => {
                    const Data = data.val() || {};
                    setEtd(Data[noResiSearch].ETD);
                    setEta(Data[noResiSearch].ETA);
                    setAtd(Data[noResiSearch].ATD);
                    setAta(Data[noResiSearch].ATA);
                    setNamaU(Data[noResiSearch].namaU);
                    setStatus(Data[noResiSearch].status);
                    setGoods(Data[noResiSearch].goodsName);
                    setDest(Data[noResiSearch].destination);
                    setFrom(Data[noResiSearch].deliveryFrom);
                    setLocations(Data[noResiSearch].locations || {});
                    const Array:DataRes[] = Object.values(Data);
                    setResiDataToEdit(Array);
                    setIsError("");
                    setRecentResiData([]);

                })
                .catch((error) => {
                    console.error("Error fetching resi data:", error);
                    setIsError("Terjadi kesalahan saat mencari resi");
                });
            }
    };
    
    const removeLocation = (index: number) => {
        const newLocations:any = { ...locations };
        delete newLocations[`${index + 1}loct`];
        delete newLocations[`${index + 1}dateTime`];
        setLocations(newLocations);
    };
    
    const addLocation = () => {
        const newIndex = Object.keys(locations).length + 1;
        setLocations(prevLocations => ({
            ...prevLocations,
            [`${newIndex}loct`]: ""
        }));
    };
    
    const setTimes = (newValue: string, index: number) => {
        const newLocations:any = { ...locations };
        const locationKey = `${index + 1}loct`;
        newLocations[locationKey] = { 
            ...newLocations[locationKey],
            dateTime: newValue
          };
          setLocations(newLocations)
      };

    const handleLocationChange = (value: string, index: number) => {
        const newLocations:any = { ...locations };
        const locationKey = `${index + 1}loct`;
        newLocations[locationKey] = { 
            ...newLocations[locationKey],
            loct: value
          };
          setLocations(newLocations); 
      };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const noResi = formData.get('noResi');
        const noResiString:string = noResi?.toString() || "";
        const namaU = formData.get('custName');
        const timeMake = formData.get('inputDate');
        const goodsName = formData.get('goodsName');
        const deliveryFrom = formData.get('deliveryFrom');
        const destination = formData.get('destination');
        const ETD = formData.get('ETD');
        const ETA = formData.get('ETA');
        const ATD = formData.get('ATD');
        const ATA = formData.get('ATA');
            const newData = {
                [noResiString] : {
                    noResi,
                    namaU,
                    timeMake,
                    goodsName,
                    deliveryFrom, 
                    destination,
                    ETD,
                    ETA,
                    ATD,
                    ATA,
                    status,
                    locations,
                }
            };
        //console.log(newData);
        const resiRef = ref(getDatabase(), `dataInput/resi/${noResi}`);
        update(resiRef, newData)
        .then(() => {
            alert('Resi Berhasil di Update')
            e.target.reset();
            window.location.reload();
        })
        .catch((error) => {
            console.error('Gagal menyimpan data:', error);
        });
    }

    const handleDeleteResi = (i: string) => {
        const confirmDelete = window.confirm(`Apakah Kamu Yakin Akan Menghapus ${i} ?`)
        if(confirmDelete){
          try {
            const DB = getDatabase();
            const featuresRef = ref(DB, `dataInput/resi/${i}`);
            remove(featuresRef);
            window.location.reload();
            alert(`Resi telah dihapus: ${i}`);
          } catch (error) {
            console.error('Error deleting partner:', error);
          }
        }
    }

    useEffect(() => {

            const DB = ref(getDatabase());
            get(child(DB, `dataInput/resi`))
                .then(async (snapshot) => {
                    const Data = snapshot.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    setRecentResiData(Array);
                    setIsError("");
                })
                .catch((error) => {
                    console.error("Error fetching recent resi data:", error);
                    setIsError("Terjadi kesalahan saat mengambil data resi terbaru");
                });
    }, []);

    return (
        <Wrapper>
            <>
            <SearchWrapper>
                <LabelSearch>
                    Cari Resi:
                <Input type="text" placeholder="Cari Nomor Resi" onChange={(e) => setNoResiSearch(e.target.value.toUpperCase())} />
                </LabelSearch>
                <ButtonSearch onClick={(isSearchResi)}>Cari Resi</ButtonSearch>
            </SearchWrapper>
            <ErrorText>{isError}</ErrorText>
            <Divider />
            <WrapperContent>
                {isSearch ? (
                    <BasicSection2 title="Update Resi Data">
                <Wrapper2>
                    {resiDataToEdit.map((a) => {
                        return(
                    <FormCard key={fakeKey}>
                    <Form onSubmit={handleSubmit}>
                        <Label>
                            Resi Number:
                            <Input type="text" placeholder="Resi ID" value={a.noResi} name="noResi" readOnly/>
                        </Label>
                        <Splitter>
                        <Label>
                            POD Date:
                            <Input type="datetime-local" value={a.timeMake} name="inputDate" readOnly/>
                        </Label>
                        <Label>
                            Customer Name:
                            <Input type="text" placeholder="Customer Name" value={namaU} onChange={(e) => setNamaU(e.target.value)} name="custName" required/>
                        </Label>
                        <Label>
                            Goods Name:
                            <Input type="text" placeholder="Goods Name" value={goods} onChange={(e) => setGoods(e.target.value)} name="goodsName" required/>
                        </Label>
                        </Splitter>
                        <Splitter>
                        <Label>
                            Delivery To:
                            <Input type="text" placeholder="Destination" value={dest} onChange={(e) => setDest(e.target.value)} name="destination" required/>
                        </Label>
                        <Label>
                            Delivery From:
                            <Input type="text" placeholder="Delivery From" value={from} onChange={(e) => setFrom(e.target.value)} name="deliveryFrom" required/>
                        </Label>
                        <Label>
                        Status:
                            <Input type="text" placeholder="Delivery Status ?" value={status} onChange={(e) =>  setStatus(e.target.value)}/>
                        </Label>
                        </Splitter>
                        <Splitter>
                        <Label>
                        Estimated Time Departure:
                            <Input type="datetime-local" placeholder="ETD" value={etd} onChange={(e) => setEtd(e.target.value)} name="ETD"/>
                        </Label>
                        <Label>
                        Estimated Time Arrival:
                            <Input type="datetime-local" placeholder="ETA" value={eta} onChange={(e) => setEta(e.target.value)} name="ETA"/>
                        </Label>
                        </Splitter>
                        <Splitter>
                        <Label>
                        Actual Time Departure:
                            <Input type="datetime-local" placeholder="ATD" value={atd} onChange={(e) => setAtd(e.target.value)} name="ATD"/>
                        </Label>
                        <Label>
                        Actual Time Arrival:
                            <Input type="datetime-local" placeholder="ATA" value={ata} onChange={(e) => setAta(e.target.value)} name="ATA"/>
                        </Label>
                        </Splitter>
                        <Splitter>
                        <Label>
                            Location Update:
                            {Object.entries(locations).map(([key, value]:any, index) => (
                                <div key={key}>
                                <Input
                                    type="text"
                                    placeholder={`Location ${index + 1}`}
                                    value={value.loct}
                                    onChange={(e) => handleLocationChange(e.target.value, index)}
                                    required
                                    />
                                <Input
                                    type="datetime-local"
                                    placeholder={`Date Time for Location ${index + 1}`}
                                    value={value.dateTime}
                                    onChange={(e) => setTimes(e.target.value, index)}
                                    required
                                />
                                <Buttons3 type="button" onClick={() => removeLocation(index)}>X</Buttons3>
                                </div>
                            ))}
                            <ButtonsAdd type="button" onClick={addLocation}>+</ButtonsAdd>
                            </Label>
                        </Splitter>
                        <Splitter>
                            <Buttons type="submit">Update</Buttons>
                        </Splitter>
                    </Form>
                    </FormCard>
                        )
                    })}
                </Wrapper2>
                    </BasicSection2>
                ) : (
                    <>
                    {recentResiData && (
                        <BasicSection2 title="Update Data Resi">
                                    <TableWrapper>
                                        <Table>
                                            <thead>
                                            <TableRow>
                                                <TableHeader>Resi ID</TableHeader>
                                                <TableHeader>Customer Name</TableHeader>
                                                <TableHeader>Goods Name</TableHeader>
                                                <TableHeader>POD Time</TableHeader>
                                                <TableHeader>Delivery From</TableHeader>
                                                <TableHeader>Delivery To</TableHeader>
                                                <TableHeader>ETA</TableHeader>
                                                <TableHeader>ETD</TableHeader>
                                                <TableHeader>ATD</TableHeader>
                                                <TableHeader>ATA</TableHeader>
                                                <TableHeader>Latest Location</TableHeader>
                                                <TableHeader>Status</TableHeader>
                                                <TableHeader>Action</TableHeader>
                                            </TableRow>
                                            </thead>
                            {recentResiData.slice(startIndex, startIndex + 5).map((a) => (
                                    Object.values(a).map((data, i) => {
                                        return(
                                                <tbody key={i}>
                                                <TableRow>
                                                    <TableData key={i}>{data.noResi}</TableData>
                                                    <TableData key={i}>{data.namaU}</TableData>
                                                    <TableData key={i}>{data.goodsName}</TableData>
                                                    <TableData key={i}>{data.timeMake}</TableData>
                                                    <TableData key={i}>{data.deliveryFrom}</TableData>
                                                    <TableData key={i}>{data.destination}</TableData>
                                                    <TableData key={i}>{data.ETA || "N/A"}</TableData>
                                                    <TableData key={i}>{data.ETD || "N/A"}</TableData>
                                                    <TableData key={i}>{data.ATD || "N/A"}</TableData>
                                                    <TableData key={i}>{data.ATA || "N/A"}</TableData>
                                                    <TableData key={i}>
                                                    {data.locations && (Object.values(data.locations) as any[]).slice(-1)[0].loct || "N/A"}
                                                    </TableData>
                                                    <TableData key={i}>{data.status}</TableData>
                                                    <TableData key={i}><Buttons3 onClick={() => handleDeleteResi(data.noResi)}>Delete?</Buttons3></TableData>
                                                </TableRow>
                                                </tbody>
                                            )
                                        })   
                                    ))}
                            </Table>
                        </TableWrapper>
                            <Buttons2 onClick={loadPreviousFiveItems}>Previous</Buttons2>
                            <Buttons2 onClick={loadNextFiveItems}>Next</Buttons2>
                        </BasicSection2>
                    )}
                
                </>
                )}
            </WrapperContent>
            </>
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

const Buttons3 = styled(Button)`
padding: 1rem;
font-size: 100%;
background-color: red;
border: none;
`

const ButtonsAdd = styled(Button)`
padding: 1rem;
width: 5rem;
margin-top: 2rem;
margin-bottom: 2rem;
font-size: 2rem;
background-color: green;
border: none;
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
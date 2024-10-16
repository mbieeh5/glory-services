/* eslint-disable import/order */
import { Table as AntdTable, TableProps, Tag, } from "antd";
import styled from "styled-components";
import React, { ReactNode,} from "react";

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
  Imei: string;
  sparepart: SparepartData[];
  HargaIbnu: number;
  Teknisi: string;
  Lokasi: string;
  status: string;
}

interface SparepartData {
  Sparepart: string;
  HargaSparepart: string;
  TypeOrColor: string;
}

const dateFormater = (date:string) => {
    const TglObj = new Date(date);
    const tgl = TglObj.getDate();
    const bln = TglObj.getMonth() + 1;
    const thn = TglObj.getFullYear();
    const jam = TglObj.getHours();
    const mnt = TglObj.getMinutes();
    const tanggalWaktuBaru = ("0" + tgl).slice(-2) + "/" + ("0" + bln).slice(-2) + "/" + thn + " @" + ("0" + jam).slice(-2) + ":" + ("0" + mnt).slice(-2);
    if(!isNaN(tgl)){
        return tanggalWaktuBaru
    }else{
        return 'Belum Di Ambil'
    }
}

const colors = ["geekblue", "green", "gold", "cyan", "magenta", "purple", "orange"];

const getColor = (index: number) => colors[index % colors.length];

const Columns: TableProps<DataRes>["columns"] = [
    {
        title: "LOKASI",
        dataIndex: "Lokasi",
        key: "Lokasi",
        width: 71,
        render: (text) => text.toLocaleUpperCase(),
    },
    {
        title: "TANGGAL MASUK",
        dataIndex: "TglMasuk",
        key: "TglMasuk",
        width: 140,
        align: "center",
        render: (text) => dateFormater(text)
    },
    {
        title: "MEREK HP",
    dataIndex: "MerkHp",
    key: "MerkHp",
    width: 160,  
    align: "center",
    render: (text) => text.toLocaleUpperCase(),
  },
  {
    title: "KERUSAKAN",
    dataIndex: "Kerusakan",
    key: "Kerusakan",
    width: 170,
    align: "center",
    render: (text) => text.toLocaleUpperCase(),
},
  {
      title: "SPAREPARTS",
    dataIndex: "sparepart",
    key: "sparepart",
    width: 210,
    align: "center",
    render: (_, { sparepart }) => (
        <>
        {sparepart?.map((item, index) => {
            const color = getColor(index);
          return (
            <>
            <Tag key={`${item.Sparepart}-${index}`} color={color}>
              {item.Sparepart.toLocaleUpperCase()}({item.TypeOrColor})
            </Tag>
              <Tag color={color}>Rp {parseInt(item.HargaSparepart).toLocaleString()}</Tag>
            </>
          );
        })}
      </>
    ),
  },
  {
      title: "HARGA USER",
      dataIndex: "Harga",
      key: "Harga",
    width: 101,
    align: 'center',
    render: (value) => `Rp${parseInt(value).toLocaleString()}`,
  },
  {
      title: "IMEI",
      dataIndex: "Imei",
      key: "Imei",
      align: 'center',
      ellipsis: true,
    },
    {
        title: "NAMA USER",
        dataIndex: "NamaUser",
    key: "NamaUser",
    ellipsis: true,
},
{
      title: "NO.USER",
      dataIndex: "NoHpUser",
      key: "NoHpUser",
      ellipsis: true,
},
{
    title: "TEKNISI",
    dataIndex: "Teknisi",
    key: "Teknisi",
    ellipsis: true,
},
{
    title: "HARGA IBNU",
    dataIndex: 'HargaIbnu',
    key: "HargaIbnu",
    ellipsis: true,
    render: (text) => text ? `Rp ${parseInt(text).toLocaleString()}` : 'Rp 0',
},
{
    title: "PENERIMA",
    dataIndex: "Penerima",
    key: "Penerima",
    ellipsis: true,
},
{
    title: "NO NOTA",
    dataIndex: "NoNota",
    key: "NoNota",
    align: "center",
    ellipsis: true,
},
{
    title: "TANGGAL KELUAR",
    dataIndex: "TglKeluar",
    key: "TglKeluar",
    align: "center",
    ellipsis: true,
    render: (text) => text ? (text === 'null' ? 'BELUM DIAMBIL' : dateFormater(text)) : 'BELUM DIAMBIL'
},
{
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    ellipsis: true, 
    render: (status) => (
        <Tag color={status === "sukses" ? "green" : status === "process" ? 'yellow' : status === 'cancel' ? "red" : 'warning'}>{status}</Tag>
    ),
  },
];

interface TableComponentProps {
  data: DataRes[];
}

const Table: React.FC<TableComponentProps> = ({ data }) => {
    return (
        <>
            <AntdTable<DataRes> 
            columns={Columns} 
            dataSource={data} 
            rowKey="NoNota" 
            size={"small"}
            scroll={{ x: 'calc(1100px + 50%', y: 130 * 5 }}
            components={{
                header: 
                {
                    
                },
                body: 
                {
                    row: (props: { children: ReactNode; "data-row-key" ?: string}) => {
                        const {children, ...rest} = props;
                        const record = rest["data-row-key"] ? data.find((d) => d.NoNota === rest["data-row-key"]) : undefined
                        return (
                            <StyledRow status={record?.status || ""} tglKeluar={record?.TglKeluar || null} {...rest}>
                                {children}
                            </StyledRow>
                            );
                        },
                },  
            }}
            />
        </>
        )
};


const StyledRow = styled.tr<{ status: string; tglKeluar: string | null }>`
  background-color: ${({ status, tglKeluar }) => {
    if (status === "sukses" && tglKeluar === "null") return "#5EE7EC";
    if (status === "sukses") return "#12D200";
    if (status === "process") return "#EDE835";
    if (status === "process" && tglKeluar === 'null') return "#F57E7E";
    return "#DB3759";
  }};
  font-size: 12px;
`;

export default Table;

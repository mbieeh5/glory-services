/* eslint-disable import/order */
import { Table as AntdTable, TableProps, Tag, } from "antd";
import styled from "styled-components";
import React, { createContext, ReactNode,  useContext, useState } from "react";
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
  } from '@dnd-kit/sortable';


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

interface HeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
    id: string;
}

interface BodyCellProps extends React.HTMLAttributes<HTMLTableElement> {
    id: string;
}

interface DragIndexState {
    active: UniqueIdentifier;
    over: UniqueIdentifier | undefined;
    direction?: 'left' | 'right';
}


const DragIndexContext = createContext<DragIndexState>({ active: -1, over: 1 });

const dragActiveStyle = (dragState: DragIndexState, id: string) => {
    const { active, over, direction} = dragState;

    let style: React.CSSProperties = {};
    if(active && active === id) {
        style = {background: 'gray', opacity: 0.5};
    }
    else if(over && id === over && active !== over){
        style = 
            direction === 'right'
            ? {borderRight: '1px dashed gray'}
            : {borderLeft: '1px dashed gray'}
    }
    return style
};

const TableBodyCell: React.FC<BodyCellProps> = (props) => {
    const dragState = useContext(DragIndexContext);
  
    // Spread hanya props valid untuk <td>
    const { style, id, ...restProps } = props;
  
    return (
      <td
        {...(restProps as React.TdHTMLAttributes<HTMLTableDataCellElement>)} // Cast props ke TdHTMLAttributes
        style={{ ...style, ...dragActiveStyle(dragState, id) }}
      />
    );
  };
  

const TableHeaderCell: React.FC<HeaderCellProps> = (props) => {
    const dragState = useContext(DragIndexContext);
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: props.id });
    const style: React.CSSProperties = {
      ...props.style,
      cursor: 'move',
      ...(isDragging ? { position: 'relative', zIndex: 9999, userSelect: 'none' } : {}),
      ...dragActiveStyle(dragState, props.id),
    };
    return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
  };

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

const baseColumns: TableProps<DataRes>["columns"] = [
  {
    title: "No Nota",
    dataIndex: "NoNota",
    key: "NoNota",
    width: 110
},
{
    title: "Tanggal Masuk",
    dataIndex: "TglMasuk",
    key: "TglMasuk",
    width: 106,
    render: (text) => dateFormater(text)
},
{
    title: "Tanggal Keluar",
    dataIndex: "TglKeluar",
    key: "TglKeluar",
    width: 106,
    render: (text) => text ? (text === 'null' ? 'BELUM DIAMBIL' : dateFormater(text)) : 'BELUM DIAMBIL'
  },
  {
    title: "Merek HP",
    dataIndex: "MerkHp",
    key: "MerkHp",
    width: 100,  
  },
  {
    title: "Kerusakan",
    dataIndex: "Kerusakan",
    key: "Kerusakan",
    width: 110,
  },
  {
    title: "Spareparts",
    dataIndex: "sparepart",
    key: "sparepart",
    width: 190,
    render: (_, { sparepart }) => (
      <>
        {sparepart?.map((item, index) => {
          const color = getColor(index);
          return (
            <>
            <Tag key={`${item.Sparepart}-${index}`} color={color}>
              {item.Sparepart}({item.TypeOrColor})
            </Tag>
              <Tag color={color}>Rp {parseInt(item.HargaSparepart).toLocaleString()}</Tag>
            </>
          );
        })}
      </>
    ),
  },
  {
    title: "Harga User",
    dataIndex: "Harga",
    key: "Harga",
    width: 110,
    render: (value) => `Rp${parseInt(value).toLocaleString()}`,
  },
  {
    title: "Imei",
    dataIndex: "Imei",
    key: "Imei",
    ellipsis: true,
  },
  {
    title: "Nama User",
    dataIndex: "NamaUser",
    key: "NamaUser",
  },
  {
    title: "No Hp User",
    dataIndex: "NoHpUser",
    key: "NoHpUser",
    ellipsis: true,
  },
  {
    title: "Lokasi",
    dataIndex: "Lokasi",
    key: "Lokasi",
  },
  {
    title: "Teknisi",
    dataIndex: "Teknisi",
    key: "Teknisi",
  },
  {
    title: "Harga Ibnu",
    dataIndex: 'HargaIbnu',
    key: "HargaIbnu",
    render: (text) => text ? `Rp ${parseInt(text).toLocaleString()}` : 'Rp 0',
  },
  {
    title: "Penerima",
    dataIndex: "Penerima",
    key: "Penerima",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status === "sukses" ? "green" : status === "process" ? 'yellow' : status === 'cancel' ? "red" : 'warning'}>{status}</Tag>
    ),
  },
];

interface TableComponentProps {
  data: DataRes[];
}

const Table: React.FC<TableComponentProps> = ({ data }) => {
    const [dragIndex, setDragIndex] = useState<DragIndexState>({ active: -1, over: -1 });

    const [columns, setColumns] = useState(() =>
        baseColumns.map((column, i) => ({
        ...column,
        key: `${i}`,
        onHeaderCell: () => ({ id: `${i}` }),
        onCell: () => ({ id: `${i}` }),
      })),
    );
  
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 1,
        },
      }),
    );
  
    const onDragEnd = ({ active, over }: DragEndEvent) => {
      if (active.id !== over?.id) {
        setColumns((prevState) => {
          const activeIndex = prevState.findIndex((i) => i.key === active?.id);
          const overIndex = prevState.findIndex((i) => i.key === over?.id);
          return arrayMove(prevState, activeIndex, overIndex);
        });
      }
      setDragIndex({ active: -1, over: -1 });
    };
  
    const onDragOver = ({ active, over }: DragOverEvent) => {
      const activeIndex = columns.findIndex((i) => i.key === active.id);
      const overIndex = columns.findIndex((i) => i.key === over?.id);
      setDragIndex({
        active: active.id,
        over: over?.id,
        direction: overIndex > activeIndex ? 'right' : 'left',
      });
    };



    return (
        <DndContext
        sensors={sensors}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={closestCenter}
        >
            <SortableContext items={columns.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
                <DragIndexContext.Provider value={dragIndex}>
                    <AntdTable<DataRes> 
                    columns={columns} 
                    dataSource={data} 
                    rowKey="NoNota" 
                    size={"small"}
                    pagination={false}
                    scroll={{ x: 'calc(1100px + 50%', y: 130 * 5 }}
                    components={{
                        header: {cell: TableHeaderCell},
                        body: 
                        {
                            cell: TableBodyCell,
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
                    </DragIndexContext.Provider>
            </SortableContext>
            <DragOverlay>
            <th style={{ backgroundColor: 'gray', padding: 16 }}>
                {columns[columns.findIndex((i) => i.key === dragIndex.active)]?.title as React.ReactNode}
            </th>
            </DragOverlay>
    </DndContext>
    )
};


const StyledRow = styled.tr<{ status: string; tglKeluar: string | null }>`
  background-color: ${({ status, tglKeluar }) => {
    if (status === "sukses" && tglKeluar === "null") return "#a0f7fa";
    if (status === "sukses") return "#d3edaa";
    if (status === "process") return "#fff3cd"; 
    return "#f8d7da";
  }};
`;

export default Table;

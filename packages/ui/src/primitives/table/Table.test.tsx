import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, type TableColumn } from './Table';

interface Row {
  id: number;
  name: string;
  age: number;
}

const data: Row[] = [
  { id: 1, name: 'Alice', age: 20 },
  { id: 2, name: 'Bob', age: 30 },
];

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
];

describe('Table', () => {
  it('renders header titles', () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText('姓名')).toBeTruthy();
    expect(screen.getByText('年龄')).toBeTruthy();
  });

  it('renders all rows', () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    render(<Table columns={columns} data={[]} rowKey={(r) => r.id} empty="无记录" />);
    expect(screen.getByText('无记录')).toBeTruthy();
  });

  it('shows loading state', () => {
    render(<Table columns={columns} data={[]} rowKey={(r) => r.id} loading />);
    expect(screen.getByText('加载中...')).toBeTruthy();
  });

  it('uses render function when provided', () => {
    render(
      <Table
        columns={[{ key: 'name', title: '姓名', render: (r) => `(${r.name})` }]}
        data={data}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('(Alice)')).toBeTruthy();
  });

  it('fires onRowClick', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0]).toEqual(data[0]);
  });
});

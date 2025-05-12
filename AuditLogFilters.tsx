import React, { useState } from 'react';
import { DatePicker, Select, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

const AuditLogFilters: React.FC = () => {
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  const handleDateChange = (dates: [moment.Moment, moment.Moment] | null) => {
    setDateRange(dates);
  };

  const handleActionTypeChange = (value: string) => {
    setActionType(value);
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
  };

  return (
    <div className="audit-log-filters">
      <RangePicker
        value={dateRange}
        onChange={handleDateChange}
        style={{ marginRight: 8 }}
      />
      <Select
        placeholder="Select action type"
        value={actionType}
        onChange={handleActionTypeChange}
        style={{ width: 200, marginRight: 8 }}
      >
        <Select.Option value="create">Create</Select.Option>
        <Select.Option value="update">Update</Select.Option>
        <Select.Option value="delete">Delete</Select.Option>
      </Select>
      <Button
        type="primary"
        icon={<FilterOutlined />}
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default AuditLogFilters;
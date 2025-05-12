import { DateRange } from '@/types/shared';
import React, { useState } from 'react';
import { DatePicker } from 'antd';

const DateRangePicker = () => {
  const [dateRange, setDateRange] = useState<Partial<DateRange>>({});

  const handleDateChange = (range: Partial<DateRange>) => {
    if (range.from) {
      // Ensure `from` is always defined
      console.log('Start date:', range.from);
    }
    if (range.to) {
      console.log('End date:', range.to);
    }
    setDateRange(range);
  };

  return (
    <div>
      <DatePicker.RangePicker
        onChange={(dates) => {
          handleDateChange({
            from: dates ? dates[0].toDate() : undefined,
            to: dates ? dates[1].toDate() : undefined,
          });
        }}
      />
    </div>
  );
};

export default DateRangePicker;
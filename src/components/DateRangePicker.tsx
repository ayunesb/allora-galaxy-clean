
import { DateRange } from '@/types/shared';
import { DatePicker } from 'antd';

const DateRangePicker = () => {
  const handleDateChange = (range: Partial<DateRange>) => {
    if (range.from) {
      // Ensure `from` is always defined
      console.log('Start date:', range.from);
    }
    if (range.to) {
      console.log('End date:', range.to);
    }
  };

  return (
    <div>
      <DatePicker.RangePicker
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            handleDateChange({
              from: dates[0].toDate(),
              to: dates[1].toDate(),
            });
          } else {
            handleDateChange({
              from: undefined,
              to: undefined,
            });
          }
        }}
      />
    </div>
  );
};

export default DateRangePicker;

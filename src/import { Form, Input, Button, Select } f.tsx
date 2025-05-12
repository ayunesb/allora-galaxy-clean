import { Form, Input, Button, Select } from "antd"; // Ensure 'antd' is installed
import { AuditLogFiltersProps } from "../../../types/admin";

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({ filters, setFilters }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setFilters(values);
  };

  return (
    <Form form={form} layout="inline" onFinish={onFinish}>
      <Form.Item name="user" label="User">
        <Input placeholder="User" />
      </Form.Item>
      <Form.Item name="action" label="Action">
        <Select placeholder="Select an action">
          <Select.Option value="create">Create</Select.Option>
          <Select.Option value="update">Update</Select.Option>
          <Select.Option value="delete">Delete</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuditLogFilters; // Keep only one default export
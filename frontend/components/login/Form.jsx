import { Button, Input } from "antd";

export default function Form() {
  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, type: "email" }]}
      >
        <Input size="large" prefix={<UserOutlined />} />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password size="large" prefix={<LockOutlined />} />
      </Form.Item>

      <Button
        type="primary"
        size="large"
        htmlType="submit"
        loading={loading}
        block
        className="rounded-md"
      >
        Sign in
      </Button>
    </Form>
  );
}

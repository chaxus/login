import * as React from 'react';
import { useCallback } from 'react';
import { Form, Button } from 'antd';

export default function SearchForm(props: any) {
  const { children, extraButtons, handleSearch, initialValues } = props;
  const [form] = Form.useForm();

  const onFinish = useCallback(values => {
    handleSearch(values);
  }, [handleSearch]);

  const onClick = () => {
    const values = form.getFieldsValue();
    onFinish(values);
  };

  return (
    <div className="search-container">
      <div className="search-form">
        <div className="form-container">
          <Form layout='inline' form={form} onFinish={onFinish} initialValues={initialValues}>
            {children}
          </Form>
        </div>
        <div className="button-container">
          <Button htmlType="submit" type="primary" onClick={onClick}>查询</Button>
          {extraButtons}
        </div>
      </div>
    </div>
  );
}

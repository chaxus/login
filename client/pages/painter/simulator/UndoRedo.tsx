import { connect } from 'react-redux'
import * as React from 'react';
import { bindActions, bindState } from '@/lib/redux';
import { Button, Divider } from 'antd';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';

class UndoRedo extends React.Component<any, any> {
  componentDidMount() {
    const { clearHistory } = this.props;
    clearHistory()
  }

  render() {
    const { canUndo, canRedo, undo, redo } = this.props;
    return (
      <div className="opt-layLeft">
        <Button type="text" className="opt-vertical" onClick={undo} size="small" disabled={!canUndo}>
          <UndoOutlined />
          <div>撤销</div>
        </Button>
        <Divider />
        <Button type="text" className="opt-vertical" onClick={redo} size="small" disabled={!canRedo}>
          <RedoOutlined />
          <div>重做</div>
        </Button>
      </div>
    )
  }
}

export default connect(
  bindState,
  bindActions(),
)(UndoRedo);

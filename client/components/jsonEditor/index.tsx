/*
 * @Author: ran
 * @Date: 2022-02-26 12:21:13
 * @LastEditors: ran
 * @LastEditTime: 2022-03-01 20:54:46
 */
import * as React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2-react-17'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
// 折叠代码
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
// 括号匹配
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/lint/lint.css';
// JSON语法校验
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
const jsonlint = require('jsonlint-mod');

window.jsonlint = jsonlint;

interface Props {
  value?: string,
  editorDidMount?: (editor: any, value: string, cb: () => void) => void
}
export default class JsonEditor extends React.Component<Props, {}> {
  render() {
    const { value, editorDidMount } = this.props;
    return (
      <CodeMirror
        editorDidMount={editorDidMount}
        value={JSON.stringify(value, null, '\t')}
        options={{
          mode: 'application/json',
          theme: 'material',
          lineNumbers: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
          lint: true,
          matchBrackets: true,
          autoCloseBrackets: true,
        }}
      />
    )
  }
}

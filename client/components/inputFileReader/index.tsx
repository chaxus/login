import * as React from 'react';
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx';

interface InputFileReaderProps {
  btnText: string,
  accept: string,
  xlsx: boolean,
  onChange: (data: any[]) => {},
}

function InputFileReader(props: InputFileReaderProps) {
  const { btnText = '导入文件', accept = '', xlsx = false, onChange } = props
  const [file, setFile] = useState<File | null>(null)
  const filename = (file && file.name) || ''
  const fileform = useRef<HTMLFormElement>(null)

  const handleChange = (fileContent: any) => {
    if (onChange && typeof onChange === 'function') {
      if (xlsx) {
        const workSheet = XLSX.read(fileContent, { type: 'array' });
        // 统一表格解析后的格式
        const data = Object.keys(workSheet.Sheets).map((name) => {
          const sheet = workSheet.Sheets[name];
          return { name, data: XLSX.utils.sheet_to_json(sheet, { header: 1 }) };
        });
        onChange(data);
      } else {
        let originalArr = fileContent.replace(/\r/g, '\n');
        originalArr = originalArr.split('\n').filter((item: string) => !!item);
        onChange(originalArr);
      }
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let currentFile = event.target.files![0];
    const reader = new FileReader();
    setFile(currentFile)
    if (xlsx) {
      reader.readAsArrayBuffer(currentFile);
    } else {
      reader.readAsText(currentFile);
    }
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target!.result;
      fileform.current!.reset();
      handleChange(fileContent);
    };
  }

  const reset = () => {
    setFile(null)
  }

  return (
    <form className="input-file-form" key="fileform" ref={fileform}>
      <span className="input-file-form-control">
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
        />
        {btnText}
      </span>
      {filename && (
        <div className="input-file-name-list">
          <span>{filename}</span>
          <button
            type="button"
            onClick={() => {
              reset()
              onChange([''])
            }}
          >
            删除
          </button>
        </div>
      )}
      <br />
    </form>
  )
}

export default InputFileReader

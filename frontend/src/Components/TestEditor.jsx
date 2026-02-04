import Editor from "@monaco-editor/react";

const TestEditor = ({ value, onChange }) => {
  return (
    <Editor
      height="100%"
      language="javascript"
      value={value}
      theme="vs-dark"
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
};

export default TestEditor;

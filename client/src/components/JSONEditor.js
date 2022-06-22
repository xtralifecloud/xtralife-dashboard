import { JSONEditor } from "svelte-jsoneditor/dist/jsoneditor.js";
import { useEffect, useRef, memo } from "react";
import "../styles/jsonEditor.css";

const JSONEditorReact = memo((props) => {
  const refContainer = useRef(null);
  const refEditor = useRef(null);

  useEffect(() => {
    refEditor.current = new JSONEditor({
      target: refContainer.current,
      props: {}
    });

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
    // eslint-disable-next-line
  }, [props.content]);

  return (
    <div>
      <div className="jsoneditor-react" ref={refContainer}></div>
    </div>
  );
});

export default JSONEditorReact
